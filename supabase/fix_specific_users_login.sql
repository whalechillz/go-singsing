-- 특정 사용자들의 로그인 문제 해결
-- mas9golf3@gmail.com, singsingstour@naver.com
-- 2025-06-15

BEGIN;

-- 1. 먼저 현재 상태 확인
SELECT 
    'public.users 상태' as table_name,
    email,
    name,
    role
FROM public.users
WHERE email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com');

SELECT 
    'auth.users 상태' as table_name,
    email,
    email_confirmed_at
FROM auth.users
WHERE email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com');

-- 2. auth.users에 누락된 사용자 추가
INSERT INTO auth.users (
    id, 
    instance_id, 
    email, 
    encrypted_password, 
    email_confirmed_at,
    raw_user_meta_data, 
    raw_app_meta_data, 
    aud, 
    role, 
    created_at, 
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    pu.email,
    crypt('90001004', gen_salt('bf')), -- 기본 비밀번호
    NOW(), -- 이메일 인증 완료
    jsonb_build_object(
        'name', pu.name, 
        'role', pu.role, 
        'phone', pu.phone
    ),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    COALESCE(pu.created_at, NOW()),
    NOW(),
    '', -- confirmation_token
    '', -- email_change
    '', -- email_change_token_new
    ''  -- recovery_token
FROM public.users pu
WHERE pu.email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com')
AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = pu.email
);

-- 3. 결과 확인
SELECT 
    pu.name,
    pu.email,
    pu.role,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 확인 필요'
    END as login_status,
    au.email_confirmed_at
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IN (
    'mas9golf3@gmail.com', 
    'singsingstour@naver.com',
    'mas9golf2@gmail.com',
    'Taksoo.kim'
)
ORDER BY pu.email;

COMMIT;

-- 추가 확인: 모든 public.users 중 auth.users에 없는 사용자 확인
SELECT 
    'auth.users에 없는 사용자' as status,
    pu.email,
    pu.name,
    pu.role
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE au.email IS NULL
AND pu.email IS NOT NULL;
