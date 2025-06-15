-- 현재 사용자 상태 진단
-- 2025-06-15

-- 1. auth.users와 public.users 동기화 상태 확인
SELECT 
    pu.name,
    pu.email,
    pu.role,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 로그인 불가' 
    END as login_status,
    au.created_at as auth_created_at,
    pu.created_at as user_created_at
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY login_status DESC, pu.created_at DESC;

-- 2. 로그인 불가능한 사용자만 확인
SELECT 
    pu.name,
    pu.email,
    pu.role
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE au.email IS NULL
AND pu.email IS NOT NULL;
