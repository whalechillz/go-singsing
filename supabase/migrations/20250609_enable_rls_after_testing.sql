-- ================================================================
-- 테스트 후 RLS 재활성화 및 정책 설정
-- ⚠️ 테스트 완료 후 반드시 실행하세요!
-- ================================================================

-- 1. RLS 재활성화
ALTER TABLE tour_journey_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_boarding_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tee_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_pickup_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tour_boarding_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tour_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 2. tour_journey_items 테이블 정책 생성
-- 모든 사용자가 조회 가능
CREATE POLICY "tour_journey_items_select" ON tour_journey_items
FOR SELECT TO authenticated, anon
USING (true);

-- 인증된 사용자만 수정 가능
CREATE POLICY "tour_journey_items_insert" ON tour_journey_items
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "tour_journey_items_update" ON tour_journey_items
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "tour_journey_items_delete" ON tour_journey_items
FOR DELETE TO authenticated
USING (true);

-- 3. 다른 테이블들도 기본 정책 추가 (예시)
-- singsing_tours
CREATE POLICY "tours_select_all" ON singsing_tours
FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "tours_modify_authenticated" ON singsing_tours
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- tourist_attractions
CREATE POLICY "attractions_select_all" ON tourist_attractions
FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "attractions_modify_authenticated" ON tourist_attractions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- singsing_boarding_places
CREATE POLICY "boarding_places_select_all" ON singsing_boarding_places
FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "boarding_places_modify_authenticated" ON singsing_boarding_places
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 4. 확인
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('tour_journey_items', 'singsing_tours', 'tourist_attractions', 'singsing_boarding_places')
ORDER BY tablename, policyname;

DO $$
BEGIN
  RAISE NOTICE '✅ RLS가 재활성화되고 기본 정책이 적용되었습니다.';
END $$;
