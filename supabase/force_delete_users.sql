-- 사용자 삭제 전 관련 데이터 확인 및 정리
-- Supabase SQL Editor에서 실행

-- 1. 먼저 관련 테이블 확인
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
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')

UNION ALL

SELECT 
    'public.profiles' as table_name,
    COUNT(*) as count
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 2. 사용자의 ID 확인
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 3. 관련 테이블에서 먼저 삭제 (외래 키 제약 해결)
-- public.profiles 테이블에서 삭제
DELETE FROM public.profiles
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

-- public.users 테이블에서 삭제
DELETE FROM public.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 4. 이제 auth.users에서 삭제
DELETE FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 5. 삭제 확인
SELECT 
    email,
    'auth.users에서 삭제됨' as status
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
