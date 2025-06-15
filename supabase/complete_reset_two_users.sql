-- Na와 Staffy 완전 리셋
-- 2025-06-15

BEGIN;

-- 1. 기존 레코드 완전 삭제
DELETE FROM auth.identities 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.users 
WHERE email IN ('singingstour@naver.com', 'mas9golf3@gmail.com');

-- 2. 새로 생성
-- Na
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, 
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data, 
    aud, role, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'singingstour@naver.com',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    '{"name": "Na", "role": "매니저"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
);

-- Staffy
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, 
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data, 
    aud, role, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'mas9golf3@gmail.com',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    '{"name": "Staffy", "role": "매니저"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
);

-- 3. identities 생성
INSERT INTO auth.identities (
    id, user_id, identity_data, provider, 
    last_sign_in_at, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    jsonb_build_object('sub', u.id, 'email', u.email),
    'email',
    NULL,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email IN ('singingstour@naver.com', 'mas9golf3@gmail.com');

COMMIT;

-- 4. 확인
SELECT 
    u.email,
    u.encrypted_password IS NOT NULL as has_password,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    i.id IS NOT NULL as has_identity,
    '90001004' as password
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email IN ('singingstour@naver.com', 'mas9golf3@gmail.com');
