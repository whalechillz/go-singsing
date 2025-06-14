-- 더 강력한 삭제 방법 (CASCADE 사용)
-- 모든 관련 데이터를 한번에 삭제

DO $$
DECLARE
    user_id UUID;
    user_email TEXT;
BEGIN
    -- 삭제할 이메일 목록
    FOR user_email IN 
        SELECT unnest(ARRAY[
            'singsinggolf@naver.com',
            'singsingstour@naver.com',
            'mas9golf3@gmail.com'
        ])
    LOOP
        -- 사용자 ID 찾기
        SELECT id INTO user_id FROM auth.users WHERE email = user_email;
        
        IF user_id IS NOT NULL THEN
            -- 모든 관련 테이블에서 삭제
            -- 1. profiles 테이블
            DELETE FROM public.profiles WHERE id = user_id;
            
            -- 2. users 테이블 (텍스트 ID 사용)
            DELETE FROM public.users WHERE id = user_id::text;
            
            -- 3. 기타 관련 테이블이 있다면 여기에 추가
            -- DELETE FROM public.other_table WHERE user_id = user_id;
            
            -- 4. auth.identities 테이블
            DELETE FROM auth.identities WHERE user_id = user_id;
            
            -- 5. auth.sessions 테이블
            DELETE FROM auth.sessions WHERE user_id = user_id;
            
            -- 6. auth.refresh_tokens 테이블
            DELETE FROM auth.refresh_tokens WHERE user_id = user_id;
            
            -- 7. 마지막으로 auth.users에서 삭제
            DELETE FROM auth.users WHERE id = user_id;
            
            RAISE NOTICE '사용자 % 삭제 완료', user_email;
        ELSE
            RAISE NOTICE '사용자 % 를 찾을 수 없음', user_email;
        END IF;
    END LOOP;
END $$;

-- 삭제 확인
SELECT 
    'auth.users' as table_name,
    COUNT(*) as remaining_count
FROM auth.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com')
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as remaining_count
FROM public.users
WHERE email IN ('singsinggolf@naver.com', 'singsingstour@naver.com', 'mas9golf3@gmail.com');
