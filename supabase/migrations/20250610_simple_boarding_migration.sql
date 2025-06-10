-- ================================================================
-- 탑승지 데이터를 tourist_attractions로 직접 이전
-- 2025-06-10
-- ================================================================

-- 1. 기존 탑승지 데이터를 tourist_attractions로 복사
INSERT INTO tourist_attractions (
  name,
  category,
  address,
  description,
  parking_info,
  region,
  is_active
)
SELECT 
  name,
  'boarding' as category,
  address,
  description,
  parking_info,
  region,
  is_active
FROM singsing_boarding_places
WHERE NOT EXISTS (
  SELECT 1 FROM tourist_attractions ta 
  WHERE ta.name = singsing_boarding_places.name 
  AND ta.category = 'boarding'
);

-- 2. 참가자의 pickup_location 확인 (어떤 탑승지 이름을 사용하는지 파악)
SELECT DISTINCT pickup_location, COUNT(*) as count
FROM singsing_participants
WHERE pickup_location IS NOT NULL
GROUP BY pickup_location
ORDER BY count DESC;

-- 3. tourist_attractions에 없는 탑승지 확인
SELECT DISTINCT p.pickup_location
FROM singsing_participants p
WHERE p.pickup_location IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM tourist_attractions ta 
  WHERE ta.name = p.pickup_location 
  AND ta.category = 'boarding'
);

-- 4. 필요시 누락된 탑승지 추가 (예시)
-- INSERT INTO tourist_attractions (name, category, address, is_active)
-- VALUES 
--   ('서울', 'boarding', '서울특별시', true),
--   ('수원', 'boarding', '경기도 수원시', true),
--   ('분당', 'boarding', '경기도 성남시 분당구', true);

-- 5. 통계 확인
SELECT 
  '원본 탑승지' as type,
  COUNT(*) as count
FROM singsing_boarding_places
UNION ALL
SELECT 
  '이전된 탑승지' as type,
  COUNT(*) as count
FROM tourist_attractions
WHERE category = 'boarding';
