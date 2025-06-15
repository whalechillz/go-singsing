-- 모든 사용자 로그인 문제 완전 해결
-- 2025-06-15

BEGIN;

-- 1. 현재 상태 백업 (디버깅용)
CREATE TEMP TABLE temp_user_status AS
SELECT 
    pu.email as public_email,
    au.email as auth_email,
    pu.name,
    pu.role
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
WHERE pu.email IS NOT NULL;

-- 2. auth.users와 public.users 완전 동기화
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- public.users의 모든 사용자를 순회
    FOR user_record IN 
        SELECT 
            pu.id,
            pu.email,
            pu.name,
            pu.role,
            pu.phone,
            pu.created_at
        FROM public.users pu
        WHERE pu.email IS NOT NULL
        AND pu.email != ''
        AND NOT EXISTS (
            SELECT 1 FROM auth.users au 
            WHERE LOWER(au.email) = LOWER(pu.email)
        )
    LOOP
        BEGIN
            -- auth.users에 사용자 추가
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
                updated_at
            ) VALUES (
                CASE 
                    WHEN user_record.id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                    THEN user_record.id::uuid
                    ELSE gen_random_uuid()
                END,
                '00000000-0000-0000-0000-000000000000',
                LOWER(user_record.email), -- 이메일 소문자로 정규화
                crypt('90001004', gen_salt('bf')),
                NOW(),
                jsonb_build_object(
                    'name', COALESCE(user_record.name, '이름없음'),
                    'role', COALESCE(user_record.role, 'staff'),
                    'phone', COALESCE(user_record.phone, '')
                ),
                '{"provider": "email", "providers": ["email"]}'::jsonb,
                'authenticated',
                'authenticated',
                COALESCE(user_record.created_at, NOW()),
                NOW()
            );
            
            RAISE NOTICE '사용자 추가됨: %', user_record.email;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '사용자 추가 실패: % - %', user_record.email, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. 결과 확인
SELECT 
    'Before' as stage,
    COUNT(*) as user_count
FROM temp_user_status
WHERE auth_email IS NULL
UNION ALL
SELECT 
    'After' as stage,
    COUNT(*) as user_count
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(pu.email) = LOWER(au.email)
WHERE pu.email IS NOT NULL AND au.email IS NULL;

-- 4. 최종 사용자 상태
SELECT 
    pu.name,
    pu.email,
    pu.role,
    CASE 
        WHEN au.email IS NOT NULL THEN '✅ 로그인 가능'
        ELSE '❌ 여전히 문제있음'
    END as login_status
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(pu.email) = LOWER(au.email)
WHERE pu.email IS NOT NULL
ORDER BY login_status DESC, pu.name;

-- 5. 정리
DROP TABLE IF EXISTS temp_user_status;

COMMIT;

-- 비밀번호 정보
-- 모든 사용자의 기본 비밀번호: 90001004
