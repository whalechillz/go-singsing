-- 현재 등록된 모든 사용자 확인
-- auth.users와 users 테이블 모두 확인

-- 1. auth.users 테이블의 모든 사용자
SELECT 
    'AUTH' as source,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'name' as name,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✓ 이메일 확인됨'
        ELSE '✗ 이메일 미확인'
    END as email_status
FROM auth.users
ORDER BY created_at DESC;

-- 2. users 테이블의 모든 사용자
SELECT 
    'USERS TABLE' as source,
    email,
    name,
    role,
    is_active,
    created_at
FROM users
ORDER BY created_at DESC;

-- 3. 특정 이메일들의 존재 여부 확인
SELECT 
    email_check.email as check_email,
    CASE 
        WHEN au.id IS NOT NULL THEN '✓ Auth에 있음'
        ELSE '✗ Auth에 없음'
    END as auth_status,
    CASE 
        WHEN u.id IS NOT NULL THEN '✓ Users에 있음'
        ELSE '✗ Users에 없음'
    END as users_status
FROM (
    VALUES 
        ('mas9golf2@gmail.com'),
        ('mas9golf3@gmail.com'),
        ('singsingstour@naver.com')
) as email_check(email)
LEFT JOIN auth.users au ON au.email = email_check.email
LEFT JOIN users u ON u.email = email_check.email;
