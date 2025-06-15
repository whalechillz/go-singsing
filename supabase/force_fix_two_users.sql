-- 로그인 안 되는 2명 즉시 해결
-- 2025-06-15

BEGIN;

-- 1. 모든 auth.users 이메일 인증 완료 처리
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmation_token = '',
    email_change_token_new = '',
    email_change = '',
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Na와 Staffy 계정 확인 및 수정
-- Na (singingstour@naver.com)
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    encrypted_password = crypt('90001004', gen_salt('bf'))
WHERE email = 'singingstour@naver.com';

-- Staffy (mas9golf3@gmail.com) 
-- 혹시 이메일이 잘못되었을 경우를 대비
DELETE FROM auth.users WHERE email IN ('mas9golf@gmail.com', 'mas9golf3@gmail.com');

INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, 
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data, 
    aud, role, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'mas9golf3@gmail.com',
    crypt('90001004', gen_salt('bf')),
    NOW(), -- 이메일 인증됨
    '{"name": "Staffy", "role": "매니저"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
);

-- 3. 혹시 public.users와 auth.users 이메일이 다른 경우 확인
WITH email_check AS (
    SELECT 
        pu.name,
        pu.email as public_email,
        au.email as auth_email,
        au.email_confirmed_at,
        CASE 
            WHEN au.email IS NULL THEN '❌ auth 없음'
            WHEN pu.email != au.email THEN '⚠️ 이메일 불일치'
            WHEN au.email_confirmed_at IS NULL THEN '⚠️ 미인증'
            ELSE '✅ 정상'
        END as status
    FROM public.users pu
    FULL OUTER JOIN auth.users au ON pu.email = au.email
    WHERE pu.email IS NOT NULL OR au.email IS NOT NULL
)
SELECT * FROM email_check WHERE status != '✅ 정상';

COMMIT;

-- 4. 최종 로그인 가능 확인
SELECT 
    COALESCE(pu.name, 'Unknown') as "이름",
    COALESCE(pu.email, au.email) as "이메일",
    CASE 
        WHEN au.email IS NOT NULL AND au.email_confirmed_at IS NOT NULL THEN '✅ 로그인 가능'
        WHEN au.email IS NOT NULL AND au.email_confirmed_at IS NULL THEN '⚠️ 이메일 미인증'
        ELSE '❌ auth 없음'
    END as "상태"
FROM public.users pu
FULL OUTER JOIN auth.users au ON pu.email = au.email
ORDER BY "상태" DESC;
