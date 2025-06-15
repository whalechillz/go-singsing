-- 모든 사용자 비밀번호 90001004로 설정
-- 이미 존재하는 모든 auth.users의 비밀번호를 재설정합니다

UPDATE auth.users 
SET 
    encrypted_password = crypt('90001004', gen_salt('bf')),
    updated_at = NOW()
WHERE email IS NOT NULL;

-- 결과 확인
SELECT 
    email,
    '90001004' as password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    updated_at
FROM auth.users
ORDER BY email;
