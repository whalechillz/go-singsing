-- 1. 먼저 auth.users에 있는지 확인
SELECT COUNT(*) as auth_user_count FROM auth.users;

-- 2. public.users의 테스트 계정 확인
SELECT id, email, name, role, is_active
FROM users
WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');

-- 3. auth.users에 테스트 사용자가 없다면 생성
DO $$
DECLARE
    admin_user RECORD;
    manager_user RECORD;
    staff_user RECORD;
BEGIN
    -- public.users에서 사용자 정보 가져오기
    SELECT * INTO admin_user FROM users WHERE email = 'admin@singsinggolf.kr' LIMIT 1;
    SELECT * INTO manager_user FROM users WHERE email = 'manager@singsinggolf.kr' LIMIT 1;
    SELECT * INTO staff_user FROM users WHERE email = 'staff@singsinggolf.kr' LIMIT 1;
    
    -- auth.users에 추가 (없는 경우만)
    IF admin_user.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@singsinggolf.kr') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            role,
            aud,
            created_at,
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            admin_user.id::uuid,
            '00000000-0000-0000-0000-000000000000',
            'admin@singsinggolf.kr',
            crypt('admin123!', gen_salt('bf')),
            NOW(),
            'authenticated',
            'authenticated',
            NOW(),
            NOW(),
            '{"role": "admin", "name": "관리자"}'::jsonb
        );
        RAISE NOTICE '관리자 계정 생성됨';
    END IF;
    
    IF manager_user.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@singsinggolf.kr') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            role,
            aud,
            created_at,
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            manager_user.id::uuid,
            '00000000-0000-0000-0000-000000000000',
            'manager@singsinggolf.kr',
            crypt('manager123!', gen_salt('bf')),
            NOW(),
            'authenticated',
            'authenticated',
            NOW(),
            NOW(),
            '{"role": "manager", "name": "매니저"}'::jsonb
        );
        RAISE NOTICE '매니저 계정 생성됨';
    END IF;
    
    IF staff_user.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'staff@singsinggolf.kr') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            role,
            aud,
            created_at,
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            staff_user.id::uuid,
            '00000000-0000-0000-0000-000000000000',
            'staff@singsinggolf.kr',
            crypt('staff123!', gen_salt('bf')),
            NOW(),
            'authenticated',
            'authenticated',
            NOW(),
            NOW(),
            '{"role": "staff", "name": "스탭"}'::jsonb
        );
        RAISE NOTICE '스탭 계정 생성됨';
    END IF;
END $$;

-- 4. 생성 확인
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'role' as role,
    au.raw_user_meta_data->>'name' as name
FROM auth.users au
WHERE au.email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');
