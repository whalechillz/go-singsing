-- RLS 비활성화 후 삭제
DO $$
BEGIN
    -- 1. RLS 비활성화
    ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
    
    -- 2. 관련 테이블 정리
    DELETE FROM auth.sessions WHERE user_id IN (
        SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
    );
    
    DELETE FROM auth.refresh_tokens WHERE user_id IN (
        SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
    );
    
    DELETE FROM auth.identities WHERE user_id IN (
        SELECT id FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
    );
    
    -- 3. public.users 삭제
    DELETE FROM public.users WHERE id IN (
        SELECT id::text FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
    );
    
    -- 4. auth.users 삭제
    DELETE FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
    
    -- 5. RLS 다시 활성화
    ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '사용자 삭제 완료';
END $$;

-- 확인
SELECT email FROM auth.users WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
