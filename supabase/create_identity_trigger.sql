-- auth.users 생성 시 자동으로 identity 생성하는 트리거
-- 이렇게 하면 앞으로 모든 사용자가 자동으로 로그인 가능하게 됩니다

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION create_identity_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- auth.identities에 자동으로 추가
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
    NEW.id::text,
    NEW.id,
    jsonb_build_object(
      'sub', NEW.id::text,
      'email', NEW.email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NULL,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created_identity ON auth.users;
CREATE TRIGGER on_auth_user_created_identity
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_identity_for_new_user();