-- 티오프시간 테이블 생성
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
CREATE INDEX idx_tee_times_tour_id ON singsing_tee_times(tour_id);
CREATE INDEX idx_tee_times_play_date ON singsing_tee_times(play_date);
CREATE INDEX idx_tee_times_tee_time ON singsing_tee_times(tee_time);

-- 참가자 테이블에 tee_time_id 컬럼 추가 (이미 없는 경우에만)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'singsing_participants' 
                 AND column_name = 'tee_time_id') THEN
    ALTER TABLE singsing_participants 
    ADD COLUMN tee_time_id UUID REFERENCES singsing_tee_times(id) ON DELETE SET NULL;
  END IF;
END $$;

-- RLS (Row Level Security) 정책 설정
ALTER TABLE singsing_tee_times ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow read access for all users" ON singsing_tee_times
  FOR SELECT
  USING (true);

-- 모든 사용자가 생성/수정/삭제 가능 (실제 운영시에는 인증된 사용자로 제한 필요)
CREATE POLICY "Allow all operations for all users" ON singsing_tee_times
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_singsing_tee_times_updated_at 
  BEFORE UPDATE ON singsing_tee_times
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();