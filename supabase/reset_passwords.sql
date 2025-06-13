-- 비밀번호 재설정
UPDATE auth.users
SET encrypted_password = crypt('admin123!', gen_salt('bf'))
WHERE email = 'admin@singsinggolf.kr';

UPDATE auth.users
SET encrypted_password = crypt('manager123!', gen_salt('bf'))
WHERE email = 'manager@singsinggolf.kr';

UPDATE auth.users
SET encrypted_password = crypt('staff123!', gen_salt('bf'))
WHERE email = 'staff@singsinggolf.kr';

-- 확인
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');
