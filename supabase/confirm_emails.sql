-- 모든 테스트 사용자의 이메일을 확인됨으로 처리
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW()),
  updated_at = NOW()
WHERE email IN (
  'admin@singsinggolf.kr',
  'manager@singsinggolf.kr',
  'staff@singsinggolf.kr'
);

-- 확인
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email IN (
  'admin@singsinggolf.kr',
  'manager@singsinggolf.kr',
  'staff@singsinggolf.kr'
);
