-- 1. pgcrypto 확장 활성화 (이미 있으면 무시됨)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. 비밀번호 재설정 (pgcrypto 활성화 후)
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
