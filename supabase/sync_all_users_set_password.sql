-- 모든 사용자를 auth.users로 동기화하고 비밀번호를 90001004로 설정
-- 2025-06-15

BEGIN;

-- 1. 기존 auth.users의 비밀번호를 90001004로 업데이트
UPDATE auth.users
SET 
    encrypted_password = crypt('90001004', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN (
    SELECT email FROM public.users WHERE email IS NOT NULL
);

-- 2. public.users에만 있고 auth.users에 없는 사용자 추가
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
    recovery_token
)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    pu.email,
    crypt('90001004', gen_salt('bf')),
    NOW(),
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
    '',
    ''
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE au.email IS NULL
AND pu.email IS NOT NULL
AND pu.email != '';

-- 3. 결과 확인
SELECT 
    pu.name,
    pu.email,
    pu.role,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 로그인 불가' 
    END as login_status
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY pu.created_at DESC;

COMMIT;

-- 4. 모든 사용자 비밀번호 확인 메시지
SELECT 
    '모든 사용자의 비밀번호가 90001004로 설정되었습니다.' as message,
    COUNT(*) as total_users
FROM auth.users
WHERE email IN (SELECT email FROM public.users WHERE email IS NOT NULL);
