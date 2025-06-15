-- 특정 사용자의 비밀번호 설정
-- mas9golf@gmail.com 사용자의 비밀번호를 설정합니다

-- 먼저 사용자가 auth.users에 있는지 확인
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'mas9golf@gmail.com';

-- 사용자가 있다면 비밀번호 업데이트
UPDATE auth.users 
SET 
    encrypted_password = crypt('여기에원하는비밀번호입력', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'mas9golf@gmail.com';

-- 사용자가 없다면 생성
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'mas9golf@gmail.com',
    crypt('여기에원하는비밀번호입력', gen_salt('bf')),
    NOW(),
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
WHERE pu.email = 'mas9golf@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'mas9golf@gmail.com'
);
