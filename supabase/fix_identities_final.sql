-- identities 올바른 형식으로 생성 (최종)
-- 2025-06-15

BEGIN;

-- 1. identity가 없는 사용자들에게 생성
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
    gen_random_uuid() as id,
    u.id::text as provider_id,  -- user_id와 동일한 값 사용
    u.id as user_id,
    jsonb_build_object(
        'sub', u.id::text,
        'email', u.email,
        'email_verified', true,
        'phone_verified', false
    ) as identity_data,
    'email' as provider,
    NULL as last_sign_in_at,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE u.email IN ('mas9golf3@gmail.com', 'singingstour@naver.com')
AND NOT EXISTS (
    SELECT 1 FROM auth.identities i 
    WHERE i.user_id = u.id AND i.provider = 'email'
);

COMMIT;

-- 2. 결과 확인
SELECT 
    u.email,
    u.id as user_id,
    i.provider_id,
    i.provider,
    CASE 
        WHEN i.id IS NOT NULL THEN '✅ 생성 완료'
        ELSE '❌ 생성 실패'
    END as status
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email IN ('mas9golf3@gmail.com', 'singingstour@naver.com');

-- 3. 모든 사용자 최종 확인
SELECT 
    u.email,
    CASE 
        WHEN i.id IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ identity 없음'
    END as login_status
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id AND i.provider = 'email'
ORDER BY login_status DESC, u.email;
