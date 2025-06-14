-- active_users가 뷰인 경우 실제 테이블 찾기 및 설정

-- 1. 데이터베이스 구조 확인
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name LIKE '%user%'
ORDER BY table_type, table_name;

-- 2. active_users 뷰 정의 확인
SELECT pg_get_viewdef('public.active_users'::regclass, true);

-- 3. 실제 users 테이블에 테스트 사용자 생성
-- users 테이블이 실제 테이블이라면
INSERT INTO public.users (email, name, role, is_active, password_hash, created_at, updated_at)
VALUES 
  ('admin@singsinggolf.kr', '관리자', 'admin', true, '', NOW(), NOW()),
  ('manager@singsinggolf.kr', '매니저', 'manager', true, '', NOW(), NOW()),
  ('staff@singsinggolf.kr', '스탭', 'staff', true, '', NOW(), NOW())
ON CONFLICT (email) DO UPDATE
SET 
  role = EXCLUDED.role,
  is_active = true,
  updated_at = NOW();

-- 4. auth.users에 동일한 사용자 생성
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
VALUES 
  (gen_random_uuid(), 'admin@singsinggolf.kr', crypt('admin123!', gen_salt('bf')), NOW(), 'authenticated', '{"role": "admin"}'::jsonb),
  (gen_random_uuid(), 'manager@singsinggolf.kr', crypt('manager123!', gen_salt('bf')), NOW(), 'authenticated', '{"role": "manager"}'::jsonb),
  (gen_random_uuid(), 'staff@singsinggolf.kr', crypt('staff123!', gen_salt('bf')), NOW(), 'authenticated', '{"role": "staff"}'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- 5. users 테이블이 있다면 RLS 비활성화
DO $$
BEGIN
  -- users 테이블이 존재하면 RLS 비활성화
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND table_type = 'BASE TABLE'
  ) THEN
    EXECUTE 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- 6. 현재 사용자 확인
SELECT 
  u.email,
  u.role,
  u.is_active,
  au.id as auth_id,
  au.email as auth_email
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');