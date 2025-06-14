-- 로그인 시도 기록 확인
SELECT 
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at,
    CASE 
        WHEN last_sign_in_at IS NOT NULL THEN '✓ 로그인 기록 있음'
        ELSE '✗ 로그인 기록 없음'
    END as login_status,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✓ 이메일 확인됨'
        ELSE '✗ 이메일 미확인'
    END as email_status
FROM auth.users
WHERE email IN (
    'mas9golf2@gmail.com',
    'mas9golf3@gmail.com', 
    'singsingstour@naver.com'
)
ORDER BY email;

-- auth.audit_log_entries에서 최근 로그인 시도 확인
SELECT 
    created_at,
    payload->>'email' as email,
    payload->>'event_message' as message,
    ip_address
FROM auth.audit_log_entries
WHERE 
    created_at > NOW() - INTERVAL '1 hour'
    AND payload->>'email' IN (
        'mas9golf2@gmail.com',
        'mas9golf3@gmail.com', 
        'singsingstour@naver.com'
    )
ORDER BY created_at DESC
LIMIT 20;
