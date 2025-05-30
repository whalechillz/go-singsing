-- Phase 2: 투어 테이블 확장
-- 투어 상태 및 최대 참가자 수 필드 추가

-- 투어 상태 타입 생성
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tour_status') THEN
        CREATE TYPE tour_status AS ENUM ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled');
    END IF;
END$$;

-- tours 테이블에 새로운 컬럼 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS status tour_status DEFAULT 'upcoming',
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS golf_course VARCHAR(255),
ADD COLUMN IF NOT EXISTS departure_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tours_status ON singsing_tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_start_date ON singsing_tours(start_date);

-- 기존 데이터 업데이트 (날짜 기준으로 상태 설정)
UPDATE singsing_tours 
SET status = CASE 
    WHEN start_date > CURRENT_DATE THEN 'upcoming'::tour_status
    WHEN end_date < CURRENT_DATE THEN 'completed'::tour_status
    ELSE 'ongoing'::tour_status
END
WHERE status IS NULL;

-- 현재 참가자 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_tour_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE singsing_tours 
        SET current_participants = (
            SELECT COUNT(*) FROM singsing_participants 
            WHERE tour_id = NEW.tour_id
        )
        WHERE id = NEW.tour_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE singsing_tours 
        SET current_participants = (
            SELECT COUNT(*) FROM singsing_participants 
            WHERE tour_id = OLD.tour_id
        )
        WHERE id = OLD.tour_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_tour_count_trigger ON singsing_participants;
CREATE TRIGGER update_tour_count_trigger
AFTER INSERT OR DELETE ON singsing_participants
FOR EACH ROW
EXECUTE FUNCTION update_tour_participant_count();

-- 기존 데이터에 대한 참가자 수 업데이트
UPDATE singsing_tours t
SET current_participants = (
    SELECT COUNT(*) 
    FROM singsing_participants p 
    WHERE p.tour_id = t.id
);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_tours_updated_at ON singsing_tours;
CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON singsing_tours
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();