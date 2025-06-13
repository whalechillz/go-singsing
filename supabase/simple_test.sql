-- 간단한 로그인 테스트
-- 1. auth.users에서 admin 계정 확인
SELECT 
  id,
  email,
  role,
  aud,
  confirmed_at,
  email_confirmed_at,
  banned_until,
  created_at
FROM auth.users
WHERE email = 'admin@singsinggolf.kr';

-- 2. 새로운 테스트 계정 생성 (가장 간단한 방법)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'simpletest@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- 3. 생성 확인
SELECT email, created_at FROM auth.users WHERE email = 'simpletest@test.com';
