-- 1. 기존 불필요한 테이블 삭제
DROP TABLE IF EXISTS rounding_timetable_footers CASCADE;
DROP TABLE IF EXISTS rounding_timetable_notices CASCADE;

-- 2. singsing_tour_staff 테이블 생성 (스텝진 관리)
CREATE TABLE IF NOT EXISTS singsing_tour_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL, -- '기사', '가이드', '인솔자' 등
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_tour_staff_tour_id ON singsing_tour_staff(tour_id);
CREATE INDEX idx_tour_staff_display_order ON singsing_tour_staff(display_order);

-- RLS 정책
ALTER TABLE singsing_tour_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for all users" ON singsing_tour_staff
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. singsing_tours 테이블 수정
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS footer_message TEXT DEFAULT '♡ 즐거운 하루 되시길 바랍니다. ♡',
ADD COLUMN IF NOT EXISTS company_phone VARCHAR(20) DEFAULT '031-215-3990',
ADD COLUMN IF NOT EXISTS company_mobile VARCHAR(20) DEFAULT '010-3332-9020',
ADD COLUMN IF NOT EXISTS golf_reservation_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS golf_reservation_mobile VARCHAR(20),
ADD COLUMN IF NOT EXISTS show_staff_info BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_footer_message BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_company_phones BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_golf_phones BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notices TEXT DEFAULT '• 집합시간: 티오프 시간 30분 전 골프장 도착
• 준비사항: 골프복, 골프화, 모자, 선글라스
• 카트배정: 4인 1카트 원칙
• 날씨대비: 우산, 우의 등 개인 준비';

-- 기존 driver_name 필드 제거 (있다면)
ALTER TABLE singsing_tours DROP COLUMN IF EXISTS driver_name;

-- 4. singsing_tee_times 테이블이 없다면 생성
CREATE TABLE IF NOT EXISTS singsing_tee_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  play_date DATE NOT NULL,
  golf_course VARCHAR(100) NOT NULL,
  tee_time TIME NOT NULL,
  max_players INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tee_times_tour_id ON singsing_tee_times(tour_id);
CREATE INDEX IF NOT EXISTS idx_tee_times_play_date ON singsing_tee_times(play_date);
CREATE INDEX IF NOT EXISTS idx_tee_times_tee_time ON singsing_tee_times(tee_time);

-- RLS 정책
ALTER TABLE singsing_tee_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for all users" ON singsing_tee_times
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. 기존 데이터 마이그레이션 (driver_name이 있다면)
-- INSERT INTO singsing_tour_staff (tour_id, name, role, display_order)
-- SELECT id, driver_name, '기사', 1
-- FROM singsing_tours
-- WHERE driver_name IS NOT NULL;
