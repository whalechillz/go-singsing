-- 사용자 완전 삭제 스크립트 (profiles 테이블 제외)
BEGIN;
SELECT delete_user_safely('singsingtour@naver.com');
-- 1. auth 관련 테이블들 정리
DELETE FROM auth.sessions 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.refresh_tokens 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.identities 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.mfa_factors 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- 2. public.users 테이블에서 삭제
-- users 테이블의 id가 문자열 형태이므로 조인으로 처리
DELETE FROM public.users 
WHERE id IN (
    SELECT id::text FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- 3. 마지막으로 auth.users에서 삭제
DELETE FROM auth.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

COMMIT;

-- 삭제 확인
SELECT 
    'Auth users' as table_name,
    COUNT(*) as count
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
UNION ALL
SELECT 
    'Public users' as table_name,
    COUNT(*) as count
FROM public.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
