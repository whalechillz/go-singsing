-- 개선된 create_auth_user 함수
-- auth.users와 auth.identities를 모두 생성
CREATE OR REPLACE FUNCTION create_auth_user(
  input_email text,
  input_password text,
  input_user_meta jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- 1. auth.users에 사용자 생성
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    input_email,
    crypt(input_password, gen_salt('bf')),
    NOW(), -- 이메일 자동 인증
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    input_user_meta,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  )
  RETURNING id INTO new_user_id;

  -- 2. auth.identities에도 추가 (로그인을 위해 필수!)
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id::text,
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', input_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NULL,
    NOW(),
    NOW()
  );

  -- 3. 결과 반환
  SELECT json_build_object(
    'id', new_user_id,
    'email', input_email,
    'created', true
  ) INTO result;

  RETURN result;

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('error', 'User already exists');
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;