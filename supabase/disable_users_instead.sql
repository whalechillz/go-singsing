-- 삭제 대신 사용자 비활성화
UPDATE auth.users 
SET 
    email = CONCAT('deleted_', id::text, '@disabled.com'),
    encrypted_password = '',
    email_confirmed_at = NULL,
    raw_user_meta_data = '{"disabled": true}'::jsonb,
    updated_at = NOW()
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- public.users 테이블도 업데이트
UPDATE public.users
SET 
    email = CONCAT('deleted_', id, '@disabled.com'),
    is_active = false,
    updated_at = NOW()
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 확인
SELECT 
    email,
    email_confirmed_at,
    raw_user_meta_data->>'disabled' as disabled
FROM auth.users
WHERE email LIKE 'deleted_%@disabled.com';
