-- 간단한 삭제 방법 (외래키 제약 무시)

-- 1. 사용자 확인
SELECT email FROM auth.users 
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');

-- 2. CASCADE 옵션으로 삭제 시도
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- 각 사용자별로 처리
    FOR user_record IN 
        SELECT id, email 
        FROM auth.users 
        WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
    LOOP
        -- 관련 데이터 삭제
        DELETE FROM auth.sessions WHERE user_id = user_record.id;
        DELETE FROM auth.refresh_tokens WHERE user_id = user_record.id;
        DELETE FROM auth.identities WHERE user_id = user_record.id;
        
        -- public.users에서 삭제 (id가 문자열로 저장된 경우)
        DELETE FROM public.users WHERE id = user_record.id::text;
        DELETE FROM public.users WHERE email = user_record.email;
        
        -- auth.users에서 삭제
        DELETE FROM auth.users WHERE id = user_record.id;
        
        RAISE NOTICE '사용자 % 삭제 완료', user_record.email;
    END LOOP;
END $$;

-- 3. 삭제 확인
SELECT 
    'Check deletion' as action,
    COUNT(*) as remaining_count
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
