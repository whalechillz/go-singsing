-- tour_schedule_spots 테이블 생성 (이미 존재하지 않는 경우)
CREATE TABLE IF NOT EXISTS tour_schedule_spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  sequence INTEGER NOT NULL,
  spot_id UUID NOT NULL REFERENCES tourist_attractions(id) ON DELETE CASCADE,
  start_time TEXT,
  end_time TEXT,
  notes TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(tour_id, day, sequence)
);

-- 업데이트 시 updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_tour_schedule_spots_updated_at ON tour_schedule_spots;
CREATE TRIGGER update_tour_schedule_spots_updated_at 
  BEFORE UPDATE ON tour_schedule_spots 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE tour_schedule_spots ENABLE ROW LEVEL SECURITY;

-- RLS 정책 - 모든 사용자가 읽을 수 있음
CREATE POLICY "Anyone can view tour schedule spots" ON tour_schedule_spots
  FOR SELECT USING (true);

-- RLS 정책 - staff, manager, admin만 수정 가능
CREATE POLICY "Staff can manage tour schedule spots" ON tour_schedule_spots
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' IN ('staff', 'manager', 'admin')
    )
  );

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tour_schedule_spots_tour_id ON tour_schedule_spots(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_schedule_spots_spot_id ON tour_schedule_spots(spot_id);
CREATE INDEX IF NOT EXISTS idx_tour_schedule_spots_day ON tour_schedule_spots(tour_id, day);