-- auth.users와 public.users를 모두 생성하는 개선된 함수
-- 2025-06-15

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS create_auth_user(text, text, jsonb);

-- 새로운 함수 생성
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
  -- 이메일 중복 확인
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with email % already exists', user_email;
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
    recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    user_metadata,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    ''
  );

  -- public.users에도 생성 (트리거가 실패할 경우를 대비)
  INSERT INTO public.users (
    name,
    email,
    phone,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    COALESCE(user_metadata->>'name', user_email),
    user_email,
    user_metadata->>'phone',
    COALESCE(user_metadata->>'role', 'employee'),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  -- 결과 반환
  result := jsonb_build_object(
    'id', new_user_id,
    'email', user_email,
    'created', true
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- 오류 발생 시 롤백
    RAISE EXCEPTION 'Failed to create user: %', SQLERRM;
END;
$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO authenticated;
