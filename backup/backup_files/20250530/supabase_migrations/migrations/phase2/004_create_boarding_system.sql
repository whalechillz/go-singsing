-- Phase 2: 탑승 관리 시스템 확장 (기존 테이블 활용 및 보완)

-- 버스 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bus_type') THEN
        CREATE TYPE bus_type AS ENUM ('45_seater', '25_seater', '15_seater', 'van');
    END IF;
END$$;

-- 탑승 버스 정보 테이블 (새로 생성)
CREATE TABLE IF NOT EXISTS boarding_buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES singsing_schedules(id) ON DELETE CASCADE,
    bus_number INTEGER NOT NULL,
    bus_type bus_type DEFAULT '45_seater',
    bus_company VARCHAR(255),
    license_plate VARCHAR(50),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    max_capacity INTEGER DEFAULT 45,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    return_date DATE,
    return_time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_bus_schedule UNIQUE(schedule_id, bus_number, departure_date)
);

-- 탑승자 배정 테이블
CREATE TABLE IF NOT EXISTS boarding_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES boarding_buses(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES singsing_participants(id) ON DELETE CASCADE,
    boarding_place_id UUID REFERENCES singsing_boarding_places(id),
    seat_number VARCHAR(10),
    boarding_time TIME,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    checked_in_by UUID REFERENCES auth.users(id),
    no_show BOOLEAN DEFAULT FALSE,
    no_show_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bus_id, participant_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_boarding_buses_schedule_id ON boarding_buses(schedule_id);
CREATE INDEX IF NOT EXISTS idx_boarding_buses_departure_date ON boarding_buses(departure_date);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_bus_id ON boarding_assignments(bus_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_participant_id ON boarding_assignments(participant_id);

-- 좌석 배정 이력
CREATE TABLE IF NOT EXISTS seat_assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boarding_assignment_id UUID REFERENCES boarding_assignments(id) ON DELETE CASCADE,
    previous_seat VARCHAR(10),
    new_seat VARCHAR(10),
    previous_bus_id UUID,
    new_bus_id UUID,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    reason TEXT
);

-- 버스별 탑승률 계산 함수
CREATE OR REPLACE FUNCTION calculate_bus_occupancy(p_bus_id UUID)
RETURNS TABLE(
    total_capacity INTEGER,
    assigned_seats INTEGER,
    checked_in INTEGER,
    no_show INTEGER,
    occupancy_rate NUMERIC,
    checkin_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.max_capacity as total_capacity,
        COUNT(ba.id)::INTEGER as assigned_seats,
        COUNT(ba.id) FILTER (WHERE ba.checked_in = TRUE)::INTEGER as checked_in,
        COUNT(ba.id) FILTER (WHERE ba.no_show = TRUE)::INTEGER as no_show,
        CASE 
            WHEN b.max_capacity > 0 THEN
                ROUND((COUNT(ba.id)::NUMERIC / b.max_capacity) * 100, 2)
            ELSE 0
        END as occupancy_rate,
        CASE 
            WHEN COUNT(ba.id) > 0 THEN
                ROUND((COUNT(ba.id) FILTER (WHERE ba.checked_in = TRUE)::NUMERIC / 
                       COUNT(ba.id)) * 100, 2)
            ELSE 0
        END as checkin_rate
    FROM boarding_buses b
    LEFT JOIN boarding_assignments ba ON ba.bus_id = b.id
    WHERE b.id = p_bus_id
    GROUP BY b.id, b.max_capacity;
END;
$$ LANGUAGE plpgsql;

-- 탑승 인원 검증 트리거
CREATE OR REPLACE FUNCTION validate_boarding_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_current_count INTEGER;
    v_max_capacity INTEGER;
BEGIN
    -- 버스 최대 수용 인원 확인
    SELECT b.max_capacity, COUNT(ba.id)
    INTO v_max_capacity, v_current_count
    FROM boarding_buses b
    LEFT JOIN boarding_assignments ba ON ba.bus_id = b.id AND ba.id != NEW.id
    WHERE b.id = NEW.bus_id
    GROUP BY b.max_capacity;
    
    IF v_current_count >= v_max_capacity THEN
        RAISE EXCEPTION 'Bus capacity exceeded. Max: %, Current: %', v_max_capacity, v_current_count;
    END IF;
    
    -- 동일 참가자 중복 배정 방지
    IF EXISTS (
        SELECT 1 FROM boarding_assignments ba
        JOIN boarding_buses b1 ON b1.id = ba.bus_id
        JOIN boarding_buses b2 ON b2.id = NEW.bus_id
        WHERE ba.participant_id = NEW.participant_id
        AND b1.schedule_id = b2.schedule_id
        AND b1.departure_date = b2.departure_date
        AND ba.id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Participant already assigned to another bus on the same date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_boarding_capacity_trigger ON boarding_assignments;
CREATE TRIGGER validate_boarding_capacity_trigger
BEFORE INSERT OR UPDATE ON boarding_assignments
FOR EACH ROW
EXECUTE FUNCTION validate_boarding_capacity();

-- 탑승 체크인 함수
CREATE OR REPLACE FUNCTION check_in_passenger(
    p_assignment_id UUID,
    p_checked_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE boarding_assignments
    SET 
        checked_in = TRUE,
        checked_in_at = NOW(),
        checked_in_by = p_checked_by
    WHERE id = p_assignment_id
    AND checked_in = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_boarding_buses_updated_at ON boarding_buses;
CREATE TRIGGER update_boarding_buses_updated_at
BEFORE UPDATE ON boarding_buses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 탑승 스케줄 통계 뷰
CREATE OR REPLACE VIEW boarding_schedule_stats AS
SELECT 
    bb.schedule_id,
    bb.departure_date,
    COUNT(DISTINCT bb.id) as total_buses,
    SUM(bb.max_capacity) as total_capacity,
    COUNT(DISTINCT ba.participant_id) as total_passengers,
    COUNT(DISTINCT ba.boarding_place_id) as total_boarding_places,
    AVG(
        CASE 
            WHEN bb.max_capacity > 0 THEN
                (SELECT COUNT(*) FROM boarding_assignments WHERE bus_id = bb.id)::NUMERIC / bb.max_capacity * 100
            ELSE 0
        END
    )::NUMERIC(5,2) as avg_occupancy_rate,
    MIN(bb.departure_time) as earliest_departure,
    MAX(bb.departure_time) as latest_departure
FROM boarding_buses bb
LEFT JOIN boarding_assignments ba ON ba.bus_id = bb.id
GROUP BY bb.schedule_id, bb.departure_date;

-- 기존 boarding_guide_* 테이블과의 연동 뷰
CREATE OR REPLACE VIEW boarding_guide_integration AS
SELECT 
    s.id as schedule_id,
    s.title as schedule_title,
    bb.bus_number,
    bb.driver_name,
    bb.driver_phone,
    bgr.title as route_title,
    bgc.name as contact_name,
    bgc.phone as contact_phone,
    bgn.title as notice_title
FROM singsing_schedules s
LEFT JOIN boarding_buses bb ON bb.schedule_id = s.id
LEFT JOIN boarding_guide_routes bgr ON bgr.title LIKE '%' || s.title || '%'
LEFT JOIN boarding_guide_contacts bgc ON bgc.name IS NOT NULL
LEFT JOIN boarding_guide_notices bgn ON bgn.title IS NOT NULL;

-- RLS 정책
ALTER TABLE boarding_buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_assignments ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 탑승 정보 관리 가능
CREATE POLICY "Admins can manage all boarding info" ON boarding_buses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 참가자는 자신의 탑승 정보만 조회 가능
CREATE POLICY "Participants can view own boarding info" ON boarding_assignments
    FOR SELECT USING (
        participant_id IN (
            SELECT id FROM singsing_participants 
            WHERE user_id = auth.uid()
        )
    );

-- 스탭은 체크인 업데이트 가능
CREATE POLICY "Staff can update checkins" ON boarding_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 코멘트 추가
COMMENT ON TABLE boarding_buses IS '투어별 버스 정보';
COMMENT ON TABLE boarding_assignments IS '버스별 탑승자 배정 및 체크인';
COMMENT ON COLUMN boarding_assignments.seat_number IS '좌석 번호 (선택사항)';