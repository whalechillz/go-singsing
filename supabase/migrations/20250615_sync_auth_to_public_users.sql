-- auth.users와 public.users 동기화를 위한 트리거
-- 2025-06-15

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION sync_auth_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
  -- public.users에 이미 존재하는지 확인
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
    -- public.users에 사용자 추가
    INSERT INTO public.users (
      name,
      email,
      phone,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
      true,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS sync_auth_users_to_public ON auth.users;
CREATE TRIGGER sync_auth_users_to_public
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_to_public_users();

-- 권한 부여
GRANT EXECUTE ON FUNCTION sync_auth_to_public_users() TO service_role;
