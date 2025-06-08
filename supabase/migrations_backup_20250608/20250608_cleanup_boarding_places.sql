-- singsing_boarding_places 테이블 정리
-- 탑승지만 관리하도록 변경

-- 1. 탑승지가 아닌 데이터를 tourist_attractions로 이관
INSERT INTO tourist_attractions (name, category, address, description, parking_info, created_at)
SELECT 
  name,
  CASE 
    WHEN place_type = 'rest_area' THEN 'rest_area'
    WHEN place_type = 'mart' THEN 'mart'
    WHEN place_type = 'tourist_spot' THEN 'tourist_spot'
    WHEN place_type = 'restaurant' THEN 'restaurant'
  END as category,
  address,
  notes as description,
  parking_info,
  created_at
FROM singsing_boarding_places
WHERE place_type != 'boarding'
ON CONFLICT DO NOTHING;

-- 2. 탑승지가 아닌 데이터 삭제
DELETE FROM singsing_boarding_places WHERE place_type != 'boarding';

-- 3. place_type 컬럼 제약조건 변경
ALTER TABLE singsing_boarding_places DROP CONSTRAINT IF EXISTS singsing_boarding_places_place_type_check;
ALTER TABLE singsing_boarding_places 
ADD CONSTRAINT singsing_boarding_places_place_type_check 
CHECK (place_type = 'boarding' OR place_type IS NULL);

-- 4. 불필요한 컬럼 정리 (선택사항)
-- 여정 관련 컬럼들은 투어별 여정 테이블로 이동 예정이므로 보류

-- 5. 코멘트 업데이트
COMMENT ON TABLE singsing_boarding_places IS '탑승지 마스터 데이터';
COMMENT ON COLUMN singsing_boarding_places.place_type IS '장소 유형: boarding(탑승지)만 허용';
