-- ================================================
-- 싱싱골프투어 데이터베이스 구조 확인 SQL
-- 
-- 이 쿼리를 Supabase SQL Editor에서 실행하면
-- 현재 DB 구조를 빠르게 파악할 수 있습니다.
-- ================================================

-- 1. 전체 테이블 목록과 설명
SELECT 
    schemaname as "스키마",
    tablename as "테이블명",
    obj_description(pgc.oid, 'pg_class') as "설명"
FROM pg_tables t
JOIN pg_class pgc ON pgc.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. 주요 테이블의 컬럼 정보
SELECT 
    table_name as "테이블",
    column_name as "컬럼명",
    data_type as "데이터타입",
    character_maximum_length as "최대길이",
    is_nullable as "NULL허용",
    column_default as "기본값"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'tour_products',
    'singsing_tours', 
    'singsing_participants',
    'singsing_payments',
    'singsing_boarding_places',
    'singsing_boarding_schedules',
    'singsing_rooms',
    'singsing_tee_times'
)
ORDER BY table_name, ordinal_position;

-- 3. 외래키 관계
SELECT
    tc.table_name as "테이블", 
    kcu.column_name as "컬럼", 
    ccu.table_name AS "참조테이블",
    ccu.column_name AS "참조컬럼" 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. 사용자 정의 타입 (ENUM)
SELECT 
    t.typname as "타입명",
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as "값목록"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname;

-- 5. 각 테이블의 레코드 수
SELECT 
    schemaname,
    tablename,
    n_live_tup as "레코드수"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 6. 인덱스 정보
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;