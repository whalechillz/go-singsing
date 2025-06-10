-- ================================================================
-- 탑승지를 스팟(tourist_attractions)으로 마이그레이션
-- 2025-06-10
-- ================================================================

-- 1. 기존 singsing_boarding_places 데이터를 tourist_attractions로 이전
-- (중복 체크 포함)
INSERT INTO tourist_attractions (
  name,
  category,
  address,
  description,
  features,
  image_url,
  tags,
  region,
  is_active,
  -- 탑승지 전용 필드들을 JSON으로 저장
  boarding_info,
  parking_info,
  boarding_main,
  boarding_sub,
  parking_main,
  parking_map_url,
  created_at,
  updated_at
)
SELECT 
  bp.name,
  'boarding' as category,
  bp.address,
  bp.description,
  ARRAY[]::TEXT[] as features,  -- 빈 배열로 초기화
  bp.image_url,
  ARRAY['탑승지']::TEXT[] as tags,
  bp.region,
  bp.is_active,
  -- 탑승지 관련 정보들
  bp.description as boarding_info,
  bp.parking_info,
  bp.boarding_main,
  bp.boarding_sub,
  bp.parking_main,
  bp.parking_map_url,
  bp.created_at,
  bp.updated_at
FROM singsing_boarding_places bp
WHERE NOT EXISTS (
  SELECT 1 FROM tourist_attractions ta 
  WHERE ta.name = bp.name 
  AND ta.category = 'boarding'
);

-- 2. 매핑 테이블 생성 (임시)
CREATE TEMP TABLE boarding_mapping AS
SELECT 
  bp.id as old_id,
  ta.id as new_id,
  bp.name
FROM singsing_boarding_places bp
JOIN tourist_attractions ta ON ta.name = bp.name AND ta.category = 'boarding';

-- 3. tour_journey_items의 boarding_place_id를 spot_id로 업데이트
UPDATE tour_journey_items tji
SET 
  spot_id = bm.new_id,
  boarding_place_id = NULL
FROM boarding_mapping bm
WHERE tji.boarding_place_id = bm.old_id
AND tji.spot_id IS NULL;  -- spot_id가 없는 경우만 업데이트

-- 4. 참가자의 pickup_location 매핑 테이블 생성
-- (이름 기반 매핑이므로 데이터 확인 필요)
CREATE TABLE IF NOT EXISTS pickup_location_mapping (
  old_location VARCHAR(255),
  new_location VARCHAR(255),
  spot_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 기존 탑승지 이름과 새로운 스팟 ID 매핑
INSERT INTO pickup_location_mapping (old_location, new_location, spot_id)
SELECT DISTINCT
  p.pickup_location as old_location,
  ta.name as new_location,
  ta.id as spot_id
FROM singsing_participants p
LEFT JOIN tourist_attractions ta ON ta.name = p.pickup_location AND ta.category = 'boarding'
WHERE p.pickup_location IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. 데이터 검증을 위한 통계
DO $$
DECLARE
  boarding_places_count INTEGER;
  migrated_spots_count INTEGER;
  journey_items_count INTEGER;
  updated_journey_items INTEGER;
  unmapped_participants INTEGER;
BEGIN
  -- 원본 탑승지 수
  SELECT COUNT(*) INTO boarding_places_count FROM singsing_boarding_places;
  
  -- 마이그레이션된 스팟 수
  SELECT COUNT(*) INTO migrated_spots_count 
  FROM tourist_attractions 
  WHERE category = 'boarding';
  
  -- boarding_place_id를 사용하는 journey_items 수
  SELECT COUNT(*) INTO journey_items_count 
  FROM tour_journey_items 
  WHERE boarding_place_id IS NOT NULL;
  
  -- 업데이트된 journey_items 수
  SELECT COUNT(*) INTO updated_journey_items 
  FROM tour_journey_items 
  WHERE spot_id IN (SELECT id FROM tourist_attractions WHERE category = 'boarding')
  AND boarding_place_id IS NULL;
  
  -- 매핑되지 않은 참가자 수
  SELECT COUNT(DISTINCT p.pickup_location) INTO unmapped_participants
  FROM singsing_participants p
  LEFT JOIN pickup_location_mapping plm ON p.pickup_location = plm.old_location
  WHERE p.pickup_location IS NOT NULL
  AND plm.spot_id IS NULL;
  
  RAISE NOTICE '=== 마이그레이션 통계 ===';
  RAISE NOTICE '원본 탑승지 수: %', boarding_places_count;
  RAISE NOTICE '마이그레이션된 스팟 수: %', migrated_spots_count;
  RAISE NOTICE '여정 항목 중 탑승지 수: %', journey_items_count;
  RAISE NOTICE '업데이트된 여정 항목 수: %', updated_journey_items;
  RAISE NOTICE '매핑되지 않은 참가자 탑승지: %', unmapped_participants;
  
  IF unmapped_participants > 0 THEN
    RAISE WARNING '일부 참가자의 탑승지가 매핑되지 않았습니다. pickup_location_mapping 테이블을 확인하세요.';
  END IF;
END $$;

-- 6. tourist_attractions 테이블에 탑승지 관련 컬럼 추가 (없는 경우)
DO $$
BEGIN
  -- boarding_info 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourist_attractions' 
    AND column_name = 'boarding_info'
  ) THEN
    ALTER TABLE tourist_attractions ADD COLUMN boarding_info TEXT;
  END IF;
  
  -- parking_info 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourist_attractions' 
    AND column_name = 'parking_info'
  ) THEN
    ALTER TABLE tourist_attractions ADD COLUMN parking_info TEXT;
  END IF;
  
  -- boarding_main 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourist_attractions' 
    AND column_name = 'boarding_main'
  ) THEN
    ALTER TABLE tourist_attractions ADD COLUMN boarding_main TEXT;
  END IF;
  
  -- boarding_sub 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourist_attractions' 
    AND column_name = 'boarding_sub'
  ) THEN
    ALTER TABLE tourist_attractions ADD COLUMN boarding_sub TEXT;
  END IF;
  
  -- parking_main 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourist_attractions' 
    AND column_name = 'parking_main'
  ) THEN
    ALTER TABLE tourist_attractions ADD COLUMN parking_main TEXT;
  END IF;
  
  -- parking_map_url 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourist_attractions' 
    AND column_name = 'parking_map_url'
  ) THEN
    ALTER TABLE tourist_attractions ADD COLUMN parking_map_url TEXT;
  END IF;
