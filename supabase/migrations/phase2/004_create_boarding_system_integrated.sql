-- Phase 2: 탑승 관리 시스템 보완 (기존 테이블과 연동)
-- 기존: singsing_boarding_places (탑승지 정보), singsing_boarding_schedules (스케줄)
-- 신규: 버스별 관리 및 참가자 배정 시스템 추가

-- 버스 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bus_type') THEN
        CREATE TYPE bus_type AS ENUM ('45_seater', '25_seater', '15_seater', 'van');
    END IF;
END$$;

-- 탑승 버스 정보 테이블 (버스별 관리)
CREATE TABLE IF NOT EXISTS boarding_buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES singsing_schedules(id) ON DELETE CASCADE,
    boarding_schedule_id UUID REFERENCES singsing_boarding_schedules(id), -- 기존 탑승 스케줄과 연결
    bus_number INTEGER NOT NULL,
    bus_type bus_type DEFAULT '45_seater',
    bus_company VARCHAR(255),
    license_plate VARCHAR(50),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    guide_name VARCHAR(100),
    guide_phone VARCHAR(20),
    max_capacity INTEGER DEFAULT 45,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_bus_schedule UNIQUE(schedule_id, bus_number)
);

-- 탑승자 배정 테이블 (참가자별 버스 및 탑승지 배정)
CREATE TABLE IF NOT EXISTS boarding_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES singsing_participants(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES boarding_buses(id) ON DELETE CASCADE,
    boarding_place_id UUID REFERENCES singsing_boarding_places(id), -- 개별 탑승지 지정 가능
    seat_number VARCHAR(10),
    boarding_time TIME, -- 개별 탑승 시간 (기본값은 boarding_schedules에서)
    special_requests TEXT, -- 특별 요청사항
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    checked_in_by UUID REFERENCES auth.users(id),
    no_show BOOLEAN DEFAULT FALSE,
    no_show_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(participant_id, bus_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_boarding_buses_schedule_id ON boarding_buses(schedule_id);
CREATE INDEX IF NOT EXISTS idx_boarding_buses_boarding_schedule_id ON boarding_buses(boarding_schedule_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_bus_id ON boarding_assignments(bus_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_participant_id ON boarding_assignments(participant_id);
CREATE INDEX IF NOT EXISTS idx_boarding_assignments_boarding_place_id ON boarding_assignments(boarding_place_id);

-- 탑승 체크인 로그 (체크인 기록 추적)
CREATE TABLE IF NOT EXISTS boarding_checkin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES boarding_assignments(id) ON DELETE CASCADE,
    action VARCHAR(50), -- 'checked_in', 'cancelled', 'no_show'
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP DEFAULT NOW(),
    location VARCHAR(255),
    notes TEXT
);

-- 버스별 탑승 현황 뷰 (기존 테이블과 통합)
CREATE OR REPLACE VIEW bus_boarding_status AS
SELECT 
    bb.id as bus_id,
    bb.bus_number,
    bb.driver_name,
    bb.driver_phone,
    s.title as schedule_title,
    s.date as tour_date,
    bs.depart_time,
    bs.arrive_time,
    bp.name as boarding_place,
    bp.address as boarding_address,
    COUNT(DISTINCT ba.participant_id) as assigned_count,
    COUNT(DISTINCT ba.participant_id) FILTER (WHERE ba.checked_in = TRUE) as checked_in_count,
    bb.max_capacity,
    ROUND((COUNT(DISTINCT ba.participant_id)::NUMERIC / bb.max_capacity) * 100, 2) as occupancy_rate
FROM boarding_buses bb
JOIN singsing_schedules s ON s.id = bb.schedule_id
LEFT JOIN singsing_boarding_schedules bs ON bs.id = bb.boarding_schedule_id
LEFT JOIN singsing_boarding_places bp ON bp.id = bs.place_id
LEFT JOIN boarding_assignments ba ON ba.bus_id = bb.id
GROUP BY bb.id, s.id, bs.id, bp.id;

-- 참가자별 탑승 정보 뷰
CREATE OR REPLACE VIEW participant_boarding_info AS
SELECT 
    p.id as participant_id,
    p.name as participant_name,
    p.phone as participant_phone,
    s.title as tour_title,
    s.date as tour_date,
    bb.bus_number,
    bb.driver_name,
    bb.driver_phone,
    COALESCE(bp_individual.name, bp_default.name) as boarding_place,
    COALESCE(bp_individual.address, bp_default.address) as boarding_address,
    COALESCE(ba.boarding_time, bs.depart_time) as boarding_time,
    ba.seat_number,
    ba.checked_in,
    ba.special_requests
FROM singsing_participants p
JOIN boarding_assignments ba ON ba.participant_id = p.id
JOIN boarding_buses bb ON bb.id = ba.bus_id
JOIN singsing_schedules s ON s.id = bb.schedule_id
LEFT JOIN singsing_boarding_schedules bs ON bs.id = bb.boarding_schedule_id
LEFT JOIN singsing_boarding_places bp_default ON bp_default.id = bs.place_id
LEFT JOIN singsing_boarding_places bp_individual ON bp_individual.id = ba.boarding_place_id;

-- 버스 자동 생성 함수 (스케줄별)
CREATE OR REPLACE FUNCTION create_buses_for_schedule(
    p_schedule_id UUID,
    p_bus_count INTEGER,
    p_bus_type bus_type DEFAULT '45_seater',
    p_bus_company VARCHAR DEFAULT '순천관광버스'
)
RETURNS VOID AS $$
DECLARE
    v_boarding_schedule_id UUID;
    v_bus_number INTEGER;
BEGIN
    -- 첫 번째 탑승 스케줄 찾기
    SELECT id INTO v_boarding_schedule_id
    FROM singsing_boarding_schedules
    WHERE tour_id = p_schedule_id
    ORDER BY date, depart_time
    LIMIT 1;
    
    -- 버스 생성
    FOR v_bus_number IN 1..p_bus_count LOOP
        INSERT INTO boarding_buses (
            schedule_id,
            boarding_schedule_id,
            bus_number,
            bus_type,
            bus_company
        ) VALUES (
            p_schedule_id,
            v_boarding_schedule_id,
            v_bus_number,
            p_bus_type,
            p_bus_company
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 참가자 자동 배정 함수 (균등 분배)
CREATE OR REPLACE FUNCTION auto_assign_participants_to_buses(p_schedule_id UUID)
RETURNS VOID AS $$
DECLARE
    v_participant RECORD;
    v_bus_id UUID;
    v_current_bus_index INTEGER := 0;
    v_bus_count INTEGER;
    v_buses UUID[];
BEGIN
    -- 버스 목록 가져오기
    SELECT array_agg(id ORDER BY bus_number) INTO v_buses
    FROM boarding_buses
    WHERE schedule_id = p_schedule_id;
    
    v_bus_count := array_length(v_buses, 1);
    
    IF v_bus_count IS NULL OR v_bus_count = 0 THEN
        RAISE EXCEPTION 'No buses found for schedule %', p_schedule_id;
    END IF;
    
    -- 참가자 순회하며 배정
    FOR v_participant IN 
        SELECT id 
        FROM singsing_participants 
        WHERE tour_id = p_schedule_id
        ORDER BY created_at
    LOOP
        v_current_bus_index := (v_current_bus_index % v_bus_count) + 1;
        v_bus_id := v_buses[v_current_bus_index];
        
        INSERT INTO boarding_assignments (participant_id, bus_id)
        VALUES (v_participant.id, v_bus_id)
        ON CONFLICT (participant_id, bus_id) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 탑승 체크인 함수
CREATE OR REPLACE FUNCTION check_in_passenger(
    p_participant_id UUID,
    p_schedule_id UUID,
    p_checked_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_assignment_id UUID;
BEGIN
    -- 배정 정보 찾기
    SELECT ba.id INTO v_assignment_id
    FROM boarding_assignments ba
    JOIN boarding_buses bb ON bb.id = ba.bus_id
    WHERE ba.participant_id = p_participant_id
    AND bb.schedule_id = p_schedule_id;
    
    IF v_assignment_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 체크인 처리
    UPDATE boarding_assignments
    SET 
        checked_in = TRUE,
        checked_in_at = NOW(),
        checked_in_by = COALESCE(p_checked_by, auth.uid())
    WHERE id = v_assignment_id;
    
    -- 로그 기록
    INSERT INTO boarding_checkin_logs (assignment_id, action, performed_by)
    VALUES (v_assignment_id, 'checked_in', COALESCE(p_checked_by, auth.uid()));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_boarding_buses_updated_at ON boarding_buses;
CREATE TRIGGER update_boarding_buses_updated_at
BEFORE UPDATE ON boarding_buses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책
ALTER TABLE boarding_buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_checkin_logs ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 정보 관리 가능
CREATE POLICY "Admins can manage all boarding info" ON boarding_buses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'office_admin', 'staff')
        )
    );

-- 참가자는 자신의 정보만 조회
CREATE POLICY "Participants can view own boarding info" ON boarding_assignments
    FOR SELECT USING (
        participant_id IN (
            SELECT id FROM singsing_participants 
            WHERE user_id = auth.uid()
        )
    );

-- 코멘트 추가
COMMENT ON TABLE boarding_buses IS '투어별 버스 정보 (버스별 관리)';
COMMENT ON TABLE boarding_assignments IS '참가자별 버스 배정 및 탑승지 정보';
COMMENT ON COLUMN boarding_assignments.boarding_place_id IS '개별 탑승지 (NULL이면 버스의 기본 탑승지 사용)';
COMMENT ON VIEW bus_boarding_status IS '버스별 탑승 현황 (기존 탑승지 정보와 통합)';
COMMENT ON VIEW participant_boarding_info IS '참가자별 탑승 정보 상세';