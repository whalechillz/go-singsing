-- 더 이상 사용하지 않는 schedule 관련 테이블 삭제

-- 1. 현재 상태 확인
SELECT 
    table_name,
    (SELECT COUNT(*) FROM tour_schedule_tourist_options) as tourist_options_count,
    (SELECT COUNT(*) FROM tour_attraction_options) as attraction_options_count;

-- 2. 외래 키 제약 조건 확인
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('tour_schedule_tourist_options', 'tour_attraction_options');

-- 3. RLS 정책 확인 및 삭제
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- tour_schedule_tourist_options 정책 삭제
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'tour_schedule_tourist_options'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tour_schedule_tourist_options', pol.policyname);
    END LOOP;
    
    -- tour_attraction_options 정책 삭제
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'tour_attraction_options'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tour_attraction_options', pol.policyname);
    END LOOP;
END $$;

-- 4. 트리거 삭제
DROP TRIGGER IF EXISTS update_tour_schedule_tourist_options_updated_at ON tour_schedule_tourist_options;
DROP TRIGGER IF EXISTS update_tour_attraction_options_updated_at ON tour_attraction_options;

-- 5. 테이블 삭제
DROP TABLE IF EXISTS tour_schedule_tourist_options CASCADE;
DROP TABLE IF EXISTS tour_attraction_options CASCADE;

-- 6. 삭제 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'tour_%schedule%' OR table_name LIKE 'tour_attraction_options'
ORDER BY table_name;