-- 모든 사용자의 비밀번호를 90001004로 재설정
-- Supabase SQL Editor에서 실행

-- 1. 먼저 현재 사용자 상태 확인
SELECT 
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email IN (
    'singsinggolf@naver.com',
    'singsingstour@naver.com',
    'mas9golf2@gmail.com',
    'mas9golf3@gmail.com'
)
ORDER BY email;

-- 2. 비밀번호 업데이트
UPDATE auth.users 
SET 
    encrypted_password = crypt('90001004', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN (
    'singsinggolf@naver.com',
    'singsingstour@naver.com',
    'mas9golf2@gmail.com',
    'mas9golf3@gmail.com'
);

-- 3. 업데이트 확인
SELECT 
    email,
    updated_at,
    '비밀번호가 90001004로 설정됨' as status
FROM auth.users
WHERE email IN (
    'singsinggolf@naver.com',
    'singsingstour@naver.com',
    'mas9golf2@gmail.com',
    'mas9golf3@gmail.com'
)
ORDER BY email;
