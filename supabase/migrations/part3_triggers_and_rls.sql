-- ================================================================
-- Part 3: 트리거 함수 및 RLS 정책
-- ================================================================

-- 업데이트 시간 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_tour_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_tour_journey_items_updated_at ON tour_journey_items;
CREATE TRIGGER update_tour_journey_items_updated_at 
BEFORE UPDATE ON tour_journey_items 
FOR EACH ROW 
EXECUTE FUNCTION update_tour_journey_updated_at();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE tour_journey_items ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON tour_journey_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tour_journey_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON tour_journey_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tour_journey_items;

-- 새 정책 생성
CREATE POLICY "Enable read access for all users" ON tour_journey_items
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON tour_journey_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON tour_journey_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON tour_journey_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- 확인 쿼리
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tour_journey_items';
