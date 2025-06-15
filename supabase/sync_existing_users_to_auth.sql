-- 기존 public.users를 auth.users로 동기화
-- 2025-06-15

-- 임시 비밀번호 설정 (나중에 변경 필요)
DO $$
DECLARE
    user_record RECORD;
    temp_password TEXT := 'TempPass123!';
BEGIN
    -- public.users에만 있고 auth.users에는 없는 사용자들 조회
    FOR user_record IN 
        SELECT pu.*
        FROM public.users pu
        LEFT JOIN auth.users au ON pu.email = au.email
        WHERE au.email IS NULL
        AND pu.email IS NOT NULL
        AND pu.email != ''
    LOOP
        BEGIN
            -- auth.users에 추가
            INSERT INTO auth.users (
                id,
                instance_id,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_user_meta_data,
                raw_app_meta_data,
                aud,
                role,
                created_at,
                updated_at,
                confirmation_token,
                recovery_token
            ) VALUES (
                gen_random_uuid(),
                '00000000-0000-0000-0000-000000000000',
                user_record.email,
                crypt(temp_password, gen_salt('bf')),
                NOW(),
                jsonb_build_object(
                    'name', user_record.name,
                    'role', user_record.role,
                    'phone', user_record.phone
                ),
                '{"provider": "email", "providers": ["email"]}'::jsonb,
                'authenticated',
                'authenticated',
                COALESCE(user_record.created_at, NOW()),
                NOW(),
                '',
                ''
            );
            
            RAISE NOTICE 'Created auth user for: %', user_record.email;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to create auth user for %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
END $$;

-- 동기화 결과 확인
SELECT 
    pu.name,
    pu.email,
    pu.role,
    CASE WHEN au.email IS NOT NULL THEN '✓ Auth 존재' ELSE '✗ Auth 없음' END as auth_status
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL
ORDER BY pu.created_at DESC;
