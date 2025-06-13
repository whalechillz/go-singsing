-- Auth 설정 및 정책 확인
-- 1. auth.users 테이블의 사용자 상태 확인
SELECT 
  id,
  email,
  role,
  email_confirmed_at,
  confirmation_sent_at,
  banned_until,
  created_at,
  updated_at
FROM auth.users
WHERE email = 'admin@singsinggolf.kr';

-- 2. RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- 3. 새로운 관리자 계정 생성 (다른 방법)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'newadmin@singsinggolf.kr',
  crypt('newadmin123!', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "name": "새관리자"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- 4. public.users에도 추가
INSERT INTO public.users (id, name, phone, email, role, is_active, created_at, updated_at)
SELECT 
  id,
  '새관리자',
  '010-9999-9999',
  'newadmin@singsinggolf.kr',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'newadmin@singsinggolf.kr'
ON CONFLICT (id) DO NOTHING;
