-- pgcrypto 확장 확인 및 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 새 사용자 생성
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- mas9golf3@gmail.com 생성
    user_id := gen_random_uuid();
    
    -- auth.users에 추가
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        role, 
        raw_user_meta_data
    )
    VALUES (
        user_id,
        'mas9golf3@gmail.com',
        crypt('90001004', gen_salt('bf')),
        NOW(),
        'authenticated',
        '{"role": "staff", "name": "마스골프3"}'::jsonb
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- public.users에 추가
    INSERT INTO public.users (id, email, name, phone)
    VALUES (user_id::text, 'mas9golf3@gmail.com', '마스골프3', '010-0000-0003')
    ON CONFLICT (id) DO NOTHING;
    
    -- singsingstour@naver.com 생성
    user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        role, 
        raw_user_meta_data
    )
    VALUES (
        user_id,
        'singsingstour@naver.com',
        crypt('90001004', gen_salt('bf')),
        NOW(),
        'authenticated',
        '{"role": "staff", "name": "싱싱투어"}'::jsonb
    )
    ON CONFLICT (email) DO NOTHING;
    
    INSERT INTO public.users (id, email, name, phone)
    VALUES (user_id::text, 'singsingstour@naver.com', '싱싱투어', '010-0000-0004')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '사용자 생성 완료';
END $$;

-- 생성된 사용자 확인
SELECT 
    au.email,
    au.created_at,
    pu.name,
    pu.phone
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id::text
WHERE au.email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com')
ORDER BY au.created_at DESC;
