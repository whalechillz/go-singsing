-- tour_schedule_tourist_options 및 tour_attraction_options 강제 삭제 스크립트

-- 1. 테이블 존재 확인
DO $$
BEGIN
    RAISE NOTICE 'Checking tables existence...';
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'tour_schedule_tourist_options') THEN
        RAISE NOTICE 'tour_schedule_tourist_options exists';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'tour_attraction_options') THEN
        RAISE NOTICE 'tour_attraction_options exists';
    END IF;
END $$;

-- 2. 외래 키 제약 조건 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    -- tour_schedule_tourist_options의 외래 키 삭제
    FOR r IN 
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND (table_name = 'tour_schedule_tourist_options' 
             OR constraint_name LIKE '%tour_schedule_tourist_options%')
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I CASCADE', r.table_name, r.constraint_name);
    END LOOP;
    
    -- tour_attraction_options의 외래 키 삭제
    FOR r IN 
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND (table_name = 'tour_attraction_options' 
             OR constraint_name LIKE '%tour_attraction_options%')
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I CASCADE', r.table_name, r.constraint_name);
    END LOOP;
END $$;

-- 3. RLS 비활성화 (에러 무시)
DO $$
BEGIN
    ALTER TABLE tour_schedule_tourist_options DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not disable RLS on tour_schedule_tourist_options: %', SQLERRM;
END $$;

DO $$
BEGIN
    ALTER TABLE tour_attraction_options DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not disable RLS on tour_attraction_options: %', SQLERRM;
END $$;

-- 4. 모든 정책 삭제 (에러 무시)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename IN ('tour_schedule_tourist_options', 'tour_attraction_options')
    LOOP
        BEGIN
            IF pol.tablename = 'tour_schedule_tourist_options' THEN
                EXECUTE format('DROP POLICY IF EXISTS %I ON tour_schedule_tourist_options', pol.policyname);
            ELSE
                EXECUTE format('DROP POLICY IF EXISTS %I ON tour_attraction_options', pol.policyname);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop policy %: %', pol.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. 모든 트리거 삭제 (에러 무시)
DO $$
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN 
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table IN ('tour_schedule_tourist_options', 'tour_attraction_options')
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trig.trigger_name, trig.event_object_table);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop trigger %: %', trig.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 6. 뷰에서 참조 제거 (있다면)
DO $$
DECLARE
    v RECORD;
BEGIN
    FOR v IN 
        SELECT viewname 
        FROM pg_views 
        WHERE definition LIKE '%tour_schedule_tourist_options%' 
           OR definition LIKE '%tour_attraction_options%'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', v.viewname);
    END LOOP;
END $$;

-- 7. 테이블 강제 삭제
DROP TABLE IF EXISTS tour_schedule_tourist_options CASCADE;
DROP TABLE IF EXISTS tour_attraction_options CASCADE;

-- 8. 삭제 확인
SELECT 
    'Tables remaining:' as status,
    COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tour_schedule_tourist_options', 'tour_attraction_options');

-- 9. 최종 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%schedule%' OR table_name LIKE '%attraction_options%')
ORDER BY table_name;