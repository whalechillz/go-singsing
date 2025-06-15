-- 로그인 문제 즉시 해결
-- mas9golf3@gmail.com, singsingstour@naver.com
-- 비밀번호: 90001004

BEGIN;

-- 1. 기존 auth.users 레코드가 있으면 삭제 (충돌 방지)
DELETE FROM auth.users 
WHERE email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com');

-- 2. auth.users에 사용자 추가
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
    updated_at
)
SELECT 
    COALESCE(pu.id::uuid, gen_random_uuid()),
    '00000000-0000-0000-0000-000000000000',
    pu.email,
    crypt('90001004', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
        'name', pu.name,
        'role', pu.role,
        'phone', COALESCE(pu.phone, '')
    ),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    COALESCE(pu.created_at, NOW()),
    NOW()
FROM public.users pu
WHERE pu.email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com');

-- 3. Taksoo.kim 사용자도 확인 (이메일 형식이 아닌 경우 처리)
-- Taksoo.kim이 실제 이메일이 아니라면, 적절한 이메일 주소로 변경 필요
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
    updated_at
)
SELECT 
    COALESCE(pu.id::uuid, gen_random_uuid()),
    '00000000-0000-0000-0000-000000000000',
    pu.email,
    crypt('90001004', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
        'name', pu.name,
        'role', pu.role,
        'phone', COALESCE(pu.phone, '')
    ),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    COALESCE(pu.created_at, NOW()),
    NOW()
FROM public.users pu
WHERE LOWER(pu.email) = 'taksoo.kim'
AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE LOWER(au.email) = LOWER(pu.email)
);

COMMIT;

-- 4. 결과 확인
SELECT 
    pu.name,
    pu.email,
    pu.role,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 로그인 불가'
    END as login_status,
    au.email_confirmed_at
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(pu.email) = LOWER(au.email)
WHERE LOWER(pu.email) IN (
    'mas9golf3@gmail.com',
    'singsingstour@naver.com',
    'mas9golf2@gmail.com',
    'taksoo.kim'
)
ORDER BY login_status DESC, pu.email;
