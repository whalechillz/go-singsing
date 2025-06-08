-- tour_journey_items 테이블 RLS 정책 설정

-- RLS 활성화
ALTER TABLE tour_journey_items ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "tour_journey_items_select_policy" ON tour_journey_items
FOR SELECT TO authenticated, anon
USING (true);

-- 인증된 사용자는 모든 작업 가능 (임시)
CREATE POLICY "tour_journey_items_insert_policy" ON tour_journey_items
FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "tour_journey_items_update_policy" ON tour_journey_items
FOR UPDATE TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "tour_journey_items_delete_policy" ON tour_journey_items
FOR DELETE TO authenticated, anon
USING (true);

-- 확인 쿼리
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'tour_journey_items';
