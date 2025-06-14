-- 사용자 삭제 문제 해결 스크립트

-- 1. 현재 외래 키 제약 조건 확인
SELECT 
    tc.constraint_name, 
    tc.table_schema, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth';

-- 2. active_users 테이블의 외래 키 제약 조건 수정 (CASCADE DELETE 추가)
-- 먼저 기존 제약 조건 삭제
ALTER TABLE public.active_users 
DROP CONSTRAINT IF EXISTS active_users_id_fkey;

-- CASCADE DELETE로 다시 생성
ALTER TABLE public.active_users
ADD CONSTRAINT active_users_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 3. 다른 관련 테이블들도 CASCADE DELETE로 수정
-- email_templates 테이블
ALTER TABLE public.email_templates 
DROP CONSTRAINT IF EXISTS email_templates_created_by_fkey;

ALTER TABLE public.email_templates
ADD CONSTRAINT email_templates_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

ALTER TABLE public.email_templates 
DROP CONSTRAINT IF EXISTS email_templates_updated_by_fkey;

ALTER TABLE public.email_templates
ADD CONSTRAINT email_templates_updated_by_fkey 
FOREIGN KEY (updated_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- 4. 사용자 삭제 함수 생성 (안전한 삭제)
CREATE OR REPLACE FUNCTION delete_user_safely(user_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- 사용자 ID 찾기
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User not found: %', user_email;
        RETURN FALSE;
    END IF;
    
    -- active_users에서 먼저 삭제 (CASCADE가 작동하지 않을 경우를 대비)
    DELETE FROM public.active_users WHERE id = user_id::text;
    
    -- auth.users에서 삭제 (이제 CASCADE로 관련 데이터 자동 삭제)
    DELETE FROM auth.users WHERE id = user_id;
    
    RAISE NOTICE 'User deleted successfully: %', user_email;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting user: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 특정 사용자의 관련 데이터 확인 함수
CREATE OR REPLACE FUNCTION check_user_dependencies(user_email VARCHAR)
RETURNS TABLE (
    table_name TEXT,
    record_count BIGINT
) AS $$
DECLARE
    user_id UUID;
BEGIN
    -- 사용자 ID 찾기
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User not found: %', user_email;
        RETURN;
    END IF;
    
    -- active_users 확인
    RETURN QUERY
    SELECT 'active_users'::TEXT, COUNT(*)
    FROM public.active_users 
    WHERE id = user_id::text;
    
    -- email_logs 확인
    RETURN QUERY
    SELECT 'email_logs'::TEXT, COUNT(*)
    FROM public.email_logs 
    WHERE recipient_email = user_email;
    
    -- 다른 관련 테이블들도 확인 가능
    
END;
$$ LANGUAGE plpgsql;

-- 6. 수동으로 특정 사용자 삭제하기
-- 예시: singsingtour@naver.com 사용자 삭제
-- 먼저 의존성 확인
-- SELECT * FROM check_user_dependencies('singsingtour@naver.com');

-- 안전하게 삭제
-- SELECT delete_user_safely('singsingtour@naver.com');

-- 또는 직접 삭제 (주의!)
-- DELETE FROM public.active_users WHERE email = 'singsingtour@naver.com';
-- DELETE FROM auth.users WHERE email = 'singsingtour@naver.com';
