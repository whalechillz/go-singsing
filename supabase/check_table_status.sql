-- active_users 테이블 정보 확인
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'active_users';

-- 뷰인지 확인
SELECT * FROM information_schema.views 
WHERE table_name = 'active_users';

-- RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'active_users';
