-- 즉시 모든 로그인 문제 해결
-- 2025-06-15

BEGIN;

-- 1. Staffy 이메일 변경 처리
DELETE FROM auth.users WHERE email = 'mas9golf@gmail.com';

-- 2. 모든 public.users를 auth.users와 동기화
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, 
    email_confirmed_at, -- 이메일 인증 완료로 설정
    raw_user_meta_data, raw_app_meta_data, 
    aud, role, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    pu.email,
    crypt('90001004', gen_salt('bf')),
    NOW(), -- 이메일 인증됨
    jsonb_build_object(
        'name', pu.name, 
        'role', pu.role, 
        'phone', pu.phone
    ),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
FROM public.users pu
WHERE pu.email IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = pu.email
);

-- 3. 기존 사용자들도 이메일 인증 완료 처리
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

COMMIT;

-- 4. 결과 확인
SELECT 
    pu.name,
    pu.email,
    au.email_confirmed_at,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 확인 필요'
    END as status
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY pu.name;
