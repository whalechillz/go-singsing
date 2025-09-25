-- taksoo.kim@gmail.com 중복 사용자 문제 해결
-- 2025-01-15

BEGIN;

-- 1. 기존 사용자 완전 삭제 (순서 중요!)
-- auth.identities 먼저 삭제
DELETE FROM auth.identities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'taksoo.kim@gmail.com');

-- auth.users 삭제
DELETE FROM auth.users 
WHERE email = 'taksoo.kim@gmail.com';

-- public.users도 삭제 (선택사항)
DELETE FROM public.users 
WHERE email = 'taksoo.kim@gmail.com';

-- 2. 삭제 확인
SELECT '삭제 완료' as status, 
       COUNT(*) as remaining_users 
FROM auth.users 
WHERE email = 'taksoo.kim@gmail.com';

-- 3. 새로 생성
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

-- 4. auth.identities에 추가
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

-- 5. public.users에 동기화
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
);

-- 6. 최종 확인
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
