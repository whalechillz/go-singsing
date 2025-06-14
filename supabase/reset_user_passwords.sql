-- 특정 사용자들의 비밀번호를 90001004로 재설정
-- Supabase SQL Editor에서 실행

UPDATE auth.users 
SET encrypted_password = crypt('90001004', gen_salt('bf'))
WHERE email IN (
    'mas9golf2@gmail.com',
    'mas9golf3@gmail.com', 
    'singsingstour@naver.com'
);

-- 업데이트된 사용자 확인
SELECT 
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
WHERE email IN (
    'mas9golf2@gmail.com',
    'mas9golf3@gmail.com', 
    'singsingstour@naver.com'
)
ORDER BY email;
