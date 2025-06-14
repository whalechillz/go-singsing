-- 1. 전체 사용자 수 확인
SELECT COUNT(*) as total_users FROM public.users;

-- 2. 삭제하려던 사용자들이 있는지 확인
SELECT 
    id,
    email,
    name,
    phone
FROM public.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 3. auth.users 테이블에도 있는지 확인  
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 4. 현재 보이는 사용자들의 이메일 확인
SELECT 
    email,
    name,
    phone
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
