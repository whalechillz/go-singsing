-- 기존 active_users 테이블을 활용한 인증 설정
-- Supabase Auth와 연동을 위한 마이그레이션

-- active_users 테이블이 이미 존재하므로, auth.users와 연결만 설정
-- RLS (Row Level Security) 정책 추가

-- active_users 테이블에 RLS 활성화
ALTER TABLE public.active_users ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 프로필을 볼 수 있도록 정책 추가
CREATE POLICY "Users can view own profile" ON public.active_users
  FOR SELECT USING (
    id IN (
      SELECT id::uuid FROM auth.users WHERE auth.uid() = id
    )
  );

-- 관리자는 모든 프로필을 볼 수 있도록 정책 추가
CREATE POLICY "Admins can view all profiles" ON public.active_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.active_users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- 관리자는 모든 프로필을 수정할 수 있도록 정책 추가
CREATE POLICY "Admins can update all profiles" ON public.active_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.active_users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- 사용자가 자신의 프로필을 수정할 수 있도록 정책 추가 (role 제외)
CREATE POLICY "Users can update own profile" ON public.active_users
  FOR UPDATE USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text AND role = (SELECT role FROM public.active_users WHERE id = auth.uid()::text));

-- Supabase Auth 사용자 생성 시 active_users에 자동으로 추가하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- UUID 생성
  user_uuid := gen_random_uuid();
  
  -- active_users 테이블에 새 사용자 추가
  INSERT INTO public.active_users (
    id, 
    email, 
    name,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    true,
    NOW(),
    NOW()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (이미 존재하는 경우 먼저 삭제)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 샘플 사용자 추가 (auth.users에 추가)
-- 관리자
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'admin@singsinggolf.kr', 
  crypt('admin123!', gen_salt('bf')), 
  NOW(), 
  'authenticated',
  '{"role": "admin", "name": "관리자"}'::jsonb
);

-- 매니저
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'manager@singsinggolf.kr', 
  crypt('manager123!', gen_salt('bf')), 
  NOW(), 
  'authenticated',
  '{"role": "manager", "name": "매니저"}'::jsonb
);

-- 스탭
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'staff@singsinggolf.kr', 
  crypt('staff123!', gen_salt('bf')), 
  NOW(), 
  'authenticated',
  '{"role": "staff", "name": "스탭"}'::jsonb
);

-- 기존 active_users 데이터가 있다면 auth.users와 동기화
-- (필요한 경우 수동으로 실행)
