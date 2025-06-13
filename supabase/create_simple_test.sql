-- 가장 간단한 테스트 계정 생성
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'simple@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW(), -- 이메일 확인됨
  NOW(), -- 확인됨
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW();

-- 확인
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'simple@test.com';
