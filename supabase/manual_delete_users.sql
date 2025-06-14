-- 직접 삭제 방법 (함수 사용하지 않음)

-- 1. 먼저 삭제하려는 사용자가 있는지 확인
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count,
    string_agg(email, ', ') as emails
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as count,
    string_agg(email, ', ') as emails
FROM public.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 2. 삭제가 필요한 경우 아래 실행
-- Transaction으로 묶어서 안전하게 처리
BEGIN;

-- auth 관련 테이블 정리
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
