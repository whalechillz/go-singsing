-- 로그인 로그 확인
-- 실패한 로그인 시도를 확인합니다

-- 1. 최근 로그인 시도 확인 (Supabase Dashboard → Logs → Auth에서도 확인 가능)
SELECT 
    created_at,
    raw_request->>'email' as email,
    raw_response->>'code' as error_code,
    raw_response->>'msg' as error_message,
    raw_response->>'status' as status
FROM auth.audit_log_entries
WHERE action = 'login_attempt'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 20;

-- 2. 특정 이메일의 로그인 시도 확인
SELECT 
    created_at,
    action,
    raw_request->>'email' as email,
    raw_response->>'code' as error_code,
    raw_response->>'msg' as error_message
FROM auth.audit_log_entries
WHERE raw_request->>'email' IN ('mas9golf3@gmail.com', 'singsingstour@naver.com')
ORDER BY created_at DESC
LIMIT 10;
