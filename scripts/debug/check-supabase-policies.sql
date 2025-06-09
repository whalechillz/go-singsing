-- Supabase RLS 정책 확인 스크립트
-- Supabase SQL Editor에서 실행

-- tour_journey_items 테이블의 RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tour_journey_items';

-- singsing_boarding_places 테이블의 RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'singsing_boarding_places';

-- tourist_attractions 테이블의 RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tourist_attractions';

-- RLS가 활성화되어 있는지 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('tour_journey_items', 'singsing_boarding_places', 'tourist_attractions');
