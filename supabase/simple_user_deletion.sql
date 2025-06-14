-- 실제 존재하는 테이블만 사용하여 사용자 삭제
BEGIN;

-- 1. auth 관련 테이블들 정리
DELETE FROM auth.sessions WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.refresh_tokens WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- 2. public.users 테이블에서 삭제 (존재하는 경우)
DELETE FROM public.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 3. 마지막으로 auth.users에서 삭제
DELETE FROM auth.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

COMMIT;

-- 삭제 확인
SELECT 
    'Deletion Complete' as status,
    COUNT(*) as remaining_users
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
