-- create_auth_user 함수 생성
-- 이메일이 있는 사용자를 auth.users와 public.users에 동시에 추가
-- 
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor에서 이 코드를 실행
-- 2. 또는 supabase db push 명령어 사용

CREATE OR REPLACE FUNCTION create_auth_user(
  user_email text,
  user_password text,
  user_metadata jsonb
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
  -- 이메일 중복 체크
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with email % already exists', user_email;
  END IF;

  -- auth.users에 사용자 생성
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    user_metadata,
    'authenticated',
    NOW(),
    NOW()
  ) RETURNING id INTO new_user_id;
  
  -- 결과 반환
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email already exists'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- 비밀번호 초기화 함수도 추가
CREATE OR REPLACE FUNCTION reset_user_password(
  user_email text,
  new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION create_auth_user TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_password TO authenticated;
