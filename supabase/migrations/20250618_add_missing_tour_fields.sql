-- 투어 마케팅 및 상태 관리를 위한 필드 추가
ALTER TABLE singsing_tours
-- 참가자 수 관련
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS marketing_participant_count INTEGER,

-- 마감 관련
ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS closed_reason TEXT,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,

-- 일정 관련
ADD COLUMN IF NOT EXISTS departure_location TEXT,
ADD COLUMN IF NOT EXISTS itinerary TEXT,
ADD COLUMN IF NOT EXISTS included_items TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,

-- 뱃지 관련
ADD COLUMN IF NOT EXISTS is_special_price BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS special_badge_text VARCHAR(50),
ADD COLUMN IF NOT EXISTS badge_priority INTEGER DEFAULT 0,

-- 문서 표시 옵션
ADD COLUMN IF NOT EXISTS show_staff_info BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_footer_message BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_company_phone BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_golf_phones BOOLEAN DEFAULT TRUE,

-- 푸터 및 연락처
ADD COLUMN IF NOT EXISTS footer_message TEXT DEFAULT '♡ 즐거운 하루 되시길 바랍니다. ♡',
ADD COLUMN IF NOT EXISTS company_phone VARCHAR(20) DEFAULT '031-215-3990',
ADD COLUMN IF NOT EXISTS company_mobile VARCHAR(20) DEFAULT '010-3332-9020',
ADD COLUMN IF NOT EXISTS golf_reservation_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS golf_reservation_mobile VARCHAR(20),

-- 기타 안내문구
ADD COLUMN IF NOT EXISTS other_notices TEXT DEFAULT '※ 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.',

-- 문서 설정
ADD COLUMN IF NOT EXISTS document_settings JSONB DEFAULT '{
  "customer_schedule": true,
  "customer_boarding": true,
  "staff_boarding": true,
  "room_assignment": true,
  "tee_time": true,
  "simplified": true
}'::jsonb,

-- 문서별 전화번호 표시 설정
ADD COLUMN IF NOT EXISTS phone_display_settings JSONB DEFAULT '{
  "customer_schedule": {
    "show_company_phone": true,
    "show_driver_phone": false,
    "show_guide_phone": false,
    "show_golf_phone": false
  },
  "customer_boarding": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": false
  },
  "staff_boarding": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": true,
    "show_manager_phone": true
  },
  "room_assignment": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": false
  },
  "room_assignment_staff": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": true,
    "show_manager_phone": true
  },
  "tee_time": {
    "show_company_phone": true,
    "show_golf_phone": true
  },
  "simplified": {
    "show_company_phone": true
  }
}'::jsonb;

-- 스탭 정보 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS singsing_tour_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT '가이드',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tour_staff_tour_id ON singsing_tour_staff(tour_id);
CREATE INDEX IF NOT EXISTS idx_tours_is_closed ON singsing_tours(is_closed);
CREATE INDEX IF NOT EXISTS idx_tours_start_date ON singsing_tours(start_date);

-- 현재 참가자 수를 계산하는 함수
CREATE OR REPLACE FUNCTION update_tour_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 참가자가 추가되거나 삭제될 때마다 현재 참가자 수 업데이트
  UPDATE singsing_tours
  SET current_participants = (
    SELECT COUNT(*)
    FROM singsing_participants
    WHERE tour_id = COALESCE(NEW.tour_id, OLD.tour_id)
  )
  WHERE id = COALESCE(NEW.tour_id, OLD.tour_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_tour_participants_count_trigger ON singsing_participants;
CREATE TRIGGER update_tour_participants_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON singsing_participants
FOR EACH ROW
EXECUTE FUNCTION update_tour_participants_count();

-- 기존 투어의 참가자 수 업데이트
UPDATE singsing_tours t
SET current_participants = (
  SELECT COUNT(*)
  FROM singsing_participants p
  WHERE p.tour_id = t.id
);

-- 마케팅 표시 인원이 null인 경우 실제 참가자 수로 초기화
UPDATE singsing_tours
SET marketing_participant_count = current_participants
WHERE marketing_participant_count IS NULL;