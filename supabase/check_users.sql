-- auth.users 테이블 확인
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');

-- users 테이블 확인
SELECT 
    id,
    email,
    name,
    role,
    is_active
FROM users
WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');

-- active_users 뷰 확인
SELECT 
    id,
    email,
    name,
    role,
    is_active
FROM active_users
WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');

-- 전체 auth.users 수 확인
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 전체 users 수 확인
SELECT COUNT(*) as total_users FROM users;
