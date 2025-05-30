-- Phase 2: 객실 관리 확장 (기존 singsing_rooms 테이블 활용)

-- UUID 익스텐션 활성화 (이미 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 객실 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
        CREATE TYPE room_type AS ENUM ('single', 'double', 'twin', 'triple', 'suite', 'ondol');
    END IF;
END$$;

-- singsing_rooms 테이블 확장
ALTER TABLE singsing_rooms
ADD COLUMN IF NOT EXISTS room_type room_type DEFAULT 'double',
ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS check_in_date DATE,
ADD COLUMN IF NOT EXISTS check_out_date DATE,
ADD COLUMN IF NOT EXISTS bed_preference VARCHAR(50), -- 'window', 'aisle', 'no_preference'
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 객실 배정 테이블 (참가자와 객실 연결)
CREATE TABLE IF NOT EXISTS room_participant_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES singsing_rooms(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES singsing_participants(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES singsing_schedules(id) ON DELETE CASCADE,
    is_primary_guest BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(participant_id, schedule_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_room_participant_room_id ON room_participant_assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participant_participant_id ON room_participant_assignments(participant_id);
CREATE INDEX IF NOT EXISTS idx_room_participant_schedule_id ON room_participant_assignments(schedule_id);

-- 객실 배정 히스토리 (변경 이력 추적)
CREATE TABLE IF NOT EXISTS room_assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES singsing_rooms(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES singsing_participants(id),
    schedule_id UUID REFERENCES singsing_schedules(id),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    action VARCHAR(50), -- 'assigned', 'removed', 'changed'
    previous_room_id UUID,
    new_room_id UUID,
    change_reason TEXT
);

-- 객실 점유율 계산 함수
CREATE OR REPLACE FUNCTION calculate_room_occupancy(p_schedule_id UUID)
RETURNS TABLE(
    total_rooms INTEGER,
    occupied_rooms INTEGER,
    total_capacity INTEGER,
    total_guests INTEGER,
    occupancy_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT r.id)::INTEGER as total_rooms,
        COUNT(DISTINCT CASE WHEN rpa.id IS NOT NULL THEN r.id END)::INTEGER as occupied_rooms,
        SUM(CASE 
            WHEN r.room_type = 'single' THEN 1
            WHEN r.room_type = 'double' THEN 2
            WHEN r.room_type = 'twin' THEN 2
            WHEN r.room_type = 'triple' THEN 3
            WHEN r.room_type = 'suite' THEN 4
            WHEN r.room_type = 'ondol' THEN 4
            ELSE 2
        END)::INTEGER as total_capacity,
        COUNT(DISTINCT rpa.participant_id)::INTEGER as total_guests,
        CASE 
            WHEN COUNT(DISTINCT r.id) > 0 THEN
                ROUND((COUNT(DISTINCT CASE WHEN rpa.id IS NOT NULL THEN r.id END)::NUMERIC / 
                       COUNT(DISTINCT r.id)) * 100, 2)
            ELSE 0
        END as occupancy_rate
    FROM singsing_rooms r
    LEFT JOIN room_participant_assignments rpa ON rpa.room_id = r.id AND rpa.schedule_id = p_schedule_id
    WHERE r.tour_id = p_schedule_id;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_rooms_updated_at ON singsing_rooms;
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON singsing_rooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 객실 배정 통계 뷰
CREATE OR REPLACE VIEW room_assignment_stats AS
SELECT 
    s.id as schedule_id,
    s.title as schedule_title,
    COUNT(DISTINCT r.id) as total_rooms,
    COUNT(DISTINCT rpa.participant_id) as assigned_guests,
    COUNT(DISTINCT r.id) FILTER (WHERE r.room_type = 'single') as single_rooms,
    COUNT(DISTINCT r.id) FILTER (WHERE r.room_type = 'double') as double_rooms,
    COUNT(DISTINCT r.id) FILTER (WHERE r.room_type = 'twin') as twin_rooms,
    COUNT(DISTINCT r.id) FILTER (WHERE r.room_type = 'triple') as triple_rooms,
    COUNT(DISTINCT r.id) FILTER (WHERE r.room_type = 'ondol') as ondol_rooms
FROM singsing_schedules s
LEFT JOIN singsing_rooms r ON r.tour_id = s.id
LEFT JOIN room_participant_assignments rpa ON rpa.room_id = r.id AND rpa.schedule_id = s.id
GROUP BY s.id, s.title;

-- RLS 정책
ALTER TABLE room_participant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignment_history ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 객실 배정 조회/수정 가능
CREATE POLICY "Admins can manage all room assignments" ON room_participant_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 참가자는 자신의 객실 배정만 조회 가능
CREATE POLICY "Participants can view own room assignment" ON room_participant_assignments
    FOR SELECT USING (
        participant_id IN (
            SELECT id FROM singsing_participants 
            WHERE user_id = auth.uid()
        )
    );

-- 코멘트 추가
COMMENT ON TABLE room_participant_assignments IS '참가자별 객실 배정 정보';
COMMENT ON COLUMN singsing_rooms.bed_preference IS '침대 위치 선호도: window(창가), aisle(복도), no_preference(상관없음)';