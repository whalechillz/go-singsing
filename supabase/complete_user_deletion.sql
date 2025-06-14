-- 사용자 관련 모든 테이블과 데이터 확인
-- 1. 사용자 ID 먼저 확인
WITH user_ids AS (
    SELECT id, email 
    FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
)
SELECT 
    'auth.users' as location,
    id::text as user_id,
    email
FROM user_ids;

-- 2. 각 테이블에서 해당 사용자 데이터 확인
-- profiles 테이블
SELECT 'profiles 테이블' as table_info, COUNT(*) as count
FROM public.profiles
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- users 테이블
SELECT 'users 테이블' as table_info, COUNT(*) as count
FROM public.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 3. 완전 삭제 스크립트
BEGIN;

-- auth 관련 테이블들 먼저 정리
DELETE FROM auth.sessions WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.refresh_tokens WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.mfa_factors WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM auth.mfa_challenges WHERE factor_id IN (
    SELECT id FROM auth.mfa_factors WHERE user_id IN (
        SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
    )
);

-- public 스키마 테이블들
DELETE FROM public.profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM public.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 마지막으로 auth.users에서 삭제
DELETE FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

COMMIT;

-- 삭제 확인
SELECT 
    'Deletion Complete' as status,
    COUNT(*) as remaining_users
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
