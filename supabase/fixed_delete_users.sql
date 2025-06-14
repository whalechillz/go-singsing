-- 사용자 삭제 스크립트 (수정된 버전)

-- 1. 먼저 삭제할 사용자가 있는지 확인
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as count
FROM public.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 2. 삭제 실행
BEGIN;

-- auth.sessions 삭제
DELETE FROM auth.sessions 
WHERE user_id::text IN (
    SELECT id::text FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- auth.refresh_tokens 삭제
DELETE FROM auth.refresh_tokens 
WHERE user_id::text IN (
    SELECT id::text FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- auth.identities 삭제
DELETE FROM auth.identities 
WHERE user_id::text IN (
    SELECT id::text FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- public.users 삭제
DELETE FROM public.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- auth.users 삭제
DELETE FROM auth.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

COMMIT;

-- 3. 삭제 결과 확인
SELECT 
    'Deletion completed' as status,
    NOW() as timestamp;
