-- 로그인 문제 진단 및 해결 (통합 버전)
-- 2025-06-15

-- STEP 1: 진단
SELECT '=== STEP 1: 현재 상태 진단 ===' as step;

SELECT 
    pu.name,
    pu.email,
    CASE WHEN au.id IS NOT NULL THEN '✅' ELSE '❌' END as "auth.users",
    CASE WHEN ai.id IS NOT NULL THEN '✅' ELSE '❌' END as "identity",
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN '✅' ELSE '❌' END as "이메일인증",
    CASE 
        WHEN au.id IS NOT NULL AND ai.id IS NOT NULL AND au.email_confirmed_at IS NOT NULL 
        THEN '✅ 로그인 가능'
        ELSE '❌ 로그인 불가'
    END as "최종상태"
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
LEFT JOIN auth.identities ai ON au.id = ai.user_id
WHERE pu.email IS NOT NULL
ORDER BY "최종상태" DESC, pu.name;

-- STEP 2: 문제 해결
SELECT '=== STEP 2: 문제 해결 중... ===' as step;

-- 2-1. auth.users에 없는 사용자 추가
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
    jsonb_build_object('name', pu.name, 'role', pu.role, 'phone', COALESCE(pu.phone, '')),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
FROM public.users pu
WHERE pu.email IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = pu.email);

-- 2-2. identity가 없는 사용자에게 identity 추가
INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    au.id::text,
    au.id,
    jsonb_build_object(
        'sub', au.id::text,
        'email', au.email,
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    NOW(),
    NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM auth.identities ai WHERE ai.user_id = au.id);

-- 2-3. 이메일 인증 처리
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- STEP 3: 최종 확인
SELECT '=== STEP 3: 최종 결과 ===' as step;

SELECT 
    pu.name,
    pu.email,
    '90001004' as password,
    CASE 
        WHEN au.id IS NOT NULL AND ai.id IS NOT NULL AND au.email_confirmed_at IS NOT NULL 
        THEN '✅ 로그인 가능'
        ELSE '❌ 여전히 문제있음'
    END as status
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
LEFT JOIN auth.identities ai ON au.id = ai.user_id
WHERE pu.email IS NOT NULL
ORDER BY status DESC, pu.name;

-- STEP 4: 문제가 남아있다면 상세 정보
SELECT '=== STEP 4: 남은 문제 상세 ===' as step;

SELECT 
    pu.email,
    CASE 
        WHEN au.id IS NULL THEN 'auth.users에 없음'
        WHEN ai.id IS NULL THEN 'identity 없음'
        WHEN au.email_confirmed_at IS NULL THEN '이메일 미인증'
        ELSE '알 수 없는 문제'
    END as problem_detail,
    au.id as auth_user_id
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
LEFT JOIN auth.identities ai ON au.id = ai.user_id
WHERE pu.email IS NOT NULL
AND (au.id IS NULL OR ai.id IS NULL OR au.email_confirmed_at IS NULL);
