-- users 테이블이 실제 데이터를 저장하는 테이블인지 확인
-- users 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- users 테이블에 있는 데이터 샘플 확인
SELECT id, email, name, role, is_active 
FROM users 
LIMIT 5;

-- active_users 뷰의 정의 확인
SELECT pg_get_viewdef('active_users'::regclass, true);

-- users 테이블의 unique constraints 확인
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE');
