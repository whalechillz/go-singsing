-- 개선된 create_auth_user 함수 (에러 처리 강화)
-- 2025-06-15

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS create_auth_user(text, text, jsonb);

-- 새로운 함수 생성
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
    user_password := '90001004'; -- 기본 비밀번호
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
      'updated', true,
      'message', 'User already exists - password updated'
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
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(), -- 이메일 확인됨으로 설정
    COALESCE(user_metadata, '{}'::jsonb),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- 결과 반환
  result := jsonb_build_object(
    'id', new_user_id,
    'email', user_email,
    'created', true,
    'message', 'User created successfully'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- 오류 발생 시 상세 정보 반환
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO anon;
