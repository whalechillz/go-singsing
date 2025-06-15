-- identities 정확한 형식으로 생성
-- 2025-06-15

BEGIN;

-- 1. mas9golf3@gmail.com용 identity 생성
INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    u.id::text || '::' || u.id::text,  -- 기존 패턴과 동일한 형식
    u.id,
    jsonb_build_object(
        'sub', u.id::text,
        'email', u.email,
        'email_verified', true,
        'phone_verified', false
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
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    u.id::text || '::' || u.id::text,  -- 기존 패턴과 동일한 형식
    u.id,
    jsonb_build_object(
        'sub', u.id::text,
        'email', u.email,
        'email_verified', true,
        'phone_verified', false
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
    SUBSTRING(i.provider_id, 1, 36) as provider_id_preview,
    i.identity_data->>'email' as identity_email,
    CASE 
        WHEN i.id IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ identity 없음'
    END as status
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
ORDER BY u.email;
