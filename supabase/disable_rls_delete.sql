-- RLS 정책 때문에 삭제가 안 될 수 있으므로 일시적으로 비활성화
-- ⚠️ 주의: 이 작업은 보안에 영향을 줄 수 있으므로 작업 후 다시 활성화 필요

-- 1. RLS 비활성화
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. 사용자 삭제
DELETE FROM public.profiles 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

DELETE FROM public.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

DELETE FROM auth.identities 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
);

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

DELETE FROM auth.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 3. RLS 다시 활성화
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. 삭제 확인
SELECT 
    email,
    '여전히 남아있음' as status
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
