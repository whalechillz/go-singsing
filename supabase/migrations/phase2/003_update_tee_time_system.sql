-- Phase 2: 티오프 시간 시스템 확장 (기존 테이블 활용)

-- 코스 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_type') THEN
        CREATE TYPE course_type AS ENUM ('IN', 'OUT', 'FULL');
    END IF;
END$$;

-- singsing_tee_times 테이블 확장
ALTER TABLE singsing_tee_times
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES singsing_schedules(id),
ADD COLUMN IF NOT EXISTS golf_course_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS play_date DATE,
ADD COLUMN IF NOT EXISTS tee_time TIME,
ADD COLUMN IF NOT EXISTS course_type course_type DEFAULT 'FULL',
ADD COLUMN IF NOT EXISTS team_number INTEGER,
ADD COLUMN IF NOT EXISTS team_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS cart_numbers VARCHAR(50)[],
ADD COLUMN IF NOT EXISTS caddie_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS caddie_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS green_fee_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cart_fee_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS weather_conditions VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tee_times_schedule_id ON singsing_tee_times(schedule_id);
CREATE INDEX IF NOT EXISTS idx_tee_times_play_date ON singsing_tee_times(play_date);

-- singsing_tee_time_players 테이블 확장 (기존 테이블 활용)
ALTER TABLE singsing_tee_time_players
ADD COLUMN IF NOT EXISTS handicap INTEGER,
ADD COLUMN IF NOT EXISTS cart_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_team_leader BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 티오프 변경 이력
CREATE TABLE IF NOT EXISTS tee_time_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tee_time_id UUID REFERENCES singsing_tee_times(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    change_type VARCHAR(50), -- 'time_change', 'team_change', 'cancellation'
    previous_time TIME,
    new_time TIME,
    previous_players UUID[],
    new_players UUID[],
    reason TEXT
);

-- 골프장 정보 테이블 (재사용을 위해)
CREATE TABLE IF NOT EXISTS golf_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    holes INTEGER DEFAULT 18,
    par INTEGER DEFAULT 72,
    cart_mandatory BOOLEAN DEFAULT TRUE,
    facilities JSONB, -- {locker_room: true, restaurant: true, practice_range: true, ...}
    green_fee_weekday INTEGER,
    green_fee_weekend INTEGER,
    cart_fee INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 샘플 골프장 데이터 삽입
INSERT INTO golf_courses (name, address, phone, green_fee_weekday, green_fee_weekend, cart_fee) 
VALUES 
    ('파인힐스CC', '전남 순천시', '061-123-4567', 55000, 70000, 16000),
    ('오션비치CC', '전남 여수시', '061-234-5678', 60000, 75000, 18000),
    ('순천CC', '전남 순천시', '061-345-6789', 50000, 65000, 15000)
ON CONFLICT (name) DO NOTHING;

-- 티오프 시간 자동 생성 함수 (10분 간격)
CREATE OR REPLACE FUNCTION generate_tee_times(
    p_schedule_id UUID,
    p_golf_course_name VARCHAR,
    p_play_date DATE,
    p_start_time TIME,
    p_team_count INTEGER,
    p_interval_minutes INTEGER DEFAULT 10
)
RETURNS VOID AS $$
DECLARE
    v_current_time TIME;
    v_team_number INTEGER;
BEGIN
    v_current_time := p_start_time;
    
    FOR v_team_number IN 1..p_team_count LOOP
        INSERT INTO singsing_tee_times (
            schedule_id,
            golf_course_name,
            play_date,
            tee_time,
            team_number,
            team_name
        ) VALUES (
            p_schedule_id,
            p_golf_course_name,
            p_play_date,
            v_current_time,
            v_team_number,
            v_team_number || '조'
        );
        
        v_current_time := v_current_time + (p_interval_minutes || ' minutes')::INTERVAL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 팀별 참가자 수 계산 함수
CREATE OR REPLACE FUNCTION get_team_player_count(p_tee_time_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM singsing_tee_time_players
        WHERE tee_time_id = p_tee_time_id
    );
END;
$$ LANGUAGE plpgsql;

-- 참가자 팀 배정 검증 트리거
CREATE OR REPLACE FUNCTION validate_tee_time_players()
RETURNS TRIGGER AS $$
DECLARE
    v_player_count INTEGER;
BEGIN
    -- 팀당 최대 4명 제한
    v_player_count := get_team_player_count(NEW.tee_time_id);
    
    IF v_player_count >= 4 THEN
        RAISE EXCEPTION 'Team already has 4 players';
    END IF;
    
    -- 동일 시간대 중복 배정 방지
    IF EXISTS (
        SELECT 1
        FROM singsing_tee_time_players ttp
        JOIN singsing_tee_times tt ON tt.id = ttp.tee_time_id
        JOIN singsing_tee_times tt2 ON tt2.id = NEW.tee_time_id
        WHERE ttp.participant_id = NEW.participant_id
        AND tt.play_date = tt2.play_date
        AND tt.id != NEW.tee_time_id
    ) THEN
        RAISE EXCEPTION 'Participant already assigned to another team on the same date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_tee_time_players_trigger ON singsing_tee_time_players;
CREATE TRIGGER validate_tee_time_players_trigger
BEFORE INSERT OR UPDATE ON singsing_tee_time_players
FOR EACH ROW
EXECUTE FUNCTION validate_tee_time_players();

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_tee_times_updated_at ON singsing_tee_times;
CREATE TRIGGER update_tee_times_updated_at
BEFORE UPDATE ON singsing_tee_times
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 티오프 시간 통계 뷰
CREATE OR REPLACE VIEW tee_time_stats AS
SELECT 
    tt.schedule_id,
    tt.play_date,
    tt.golf_course_name,
    COUNT(DISTINCT tt.id) as total_teams,
    COUNT(DISTINCT ttp.participant_id) as total_players,
    MIN(tt.tee_time) as first_tee_time,
    MAX(tt.tee_time) as last_tee_time
FROM singsing_tee_times tt
LEFT JOIN singsing_tee_time_players ttp ON ttp.tee_time_id = tt.id
WHERE tt.schedule_id IS NOT NULL
GROUP BY tt.schedule_id, tt.play_date, tt.golf_course_name;

-- RLS 정책
ALTER TABLE singsing_tee_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tee_time_players ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 티오프 시간 관리 가능
CREATE POLICY "Admins can manage all tee times" ON singsing_tee_times
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 참가자는 자신이 포함된 티오프 시간만 조회 가능
CREATE POLICY "Participants can view own tee times" ON singsing_tee_times
    FOR SELECT USING (
        id IN (
            SELECT ttp.tee_time_id 
            FROM singsing_tee_time_players ttp
            JOIN singsing_participants sp ON sp.id = ttp.participant_id
            WHERE sp.user_id = auth.uid()
        )
    );

-- 코멘트 추가
COMMENT ON COLUMN singsing_tee_times.schedule_id IS '투어 스케줄 ID';
COMMENT ON TABLE singsing_tee_time_players IS '티오프 시간별 참가자 배정';