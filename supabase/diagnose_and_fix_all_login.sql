-- 전체 사용자 로그인 문제 진단 및 해결
-- 2025-06-15

-- ===================================
-- STEP 1: 현재 상태 진단
-- ===================================
SELECT 
    '=== 현재 로그인 상태 진단 ===' as title;

-- public.users와 auth.users 매칭 상태 확인
WITH user_status AS (
    SELECT 
        pu.id,
        pu.name,
        pu.email as public_email,
        au.email as auth_email,
        CASE 
            WHEN au.email IS NOT NULL AND pu.email = au.email THEN '✅ 정상'
            WHEN au.email IS NOT NULL AND pu.email != au.email THEN '⚠️ 이메일 불일치'
            ELSE '❌ auth 없음'
        END as status
    FROM public.users pu
    LEFT JOIN auth.users au ON au.email IN (pu.email, 'mas9golf@gmail.com', 'mas9golf2@gmail.com', 'mas9golf3@gmail.com')
    WHERE pu.email IS NOT NULL
)
SELECT * FROM user_status ORDER BY status;

-- ===================================
-- STEP 2: 불일치 계정 수정
-- ===================================

-- Staffy 계정 수정 (mas9golf@gmail.com → mas9golf3@gmail.com)
DELETE FROM auth.users WHERE email = 'mas9golf@gmail.com';

INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at
) 
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'mas9golf3@gmail.com',
    crypt('90001004', gen_salt('bf')),
    NOW(),
    jsonb_build_object('name', 'Staffy', 'role', '매니저', 'phone', '01033329020'),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mas9golf3@gmail.com');

-- ===================================
-- STEP 3: 누락된 auth.users 생성
-- ===================================

-- public.users에만 있고 auth.users에 없는 계정들 생성
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    pu.email,
    crypt('90001004', gen_salt('bf')),
    NOW(),
    jsonb_build_object('name', pu.name, 'role', pu.role, 'phone', pu.phone),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
FROM public.users pu
WHERE pu.email IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.email = pu.email
);

-- ===================================
-- STEP 4: 최종 결과 확인
-- ===================================
SELECT 
    '=== 최종 로그인 가능 상태 ===' as title;

SELECT 
    pu.name as "이름",
    pu.email as "이메일",
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 로그인 불가'
    END as "상태",
    '90001004' as "비밀번호"
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY pu.created_at;

-- 이메일 인증 관련 설정 확인
SELECT 
    '=== 이메일 인증 설정 ===' as title;

SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ 인증됨'
        ELSE '❌ 미인증'
    END as "인증상태"
FROM auth.users
ORDER BY created_at DESC;
