-- ================================================================
-- 탑승지 마이그레이션 상태 확인 및 참가자 탑승지 매핑
-- 2025-06-10
-- ================================================================

-- 1. 현재 tourist_attractions에 있는 탑승지 확인
SELECT id, name, category, address, description
FROM tourist_attractions
WHERE category = 'boarding'
ORDER BY name;

-- 2. 참가자들이 사용하는 탑승지 이름 확인
SELECT DISTINCT pickup_location, COUNT(*) as participant_count
FROM singsing_participants
WHERE pickup_location IS NOT NULL
GROUP BY pickup_location
ORDER BY participant_count DESC;

-- 3. tourist_attractions에 없는 탑승지를 사용하는 참가자 확인
SELECT DISTINCT p.pickup_location, COUNT(*) as count
FROM singsing_participants p
WHERE p.pickup_location IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM tourist_attractions ta 
  WHERE ta.name = p.pickup_location 
  AND ta.category = 'boarding'
)
GROUP BY p.pickup_location
ORDER BY count DESC;

-- 4. tour_journey_items에서 boarding_place_id 사용 현황 확인
SELECT COUNT(*) as boarding_place_id_count
FROM tour_journey_items
WHERE boarding_place_id IS NOT NULL;

-- 5. tour_journey_items에서 boarding 카테고리 spot 사용 현황
SELECT COUNT(*) as boarding_spot_count
FROM tour_journey_items tji
JOIN tourist_attractions ta ON tji.spot_id = ta.id
WHERE ta.category = 'boarding';

-- 6. 필요시 누락된 탑승지 추가 (예시)
-- 위 3번 쿼리 결과를 보고 필요한 탑승지만 추가
/*
INSERT INTO tourist_attractions (name, category, address, is_active)
VALUES 
  ('서울', 'boarding', '서울특별시', true),
  ('수원', 'boarding', '경기도 수원시', true),
  ('분당', 'boarding', '경기도 성남시 분당구', true);
*/
