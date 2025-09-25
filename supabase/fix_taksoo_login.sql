-- taksoo.kim@gmail.com 로그인 문제 해결
-- 2025-01-15

BEGIN;

-- 1. 기존 레코드가 있으면 삭제 (충돌 방지)
DELETE FROM auth.identities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'taksoo.kim@gmail.com');

DELETE FROM auth.users 
WHERE email = 'taksoo.kim@gmail.com';

-- 2. auth.users에 taksoo.kim@gmail.com 추가
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
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'taksoo.kim@gmail.com',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
        'name', 'Taksoo Kim',
        'role', 'admin',
        'phone', ''
    ),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    ''
);

-- 3. auth.identities에도 추가 (로그인을 위해 필수!)
INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'taksoo.kim@gmail.com')::text,
    (SELECT id FROM auth.users WHERE email = 'taksoo.kim@gmail.com'),
    jsonb_build_object(
        'sub', (SELECT id FROM auth.users WHERE email = 'taksoo.kim@gmail.com')::text,
        'email', 'taksoo.kim@gmail.com',
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    NULL,
    NOW(),
    NOW()
);

-- 4. public.users에도 동기화 (기존 데이터가 있다면 업데이트)
INSERT INTO public.users (
    name,
    email,
    phone,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Taksoo Kim',
    'taksoo.kim@gmail.com',
    '',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 5. 결과 확인
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'taksoo.kim@gmail.com'

UNION ALL

SELECT 
    'auth.identities' as table_name,
    id::uuid,
    provider,
    last_sign_in_at,
    created_at
FROM auth.identities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'taksoo.kim@gmail.com')

UNION ALL

SELECT 
    'public.users' as table_name,
    id,
    email,
    last_login,
    created_at
FROM public.users 
WHERE email = 'taksoo.kim@gmail.com';

COMMIT;

-- 로그인 정보
-- 이메일: taksoo.kim@gmail.com
-- 비밀번호: 90001004

