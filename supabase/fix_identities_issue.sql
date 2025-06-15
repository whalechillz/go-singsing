-- auth.identities 문제 해결
-- 2025-06-15

BEGIN;

-- 1. 현재 identities 상태 확인
SELECT 
    u.email,
    COUNT(i.id) as identity_count
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
GROUP BY u.email
ORDER BY u.email;

-- 2. identities가 없는 사용자들에게 생성
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
    jsonb_build_object('sub', u.id, 'email', u.email),
    'email',
    NULL,
    NOW(),
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities i 
    WHERE i.user_id = u.id AND i.provider = 'email'
);

-- 3. 비밀번호 재설정 (확실하게)
UPDATE auth.users 
SET 
    encrypted_password = crypt('90001004', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email IN (
    'singingstour@naver.com', 
    'mas9golf3@gmail.com'
);

COMMIT;

-- 4. 최종 확인
SELECT 
    u.email,
    u.email_confirmed_at,
    i.provider,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL AND i.id IS NOT NULL THEN '✅ 완벽'
        ELSE '❌ 문제있음'
    END as status
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
ORDER BY u.email;
