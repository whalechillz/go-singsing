-- identities 문제 해결 (provider_id 포함)
-- 2025-06-15

BEGIN;

-- 1. mas9golf3@gmail.com용 identity 생성
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,  -- 이 컬럼 추가
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    u.email,  -- provider_id로 email 사용
    jsonb_build_object(
        'sub', u.id::text,
        'email', u.email,
        'email_verified', true
    ),
    'email',
    NULL,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'mas9golf3@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM auth.identities i 
    WHERE i.user_id = u.id AND i.provider = 'email'
);

-- 2. singingstour@naver.com용 identity 생성
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,  -- 이 컬럼 추가
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    u.email,  -- provider_id로 email 사용
    jsonb_build_object(
        'sub', u.id::text,
        'email', u.email,
        'email_verified', true
    ),
    'email',
    NULL,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'singingstour@naver.com'
AND NOT EXISTS (
    SELECT 1 FROM auth.identities i 
    WHERE i.user_id = u.id AND i.provider = 'email'
);

COMMIT;

-- 3. 결과 확인
SELECT 
    u.email,
    i.provider,
    i.provider_id,
    CASE 
        WHEN i.id IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ identity 없음'
    END as status
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
ORDER BY u.email;
