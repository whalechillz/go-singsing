-- ================================================================
-- 테스트를 위한 RLS 전체 비활성화
-- ⚠️ 주의: 프로덕션에서는 절대 사용하지 마세요!
-- ================================================================

-- 1. tour_journey_items 테이블 RLS 비활성화
ALTER TABLE tour_journey_items DISABLE ROW LEVEL SECURITY;

-- 2. 다른 주요 테이블들도 RLS 비활성화
ALTER TABLE singsing_tours DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_boarding_places DISABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_attractions DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tee_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_pickup_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tour_boarding_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tour_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE tour_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- 3. 확인 쿼리
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'tour_journey_items',
  'singsing_tours',
  'singsing_participants',
  'singsing_boarding_places',
  'tourist_attractions'
)
ORDER BY tablename;

-- 4. 메시지
DO $$
BEGIN
  RAISE NOTICE '⚠️ 모든 테이블의 RLS가 비활성화되었습니다. 테스트 완료 후 반드시 다시 활성화하세요!';
END $$;
