-- 로그인 문제 완전 진단 스크립트
-- 2025-06-15
-- 이 스크립트로 정확한 문제를 파악합니다

-- 1. 전체 사용자 상태 확인
SELECT 
    '=== 전체 사용자 상태 ===' as section;

SELECT 
    pu.name,
    pu.email as public_email,
    au.email as auth_email,
    au.id as auth_user_id,
    CASE 
        WHEN au.email IS NULL THEN '❌ auth.users에 없음'
        WHEN au.email != pu.email THEN '❌ 이메일 불일치'
        ELSE '✅ 정상'
    END as sync_status,
    au.email_confirmed_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ 인증됨'
        ELSE '❌ 미인증'
    END as email_status,
    CASE 
        WHEN ai.id IS NOT NULL THEN '✅ 있음'
        ELSE '❌ 없음'
    END as identity_status,
    au.created_at as auth_created,
    au.updated_at as auth_updated
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(pu.email) = LOWER(au.email)
LEFT JOIN auth.identities ai ON au.id = ai.user_id
WHERE pu.email IS NOT NULL
ORDER BY pu.name;

-- 2. auth.identities 상세 확인
SELECT 
    '=== auth.identities 상태 ===' as section;

SELECT 
    au.email,
    ai.id as identity_id,
    ai.provider,
    ai.provider_id,
    ai.identity_data,
    ai.created_at,
    ai.last_sign_in_at
FROM auth.users au
LEFT JOIN auth.identities ai ON au.id = ai.user_id
ORDER BY au.email;

-- 3. 로그인 불가능한 계정만 표시
SELECT 
    '=== 로그인 불가능한 계정 ===' as section;

SELECT 
    pu.name,
    pu.email,
    CASE 
        WHEN au.email IS NULL THEN 'auth.users에 없음'
        WHEN ai.id IS NULL THEN 'identity 없음'
        WHEN au.email_confirmed_at IS NULL THEN '이메일 미인증'
        ELSE '원인 불명'
    END as problem
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(pu.email) = LOWER(au.email)
LEFT JOIN auth.identities ai ON au.id = ai.user_id
WHERE pu.email IS NOT NULL
AND (au.email IS NULL OR ai.id IS NULL OR au.email_confirmed_at IS NULL);

-- 4. 중복 이메일 확인
SELECT 
    '=== 중복 이메일 확인 ===' as section;

SELECT 
    email,
    COUNT(*) as count
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- 5. 대소문자 문제 확인
SELECT 
    '=== 대소문자 문제 확인 ===' as section;

SELECT 
    pu.email as public_email,
    au.email as auth_email,
    CASE 
        WHEN pu.email != au.email AND LOWER(pu.email) = LOWER(au.email) THEN '⚠️ 대소문자 불일치'
        ELSE '✅ 정상'
    END as case_status
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(pu.email) = LOWER(au.email)
WHERE pu.email IS NOT NULL;
