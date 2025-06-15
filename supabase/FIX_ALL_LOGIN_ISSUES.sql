-- ===================================
-- 싱싱골프 로그인 문제 완전 해결 스크립트
-- 2025-06-15
-- 비밀번호: 90001004
-- ===================================

-- 트랜잭션 시작
BEGIN;

-- ===================================
-- STEP 1: 전화번호 형식 정리 (하이픈 제거)
-- ===================================
UPDATE public.users
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL 
  AND (phone LIKE '%-%' OR phone LIKE '% %');

-- ===================================
-- STEP 2: 개선된 create_auth_user 함수 생성
-- ===================================
DROP FUNCTION IF EXISTS create_auth_user(text, text, jsonb);

CREATE OR REPLACE FUNCTION create_auth_user(
  user_email text,
  user_password text,
  user_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  new_user_id uuid;
  result jsonb;
BEGIN
  -- 입력값 검증
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'Email cannot be empty';
  END IF;
  
  IF user_password IS NULL OR length(user_password) < 6 THEN
    user_password := '90001004';
  END IF;

  -- 이메일 중복 확인
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    -- 이미 존재하면 비밀번호만 업데이트
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(user_password, gen_salt('bf')),
      raw_user_meta_data = COALESCE(user_metadata, raw_user_meta_data),
      updated_at = NOW()
    WHERE email = user_email
    RETURNING id INTO new_user_id;
    
    result := jsonb_build_object(
      'id', new_user_id,
      'email', user_email,
      'updated', true
    );
    
    RETURN result;
  END IF;

  -- UUID 생성
  new_user_id := gen_random_uuid();

  -- auth.users에 사용자 생성
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    COALESCE(user_metadata, '{}'::jsonb),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  );

  result := jsonb_build_object(
    'id', new_user_id,
    'email', user_email,
    'created', true
  );

  RETURN result;
END;
$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO anon;

-- ===================================
-- STEP 3: 기존 auth.users 비밀번호 업데이트
-- ===================================
UPDATE auth.users
SET 
    encrypted_password = crypt('90001004', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN (
    SELECT email FROM public.users WHERE email IS NOT NULL
);

-- ===================================
-- STEP 4: public.users의 모든 사용자를 auth.users에 동기화
-- ===================================
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT pu.*
        FROM public.users pu
        LEFT JOIN auth.users au ON pu.email = au.email
        WHERE au.email IS NULL
        AND pu.email IS NOT NULL
        AND pu.email != ''
    LOOP
        BEGIN
            INSERT INTO auth.users (
                id,
                instance_id,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_user_meta_data,
                raw_app_meta_data,
                aud,
                role,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                '00000000-0000-0000-0000-000000000000',
                user_record.email,
                crypt('90001004', gen_salt('bf')),
                NOW(),
                jsonb_build_object(
                    'name', user_record.name,
                    'role', user_record.role,
                    'phone', user_record.phone
                ),
                '{"provider": "email", "providers": ["email"]}'::jsonb,
                'authenticated',
                'authenticated',
                COALESCE(user_record.created_at, NOW()),
                NOW()
            );
            
            RAISE NOTICE 'Created auth user for: %', user_record.email;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to create auth user for %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
END $$;

COMMIT;

-- ===================================
-- STEP 5: 결과 확인
-- ===================================
SELECT 
    pu.name as "이름",
    pu.email as "이메일",
    pu.role as "역할",
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 로그인 불가' 
    END as "로그인 상태",
    '90001004' as "비밀번호"
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY pu.created_at DESC;

-- 요약 통계
SELECT 
    '=== 로그인 설정 완료 ===' as message,
    COUNT(DISTINCT pu.email) as "전체 사용자",
    COUNT(DISTINCT au.email) as "로그인 가능",
    COUNT(DISTINCT pu.email) - COUNT(DISTINCT au.email) as "로그인 불가"
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL;
