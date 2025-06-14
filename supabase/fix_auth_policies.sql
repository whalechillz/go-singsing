-- RLS 정책 수정 - 로그인 페이지가 작동하도록

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.active_users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.active_users;
DROP POLICY IF EXISTS "Allow anon to check schema" ON public.active_users;

-- 2. 더 유연한 정책 생성
-- 익명 사용자도 이메일로 사용자 존재 여부를 확인할 수 있도록
CREATE POLICY "Anyone can check user by email" ON public.active_users
  FOR SELECT USING (true);

-- 3. 인증된 사용자는 자신의 정보를 수정할 수 있음
CREATE POLICY "Users can update own profile" ON public.active_users
  FOR UPDATE USING (
    auth.uid()::text = id OR
    EXISTS (
      SELECT 1 FROM public.active_users
      WHERE id = auth.uid()::text AND role IN ('admin', 'manager')
    )
  );

-- 4. pgcrypto extension 확인
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 5. 테스트 사용자 확인 및 생성
DO $$
BEGIN
  -- admin 사용자가 없으면 생성
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@singsinggolf.kr') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'admin@singsinggolf.kr',
      crypt('admin123!', gen_salt('bf')),
      NOW(),
      'authenticated',
      '{"role": "admin", "name": "관리자"}'::jsonb
    );
  END IF;
END $$;

-- 6. active_users 테이블에도 동일한 사용자가 있는지 확인
SELECT 
  au.email as auth_email,
  au.id as auth_id,
  active.email as active_email,
  active.id as active_id,
  active.role,
  active.is_active
FROM auth.users au
LEFT JOIN public.active_users active ON au.email = active.email
WHERE au.email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');
