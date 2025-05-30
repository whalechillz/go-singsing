-- Phase 2: 탑승 스케줄 테이블 생성

-- 버스 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bus_type') THEN
        CREATE TYPE bus_type AS ENUM ('45_seater', '25_seater', '15_seater', 'van');
    END IF;
END$$;

-- 탑승 스케줄 테이블
CREATE TABLE IF NOT EXISTS boarding_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
    boarding_place_id UUID NOT NULL REFERENCES boarding_places(id),
    schedule_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    bus_number INTEGER NOT NULL,
    bus_type bus_type DEFAULT '45_seater',
    bus_company VARCHAR(255),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    participant_ids UUID[] DEFAULT '{}',
    seat_assignments JSONB, -- {"participant_id": "seat_number", ...}
    max_capacity INTEGER DEFAULT 45,
    departure_notes TEXT,
    arrival_time TIME,
    arrival_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_bus_schedule UNIQUE(tour_id, schedule_date, bus_number, departure_time)
);

-- 인덱스
CREATE INDEX idx_boarding_schedules_tour_id ON boarding_schedules(tour_id);
CREATE INDEX idx_boarding_schedules_date ON boarding_schedules(schedule_date);
CREATE INDEX idx_boarding_schedules_place ON boarding_schedules(boarding_place_id);
CREATE INDEX idx_boarding_schedules_participants ON boarding_schedules USING GIN(participant_ids);

-- 좌석 배정 이력
CREATE TABLE IF NOT EXISTS seat_assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boarding_schedule_id UUID REFERENCES boarding_schedules(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES singsing_participants(id),
    previous_seat VARCHAR(10),
    new_seat VARCHAR(10),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    reason TEXT
);

-- 탑승 체크인 기록
CREATE TABLE IF NOT EXISTS boarding_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boarding_schedule_id UUID REFERENCES boarding_schedules(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES singsing_participants(id),
    checked_in_at TIMESTAMP,
    checked_in_by UUID REFERENCES auth.users(id),
    no_show BOOLEAN DEFAULT FALSE,
    no_show_reason TEXT,
    notes TEXT,
    UNIQUE(boarding_schedule_id, participant_id)
);

-- 버스 정보 테이블
CREATE TABLE IF NOT EXISTS bus_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_company VARCHAR(255) NOT NULL,
    bus_number VARCHAR(50) NOT NULL,
    bus_type bus_type NOT NULL,
    license_plate VARCHAR(50),
    max_capacity INTEGER NOT NULL,
    has_wifi BOOLEAN DEFAULT FALSE,
    has_usb_charging BOOLEAN DEFAULT FALSE,
    has_toilet BOOLEAN DEFAULT FALSE,
    insurance_info JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bus_company, bus_number)
);

-- 샘플 버스 회사 데이터
INSERT INTO bus_info (bus_company, bus_number, bus_type, max_capacity) 
VALUES 
    ('순천관광버스', '1호차', '45_seater', 45),
    ('순천관광버스', '2호차', '45_seater', 45),
    ('여수관광', '특1호', '25_seater', 25)
ON CONFLICT (bus_company, bus_number) DO NOTHING;

-- 탑승 인원 검증 함수
CREATE OR REPLACE FUNCTION validate_boarding_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_participant_count INTEGER;
BEGIN
    v_participant_count := array_length(NEW.participant_ids, 1);
    
    IF v_participant_count > NEW.max_capacity THEN
        RAISE EXCEPTION 'Number of participants (%) exceeds bus capacity (%)', 
            v_participant_count, NEW.max_capacity;
    END IF;
    
    -- 동일 시간 중복 탑승 방지
    IF EXISTS (
        SELECT 1 FROM boarding_schedules bs
        WHERE bs.tour_id = NEW.tour_id
        AND bs.schedule_date = NEW.schedule_date
        AND bs.id != NEW.id
        AND bs.participant_ids && NEW.participant_ids
        AND bs.departure_time = NEW.departure_time
    ) THEN
        RAISE EXCEPTION 'Participant already assigned to another bus at the same time';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_boarding_capacity_trigger ON boarding_schedules;
CREATE TRIGGER validate_boarding_capacity_trigger
BEFORE INSERT OR UPDATE ON boarding_schedules
FOR EACH ROW
EXECUTE FUNCTION validate_boarding_capacity();

-- 탑승률 계산 함수
CREATE OR REPLACE FUNCTION calculate_boarding_rate(p_boarding_schedule_id UUID)
RETURNS TABLE(
    total_assigned INTEGER,
    total_checked_in INTEGER,
    no_show_count INTEGER,
    boarding_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        array_length(bs.participant_ids, 1) as total_assigned,
        COUNT(bc.id) FILTER (WHERE bc.checked_in_at IS NOT NULL)::INTEGER as total_checked_in,
        COUNT(bc.id) FILTER (WHERE bc.no_show = TRUE)::INTEGER as no_show_count,
        CASE 
            WHEN array_length(bs.participant_ids, 1) > 0 THEN
                ROUND((COUNT(bc.id) FILTER (WHERE bc.checked_in_at IS NOT NULL)::NUMERIC / 
                       array_length(bs.participant_ids, 1)) * 100, 2)
            ELSE 0
        END as boarding_rate
    FROM boarding_schedules bs
    LEFT JOIN boarding_checkins bc ON bc.boarding_schedule_id = bs.id
    WHERE bs.id = p_boarding_schedule_id
    GROUP BY bs.id, bs.participant_ids;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_boarding_schedules_updated_at ON boarding_schedules;
CREATE TRIGGER update_boarding_schedules_updated_at
BEFORE UPDATE ON boarding_schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 탑승 스케줄 통계 뷰
CREATE OR REPLACE VIEW boarding_schedule_stats AS
SELECT 
    bs.tour_id,
    bs.schedule_date,
    COUNT(DISTINCT bs.id) as total_buses,
    COUNT(DISTINCT bs.boarding_place_id) as total_boarding_places,
    SUM(array_length(bs.participant_ids, 1)) as total_passengers,
    AVG(array_length(bs.participant_ids, 1)::NUMERIC / bs.max_capacity * 100)::NUMERIC(5,2) as avg_occupancy_rate,
    MIN(bs.departure_time) as earliest_departure,
    MAX(bs.departure_time) as latest_departure
FROM boarding_schedules bs
GROUP BY bs.tour_id, bs.schedule_date;

-- RLS 정책
ALTER TABLE boarding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_checkins ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 탑승 스케줄 관리 가능
CREATE POLICY "Admins can manage all boarding schedules" ON boarding_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 참가자는 자신이 포함된 탑승 스케줄만 조회 가능
CREATE POLICY "Participants can view own boarding schedule" ON boarding_schedules
    FOR SELECT USING (
        auth.uid() IN (
            SELECT sp.user_id 
            FROM singsing_participants sp 
            WHERE sp.id = ANY(participant_ids)
        )
    );

-- 스탭은 체크인 관리 가능
CREATE POLICY "Staff can manage checkins" ON boarding_checkins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 코멘트 추가
COMMENT ON TABLE boarding_schedules IS '투어별 버스 탑승 스케줄 및 좌석 배정';
COMMENT ON COLUMN boarding_schedules.seat_assignments IS '좌석 배정 정보 JSON 형식 {"participant_id": "seat_number"}';
COMMENT ON TABLE boarding_checkins IS '탑승 체크인 기록';