END $$;

-- 7. 카테고리 enum 확장 (boarding 추가)
DO $$
BEGIN
  -- 기존 제약조건 제거
  ALTER TABLE tourist_attractions 
  DROP CONSTRAINT IF EXISTS tourist_attractions_category_check;
  
  -- 새로운 제약조건 추가 (boarding 포함)
  ALTER TABLE tourist_attractions 
  ADD CONSTRAINT tourist_attractions_category_check 
  CHECK (category IN ('boarding', 'tourist_spot', 'rest_area', 'restaurant', 'shopping', 'activity', 'mart', 'golf_round', 'club_meal', 'others'));
END $$;

-- 8. 검증 뷰 생성
CREATE OR REPLACE VIEW boarding_migration_status AS
SELECT 
  'Original Boarding Places' as type,
  COUNT(*) as count
FROM singsing_boarding_places
UNION ALL
SELECT 
  'Migrated Boarding Spots' as type,
  COUNT(*) as count
FROM tourist_attractions
WHERE category = 'boarding'
UNION ALL
SELECT 
  'Journey Items with boarding_place_id' as type,
  COUNT(*) as count
FROM tour_journey_items
WHERE boarding_place_id IS NOT NULL
UNION ALL
SELECT 
  'Journey Items migrated to spot_id' as type,
  COUNT(*) as count
FROM tour_journey_items
WHERE spot_id IN (SELECT id FROM tourist_attractions WHERE category = 'boarding')
UNION ALL
SELECT 
  'Participants with unmapped pickup_location' as type,
  COUNT(DISTINCT p.pickup_location) as count
FROM singsing_participants p
LEFT JOIN pickup_location_mapping plm ON p.pickup_location = plm.old_location
WHERE p.pickup_location IS NOT NULL
AND plm.spot_id IS NULL;

-- 마이그레이션 상태 확인
SELECT * FROM boarding_migration_status;

-- ================================================================
-- 주의사항:
-- 1. 이 마이그레이션을 실행하기 전에 백업을 권장합니다
-- 2. pickup_location_mapping 테이블을 확인하여 매핑되지 않은 데이터 처리
-- 3. 마이그레이션 완료 후 boarding_place_id 컬럼 제거 고려
-- ================================================================