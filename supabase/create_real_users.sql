-- 실제 사용자 생성 스크립트
-- mas9golf2@gmail.com, mas9golf3@gmail.com, singsingstour@naver.com

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    -- 1. mas9golf2@gmail.com 생성
    SELECT id INTO user1_id FROM auth.users WHERE email = 'mas9golf2@gmail.com';
    IF user1_id IS NULL THEN
        user1_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
          user1_id,
          'mas9golf2@gmail.com', 
          crypt('90001004', gen_salt('bf')), 
          NOW(), 
          'authenticated',
          '{"role": "staff", "name": "사용자2"}'::jsonb
        );
    END IF;

    -- 2. mas9golf3@gmail.com 생성
    SELECT id INTO user2_id FROM auth.users WHERE email = 'mas9golf3@gmail.com';
    IF user2_id IS NULL THEN
        user2_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
          user2_id,
          'mas9golf3@gmail.com', 
          crypt('90001004', gen_salt('bf')), 
          NOW(), 
          'authenticated',
          '{"role": "staff", "name": "사용자3"}'::jsonb
        );
    END IF;

    -- 3. singsingstour@naver.com 생성
    SELECT id INTO user3_id FROM auth.users WHERE email = 'singsingstour@naver.com';
    IF user3_id IS NULL THEN
        user3_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
          user3_id,
          'singsingstour@naver.com', 
          crypt('90001004', gen_salt('bf')), 
          NOW(), 
          'authenticated',
          '{"role": "staff", "name": "싱싱투어"}'::jsonb
        );
    END IF;

    -- 4. users 테이블에 추가
    -- mas9golf2@gmail.com
    INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
    VALUES (user1_id::text, 'mas9golf2@gmail.com', '사용자2', 'staff', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = 'mas9golf2@gmail.com',
        name = '사용자2',
        role = 'staff',
        is_active = true,
        updated_at = NOW();

    -- mas9golf3@gmail.com
    INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
    VALUES (user2_id::text, 'mas9golf3@gmail.com', '사용자3', 'staff', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = 'mas9golf3@gmail.com',
        name = '사용자3',
        role = 'staff',
        is_active = true,
        updated_at = NOW();

    -- singsingstour@naver.com
    INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
    VALUES (user3_id::text, 'singsingstour@naver.com', '싱싱투어', 'staff', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = 'singsingstour@naver.com',
        name = '싱싱투어',
        role = 'staff',
        is_active = true,
        updated_at = NOW();
        
    RAISE NOTICE '실제 사용자 생성 완료!';
    RAISE NOTICE 'mas9golf2@gmail.com / 90001004';
    RAISE NOTICE 'mas9golf3@gmail.com / 90001004';
    RAISE NOTICE 'singsingstour@naver.com / 90001004';
END $$;

-- 생성된 사용자 확인
SELECT 
    u.email,
    u.name,
    u.role,
    u.is_active,
    CASE 
        WHEN au.id IS NOT NULL THEN '✓ Auth 연결됨'
        ELSE '✗ Auth 없음'
    END as auth_status
FROM users u
LEFT JOIN auth.users au ON au.id::text = u.id
WHERE u.email IN ('mas9golf2@gmail.com', 'mas9golf3@gmail.com', 'singsingstour@naver.com')
ORDER BY u.email;

-- auth.users 테이블의 모든 사용자 확인 (디버깅용)
SELECT 
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'name' as name
FROM auth.users
ORDER BY created_at DESC;
