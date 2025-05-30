-- Phase 2: 객실 배정 테이블 생성

-- UUID 익스텐션 활성화 (이미 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 객실 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
        CREATE TYPE room_type AS ENUM ('single', 'double', 'twin', 'triple', 'suite', 'ondol');
    END IF;
END$$;

-- 객실 배정 테이블
CREATE TABLE IF NOT EXISTS room_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES singsing_participants(id) ON DELETE CASCADE,
    room_number VARCHAR(50),
    room_type room_type DEFAULT 'double',
    hotel_name VARCHAR(255),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    roommate_ids UUID[] DEFAULT '{}',
    bed_preference VARCHAR(50), -- 'window', 'aisle', 'no_preference'
    special_requests TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(tour_id, participant_id, check_in_date)
);

-- 인덱스
CREATE INDEX idx_room_assignments_tour_id ON room_assignments(tour_id);
CREATE INDEX idx_room_assignments_participant_id ON room_assignments(participant_id);
CREATE INDEX idx_room_assignments_dates ON room_assignments(check_in_date, check_out_date);

-- 객실 배정 히스토리 (변경 이력 추적)
CREATE TABLE IF NOT EXISTS room_assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_assignment_id UUID REFERENCES room_assignments(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    previous_room_number VARCHAR(50),
    new_room_number VARCHAR(50),
    previous_roommate_ids UUID[],
    new_roommate_ids UUID[],
    change_reason TEXT
);

-- 객실 배정 업데이트 트리거
CREATE OR REPLACE FUNCTION log_room_assignment_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.room_number IS DISTINCT FROM NEW.room_number OR 
       OLD.roommate_ids IS DISTINCT FROM NEW.roommate_ids THEN
        INSERT INTO room_assignment_history (
            room_assignment_id,
            changed_by,
            previous_room_number,
            new_room_number,
            previous_roommate_ids,
            new_roommate_ids
        ) VALUES (
            NEW.id,
            auth.uid(),
            OLD.room_number,
            NEW.room_number,
            OLD.roommate_ids,
            NEW.roommate_ids
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS room_assignment_changes_trigger ON room_assignments;
CREATE TRIGGER room_assignment_changes_trigger
AFTER UPDATE ON room_assignments
FOR EACH ROW
EXECUTE FUNCTION log_room_assignment_changes();

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_room_assignments_updated_at ON room_assignments;
CREATE TRIGGER update_room_assignments_updated_at
BEFORE UPDATE ON room_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 객실 배정 통계 뷰
CREATE OR REPLACE VIEW room_assignment_stats AS
SELECT 
    ra.tour_id,
    ra.hotel_name,
    ra.check_in_date,
    COUNT(DISTINCT ra.room_number) as total_rooms,
    COUNT(DISTINCT ra.participant_id) as total_guests,
    COUNT(DISTINCT ra.room_number) FILTER (WHERE ra.room_type = 'single') as single_rooms,
    COUNT(DISTINCT ra.room_number) FILTER (WHERE ra.room_type = 'double') as double_rooms,
    COUNT(DISTINCT ra.room_number) FILTER (WHERE ra.room_type = 'twin') as twin_rooms,
    COUNT(DISTINCT ra.room_number) FILTER (WHERE ra.room_type = 'triple') as triple_rooms,
    COUNT(DISTINCT ra.room_number) FILTER (WHERE ra.room_type = 'ondol') as ondol_rooms
FROM room_assignments ra
GROUP BY ra.tour_id, ra.hotel_name, ra.check_in_date;

-- RLS 정책
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 객실 배정 조회/수정 가능
CREATE POLICY "Admins can manage all room assignments" ON room_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 참가자는 자신의 객실 배정만 조회 가능
CREATE POLICY "Participants can view own room assignment" ON room_assignments
    FOR SELECT USING (
        participant_id IN (
            SELECT id FROM singsing_participants 
            WHERE user_id = auth.uid()
        )
    );

-- 코멘트 추가
COMMENT ON TABLE room_assignments IS '투어별 객실 배정 정보';
COMMENT ON COLUMN room_assignments.roommate_ids IS '룸메이트 참가자 ID 배열';
COMMENT ON COLUMN room_assignments.bed_preference IS '침대 위치 선호도: window(창가), aisle(복도), no_preference(상관없음)';