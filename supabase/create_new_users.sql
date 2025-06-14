-- 새로운 사용자 생성 (비밀번호: 90001004)
DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- 1. mas9golf2@gmail.com (이미 있으면 스킵)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mas9golf2@gmail.com') THEN
        new_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
            new_user_id,
            'mas9golf2@gmail.com',
            crypt('90001004', gen_salt('bf')),
            NOW(),
            'authenticated',
            '{"role": "staff", "name": "마스골프2"}'::jsonb
        );
        
        INSERT INTO public.users (id, email, name, phone)
        VALUES (new_user_id::text, 'mas9golf2@gmail.com', '마스골프2', '010-0000-0002');
    END IF;

    -- 2. mas9golf3@gmail.com
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mas9golf3@gmail.com') THEN
        new_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
            new_user_id,
            'mas9golf3@gmail.com',
            crypt('90001004', gen_salt('bf')),
            NOW(),
            'authenticated',
            '{"role": "staff", "name": "마스골프3"}'::jsonb
        );
        
        INSERT INTO public.users (id, email, name, phone)
        VALUES (new_user_id::text, 'mas9golf3@gmail.com', '마스골프3', '010-0000-0003');
    END IF;

    -- 3. singsingstour@naver.com
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'singsingstour@naver.com') THEN
        new_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
            new_user_id,
            'singsingstour@naver.com',
            crypt('90001004', gen_salt('bf')),
            NOW(),
            'authenticated',
            '{"role": "staff", "name": "싱싱투어"}'::jsonb
        );
        
        INSERT INTO public.users (id, email, name, phone)
        VALUES (new_user_id::text, 'singsingstour@naver.com', '싱싱투어', '010-0000-0004');
    END IF;
    
    RAISE NOTICE '사용자 생성 완료!';
END $$;

-- 생성 확인
SELECT email, name, phone 
FROM public.users 
WHERE email IN ('mas9golf2@gmail.com', 'mas9golf3@gmail.com', 'singsingstour@naver.com');
