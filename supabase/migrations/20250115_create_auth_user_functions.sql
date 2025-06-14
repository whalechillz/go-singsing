-- Auth 사용자 생성 함수
-- 2025-01-15

-- create_auth_user 함수 생성
CREATE OR REPLACE FUNCTION create_auth_user(
  user_email text,
  user_password text,
  user_metadata jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
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
    'authenticate