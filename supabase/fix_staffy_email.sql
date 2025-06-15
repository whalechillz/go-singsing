-- Staffy 이메일 변경을 위한 스크립트
-- mas9golf@gmail.com → mas9golf3@gmail.com

BEGIN;

-- 1. 기존 auth.users 레코드 삭제
DELETE FROM auth.users 
WHERE email = 'mas9golf@gmail.com';

-- 2. 새 이메일로 auth.users 생성
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
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'mas9golf3@gmail.com',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
        'name', 'Staffy',
        'role', '매니저',
        'phone', '01033329020'
    ),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
);

-- 3. 결과 확인
SELECT 
    pu.name,
    pu.email as "변경된_이메일",
    au.email as "auth_이메일",
    '90001004' as "비밀번호"
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.name = 'Staffy';

COMMIT;
