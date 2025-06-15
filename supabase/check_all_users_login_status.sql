-- 모든 사용자 로그인 상태 확인
-- 2025-06-15

-- 1. 전체 사용자 로그인 가능 여부 확인
SELECT 
    pu.name,
    pu.email,
    pu.role,
    pu.phone,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 로그인 불가' 
    END as login_status,
    au.email_confirmed_at,
    au.created_at as auth_created_at,
    pu.created_at as user_created_at
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY login_status DESC, pu.email;

-- 2. 로그인 불가능한 사용자만 표시
SELECT 
    '로그인 불가' as status,
    pu.name,
    pu.email,
    pu.role,
    pu.phone
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE au.email IS NULL
AND pu.email IS NOT NULL;

-- 3. 로그인 가능한 사용자만 표시
SELECT 
    '로그인 가능' as status,
    pu.name,
    pu.email,
    pu.role,
    au.email_confirmed_at
FROM public.users pu
INNER JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY pu.email;

-- 4. 통계
SELECT 
    COUNT(CASE WHEN au.email IS NOT NULL THEN 1 END) as login_possible,
    COUNT(CASE WHEN au.email IS NULL AND pu.email IS NOT NULL THEN 1 END) as login_impossible,
    COUNT(pu.email) as total_users
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL;
