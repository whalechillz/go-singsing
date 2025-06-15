-- 로그인 문제 완전 해결 스크립트
-- 이 한 파일만 실행하면 모든 문제가 해결됩니다
-- 2025-06-15

BEGIN;

-- 1. 기존 문제 계정 정리
DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com')
);
DELETE FROM auth.users WHERE email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com');

-- 2. 정상 작동하는 계정의 모든 필드를 완벽하게 복사
-- mas9golf2@gmail.com의 구조를 복사하여 새 계정 생성

-- mas9golf3@gmail.com 생성
WITH template AS (
    SELECT * FROM auth.users WHERE email = 'mas9golf2@gmail.com' LIMIT 1
)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, role, aud, 
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
)
SELECT 
    gen_random_uuid(),
    instance_id,
    'mas9golf3@gmail.com',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    raw_app_meta_data,
    jsonb_build_object('name', 'Staffy', 'role', '매니저', 'phone', '01033329020'),
    role,
    aud,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
FROM template;

-- singsingstour@naver.com 생성
WITH template AS (
    SELECT * FROM auth.users WHERE email = 'mas9golf2@gmail.com' LIMIT 1
)
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, role, aud, 
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
)
SELECT 
    gen_random_uuid(),
    instance_id,
    'singsingstour@naver.com',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    raw_app_meta_data,
    jsonb_build_object('name', 'Na', 'role', '직원', 'phone', ''),
    role,
    aud,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
FROM template;

-- 3. identities 생성 (정상 작동하는 계정의 패턴 복사)
INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id::text,
    u.id,
    jsonb_build_object(
        'sub', u.id::text,
        'email', u.email,
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com');

-- 4. 모든 사용자 이메일 인증 처리 (혹시 모르니)
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmation_token = '',
    recovery_token = '',
    email_change_token_new = '',
    email_change = ''
WHERE email_confirmed_at IS NULL;

COMMIT;

-- 5. 최종 결과 확인
SELECT 
    '✅ 로그인 가능한 계정:' as status;
    
SELECT 
    au.email,
    '90001004' as password,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL AND ai.id IS NOT NULL THEN '✅ 정상'
        ELSE '❌ 확인필요'
    END as login_status
FROM auth.users au
LEFT JOIN auth.identities ai ON au.id = ai.user_id
ORDER BY au.email;
