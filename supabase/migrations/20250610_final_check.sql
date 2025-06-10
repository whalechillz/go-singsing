-- ================================================================
-- tour_journey_items 업데이트 및 최종 확인
-- 2025-06-10
-- ================================================================

-- 1. 참가자들이 사용하는 탑승지가 모두 tourist_attractions에 있는지 최종 확인
SELECT DISTINCT p.pickup_location, COUNT(*) as participant_count,
  CASE 
    WHEN ta.id IS NOT NULL THEN '✅ 매핑됨'
    ELSE '❌ 매핑 안됨'
  END as status
FROM singsing_participants p
LEFT JOIN tourist_attractions ta ON ta.name = p.pickup_location AND ta.category = 'boarding'
WHERE p.pickup_location IS NOT NULL
GROUP BY p.pickup_location, ta.id
ORDER BY participant_count DESC;

-- 2. tour_journey_items에서 boarding_place_id가 있는 항목 확인
SELECT 
  tji.id,
  tji.tour_id,
  tji.boarding_place_id,
  tji.spot_id,
  tji.day_number,
  tji.order_index
FROM tour_journey_items tji
WHERE tji.boarding_place_id IS NOT NULL
LIMIT 10;

-- 3. boarding_place_id가 있고 spot_id가 없는 경우만 업데이트 (안전하게)
-- 먼저 확인
SELECT COUNT(*) as items_to_update
FROM tour_journey_items
WHERE boarding_place_id IS NOT NULL
AND spot_id IS NULL;

-- 4. 업데이트 실행 (필요한 경우)
/*
UPDATE tour_journey_items tji
SET spot_id = (
  SELECT ta.id 
  FROM tourist_attractions ta
  WHERE ta.category = 'boarding'
  -- boarding_place_id와 매칭하는 로직 필요
  LIMIT 1
)
WHERE tji.boarding_place_id IS NOT NULL
AND tji.spot_id IS NULL;
*/

-- 5. 최종 통계
SELECT 
  'Tourist Attractions 탑승지' as type,
  COUNT(*) as count
FROM tourist_attractions
WHERE category = 'boarding'
UNION ALL
SELECT 
  'Journey Items with boarding spot' as type,
  COUNT(*) as count
FROM tour_journey_items tji
JOIN tourist_attractions ta ON tji.spot_id = ta.id
WHERE ta.category = 'boarding'
UNION ALL
SELECT 
  'Journey Items with boarding_place_id' as type,
  COUNT(*) as count
FROM tour_journey_items
WHERE boarding_place_id IS NOT NULL
UNION ALL
SELECT 
  '참가자 중 탑승지 지정됨' as type,
  COUNT(DISTINCT pickup_location) as count
FROM singsing_participants
WHERE pickup_location IS NOT NULL;
