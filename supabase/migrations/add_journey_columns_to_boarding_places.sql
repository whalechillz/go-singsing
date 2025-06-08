-- 여정 관리 개선을 위한 컬럼 추가
-- singsing_boarding_places 테이블에 새로운 컬럼들 추가

-- 순서 관리
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT NULL;

-- 시간 정보
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS arrival_time TIME DEFAULT NULL;

ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS stay_duration VARCHAR(50) DEFAULT NULL;

-- 거리/소요시간 정보 (이전 장소로부터)
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS distance_from_prev VARCHAR(50) DEFAULT NULL;

ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS duration_from_prev VARCHAR(50) DEFAULT NULL;

-- 탑승 인원 (탑승지만 해당)
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS passenger_count INTEGER DEFAULT NULL;

-- 비고
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_boarding_places_order 
ON singsing_boarding_places(order_index);

-- 기존 데이터에 순서 부여 (선택사항)
-- 이름 순으로 자동 순서 부여
DO $$
DECLARE
  counter INTEGER := 1;
  place_record RECORD;
BEGIN
  FOR place_record IN 
    SELECT id FROM singsing_boarding_places 
    WHERE order_index IS NULL 
    ORDER BY 
      CASE place_type 
        WHEN 'boarding' THEN 1
        WHEN 'rest_area' THEN 2
        WHEN 'tourist_spot' THEN 3
        WHEN 'restaurant' THEN 4
        ELSE 5
      END,
      name
  LOOP
    UPDATE singsing_boarding_places 
    SET order_index = counter 
    WHERE id = place_record.id;
    
    counter := counter + 1;
  END LOOP;
END $$;

-- 업데이트 시간 자동 갱신 트리거 (이미 있을 수 있음)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거가 없다면 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_boarding_places_updated_at'
  ) THEN
    CREATE TRIGGER update_boarding_places_updated_at 
    BEFORE UPDATE ON singsing_boarding_places 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
