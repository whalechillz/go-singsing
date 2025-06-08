-- ================================================================
-- Part 5: 샘플 데이터 및 최종 확인
-- ================================================================

-- 5-1. 새로운 카테고리 스팟 샘플 데이터 (선택사항)
-- 실제 운영시에는 필요한 데이터만 추가하세요

-- 마트 샘플
/*
INSERT INTO tourist_attractions (name, category, sub_category, address, description, operating_hours, is_active)
VALUES 
  ('이마트 순천점', 'mart', '대형마트', '전남 순천시 조례동 123-45', '대형 할인마트', '09:00-22:00', true),
  ('CU 편의점', 'mart', '편의점', '전남 순천시 연향동 456-78', '24시간 편의점', '24시간', true);
*/

-- 골프장 샘플
/*
INSERT INTO tourist_attractions (name, category, sub_category, address, description, golf_course_info, booking_required, is_active)
VALUES 
  ('순천 컨트리클럽', 'golf_round', '18홀', '전남 순천시 해룡면 신대리', '18홀 정규 골프장', 
   '{"holes": "18", "green_fee": "200000", "cart_fee": "80000"}'::jsonb, true, true);
*/

-- 클럽식 샘플
/*
INSERT INTO tourist_attractions (name, category, sub_category, address, description, meal_info, is_active)
VALUES 
  ('클럽하우스 레스토랑', 'club_meal', '중식', '골프장 클럽하우스 2층', '한정식 뷔페', 
   '{"meal_type": "중식", "menu": "한정식 뷔페", "price": "35000"}'::jsonb, true);
*/

-- 기타 샘플
/*
INSERT INTO tourist_attractions (name, category, sub_category, description, is_active)
VALUES 
  ('호텔 휴식', 'others', '개별휴식', '호텔에서 개별 휴식 시간', true),
  ('자유시간', 'others', '자유시간', '개인 자유시간', true);
*/

-- 5-2. 최종 확인 쿼리

-- tourist_attractions 테이블 새 컬럼 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tourist_attractions'
  AND column_name IN ('sub_category', 'golf_course_info', 'meal_info', 
                      'parking_info', 'entrance_fee', 'booking_required')
ORDER BY column_name;

-- tour_journey_items 테이블 확인
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'tour_journey_items';

-- 카테고리별 데이터 수 확인
SELECT 
  category,
  COUNT(*) as count
FROM tourist_attractions
GROUP BY category
ORDER BY category;

-- 새로운 카테고리 확인
SELECT DISTINCT category 
FROM tourist_attractions 
WHERE category IN ('mart', 'golf_round', 'club_meal', 'others');

-- singsing_boarding_places 정리 상태 확인
SELECT 
  place_type,
  COUNT(*) as count
FROM singsing_boarding_places
GROUP BY place_type;

-- 5-3. 전체 시스템 상태 요약
SELECT 
  'tourist_attractions' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT category) as categories
FROM tourist_attractions
UNION ALL
SELECT 
  'tour_journey_items' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT tour_id) as categories
FROM tour_journey_items
UNION ALL
SELECT 
  'singsing_boarding_places' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT place_type) as categories
FROM singsing_boarding_places;
