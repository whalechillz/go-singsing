-- 비밀번호를 확실하게 재설정
UPDATE auth.users
SET 
  encrypted_password = crypt('admin123!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@singsinggolf.kr';

-- 설정 확인
SELECT 
  id,
  email,
  created_at,
  updated_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'admin@singsinggolf.kr';
