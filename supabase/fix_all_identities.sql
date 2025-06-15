-- 모든 identity 문제 해결
-- 2025-06-15

BEGIN;

-- 1. identity가 없는 모든 사용자에게 생성
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    jsonb_build_object(
        'sub', u.id::text,
        'email', u.email,
        'email_verified', true,
        'provider', 'email'
    ),
    'email',
    NULL,
    NOW(),
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM auth.identities i 
    WHERE i.user_id = u.id 
    AND i.provider = 'email'
)
AND u.email IS NOT NULL;

-- 2. 비밀번호 재확인 (안전을 위해)
UPDATE auth.users 
SET 
    encrypted_password = crypt('90001004', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN ('singingstour@naver.com', 'mas9golf3@gmail.com')
AND encrypted_password IS NULL;

COMMIT;

-- 3. 최종 확인
SELECT 
    u.email,
    CASE 
        WHEN i.id IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 여전히 문제있음'
    END as status,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.encrypted_password IS NOT NULL as has_password
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id AND i.provider = 'email'
ORDER BY status DESC, u.email;
