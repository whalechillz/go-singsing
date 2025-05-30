-- Phase 2: 티오프 시간 테이블 생성

-- 코스 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_type') THEN
        CREATE TYPE course_type AS ENUM ('IN', 'OUT', 'FULL');
    END IF;
END$$;

-- 티오프 시간 테이블
CREATE TABLE IF NOT EXISTS tee_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
    golf_course_name VARCHAR(255) NOT NULL,
    play_date DATE NOT NULL,
    tee_time TIME NOT NULL,
    course_type course_type DEFAULT 'FULL',
    team_number INTEGER NOT NULL,
    team_name VARCHAR(100), -- 예: 'A조', 'B조' 또는 커스텀 이름
    participant_ids UUID[] NOT NULL DEFAULT '{}',
    cart_numbers VARCHAR(50)[], -- 카트 번호 배열
    caddie_name VARCHAR(100),
    caddie_phone VARCHAR(20),
    green_fee_paid BOOLEAN DEFAULT FALSE,
    cart_fee_paid BOOLEAN DEFAULT FALSE,
    notes TEXT,
    weather_conditions VARCHAR(100), -- 날씨 정보
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_team_per_time UNIQUE(tour_id, play_date, tee_time, team_number),
    CONSTRAINT max_team_size CHECK (array_length(participant_ids, 1) <= 4)
);

-- 인덱스
CREATE INDEX idx_tee_times_tour_id ON tee_times(tour_id);
CREATE INDEX idx_tee_times_play_date ON tee_times(play_date);
CREATE INDEX idx_tee_times_participant_ids ON tee_times USING GIN(participant_ids);

-- 티오프 변경 이력
CREATE TABLE IF NOT EXISTS tee_time_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tee_time_id UUID REFERENCES tee_times(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    change_type VARCHAR(50), -- 'time_change', 'team_change', 'cancellation'
    previous_time TIME,
    new_time TIME,
    previous_participants UUID[],
    new_participants UUID[],
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
    p_tour_id UUID,
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
        INSERT INTO tee_times (
            tour_id,
            golf_course_name,
            play_date,
            tee_time,
            team_number,
            team_name
        ) VALUES (
            p_tour_id,
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

-- 참가자 팀 배정 검증 함수
CREATE OR REPLACE FUNCTION validate_tee_time_participants()
RETURNS TRIGGER AS $$
DECLARE
    v_participant_count INTEGER;
BEGIN
    -- 동일 시간대 다른 팀에 중복 배정 방지
    SELECT COUNT(*)
    INTO v_participant_count
    FROM tee_times
    WHERE tour_id = NEW.tour_id
    AND play_date = NEW.play_date
    AND id != NEW.id
    AND participant_ids && NEW.participant_ids;
    
    IF v_participant_count > 0 THEN
        RAISE EXCEPTION 'Participant already assigned to another team on the same date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_tee_time_participants_trigger ON tee_times;
CREATE TRIGGER validate_tee_time_participants_trigger
BEFORE INSERT OR UPDATE ON tee_times
FOR EACH ROW
EXECUTE FUNCTION validate_tee_time_participants();

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_tee_times_updated_at ON tee_times;
CREATE TRIGGER update_tee_times_updated_at
BEFORE UPDATE ON tee_times
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 티오프 시간 통계 뷰
CREATE OR REPLACE VIEW tee_time_stats AS
SELECT 
    tt.tour_id,
    tt.play_date,
    tt.golf_course_name,
    COUNT(DISTINCT tt.id) as total_teams,
    COUNT(DISTINCT unnest(tt.participant_ids)) as total_players,
    MIN(tt.tee_time) as first_tee_time,
    MAX(tt.tee_time) as last_tee_time
FROM tee_times tt
GROUP BY tt.tour_id, tt.play_date, tt.golf_course_name;

-- RLS 정책
ALTER TABLE tee_times ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 티오프 시간 관리 가능
CREATE POLICY "Admins can manage all tee times" ON tee_times
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 참가자는 자신이 포함된 티오프 시간만 조회 가능
CREATE POLICY "Participants can view own tee times" ON tee_times
    FOR SELECT USING (
        auth.uid() IN (
            SELECT sp.user_id 
            FROM singsing_participants sp 
            WHERE sp.id = ANY(participant_ids)
        )
    );

-- 코멘트 추가
COMMENT ON TABLE tee_times IS '투어별 티오프 시간 및 조 편성 정보';
COMMENT ON COLUMN tee_times.participant_ids IS '해당 조에 배정된 참가자 ID 배열 (최대 4명)';
COMMENT ON COLUMN tee_times.cart_numbers IS '배정된 카트 번호 배열';