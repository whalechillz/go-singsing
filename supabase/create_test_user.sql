-- 테스트용 새 사용자 생성 (비밀번호: 90001004)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    raw_user_meta_data,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'test001@singsinggolf.kr',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    'authenticated',
    '{"role": "staff", "name": "테스트사용자"}'::jsonb,
    NOW(),
    NOW()
);

-- 생성 확인
SELECT 
    email,
    created_at,
    '90001004' as password
FROM auth.users
WHERE email = 'test001@singsinggolf.kr';
