-- ================================================================
-- Part 4: singsing_boarding_places 테이블 데이터 정리
-- ================================================================

-- 4-1. 탑승지가 아닌 데이터를 tourist_attractions로 이관
-- (중복 체크: 이름과 주소가 같은 경우 제외)
INSERT INTO tourist_attractions (name, category, address, description, parking_info, created_at, is_active)
SELECT DISTINCT
  bp.name,
  CASE 
    WHEN bp.place_type = 'rest_area' THEN 'rest_area'
    WHEN bp.place_type = 'mart' THEN 'mart'
    WHEN bp.place_type = 'tourist_spot' THEN 'tourist_spot'
    WHEN bp.place_type = 'restaurant' THEN 'restaurant'
    ELSE 'others'
  END as category,
  bp.address,
  bp.description,
  bp.parking_info,
  bp.created_at,
  true as is_active
FROM singsing_boarding_places bp
WHERE bp.place_type != 'boarding' 
  AND bp.place_type IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tourist_attractions ta 
    WHERE ta.name = bp.name AND ta.address = bp.address
  );

-- 4-2. 이관 완료 확인
SELECT 
  bp.name,
  bp.place_type,
  bp.address,
  'TO BE MOVED' as status
FROM singsing_boarding_places bp
WHERE bp.place_type != 'boarding' 
  AND bp.place_type IS NOT NULL;

-- 4-3. 탑승지가 아닌 데이터 삭제 (확인 후 실행)
-- 주의: 위 SELECT 문으로 확인 후 실행하세요!
/*
DELETE FROM singsing_boarding_places 
WHERE place_type != 'boarding' OR place_type IS NULL;
*/

-- 4-4. place_type NULL인 데이터 확인
SELECT id, name, address, place_type
FROM singsing_boarding_places
WHERE place_type IS NULL;

-- 4-5. place_type 기본값 설정 (NULL인 경우 'boarding'으로)
/*
UPDATE singsing_boarding_places 
SET place_type = 'boarding' 
WHERE place_type IS NULL;
*/

-- 4-6. place_type 제약조건 재설정 (데이터 정리 후 실행)
/*
ALTER TABLE singsing_boarding_places DROP CONSTRAINT IF EXISTS singsing_boarding_places_place_type_check;
ALTER TABLE singsing_boarding_places 
ADD CONSTRAINT singsing_boarding_places_place_type_check 
CHECK (place_type = 'boarding');
*/

-- 코멘트 업데이트
COMMENT ON TABLE singsing_boarding_places IS '탑승지 마스터 데이터 (탑승지만 관리)';
COMMENT ON COLUMN singsing_boarding_places.place_type IS '장소 유형: boarding(탑승지)만 허용';
