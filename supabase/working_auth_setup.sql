-- users 테이블 id가 UUID 타입인 경우
-- 테스트 사용자 생성 스크립트

DO $$
DECLARE
    auth_admin_id UUID;
    auth_manager_id UUID;
    auth_staff_id UUID;
BEGIN
    -- 1. Auth 사용자 생성 및 ID 저장
    -- 관리자
    SELECT id INTO auth_admin_id FROM auth.users WHERE email = 'admin@singsinggolf.kr';
    IF auth_admin_id IS NULL THEN
        auth_admin_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
          auth_admin_id,
          'admin@singsinggolf.kr', 
          crypt('admin123!', gen_salt('bf')), 
          NOW(), 
          'authenticated',
          '{"role": "admin", "name": "관리자"}'::jsonb
        );
    END IF;

    -- 매니저
    SELECT id INTO auth_manager_id FROM auth.users WHERE email = 'manager@singsinggolf.kr';
    IF auth_manager_id IS NULL THEN
        auth_manager_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
          auth_manager_id,
          'manager@singsinggolf.kr', 
          crypt('manager123!', gen_salt('bf')), 
          NOW(), 
          'authenticated',
          '{"role": "manager", "name": "매니저"}'::jsonb
        );
    END IF;

    -- 스탭
    SELECT id INTO auth_staff_id FROM auth.users WHERE email = 'staff@singsinggolf.kr';
    IF auth_staff_id IS NULL THEN
        auth_staff_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
        VALUES (
          auth_staff_id,
          'staff@singsinggolf.kr', 
          crypt('staff123!', gen_salt('bf')), 
          NOW(), 
          'authenticated',
          '{"role": "staff", "name": "스탭"}'::jsonb
        );
    END IF;

    -- 2. users 테이블의 중복 이메일 삭제
    DELETE FROM users WHERE email = 'admin@singsinggolf.kr' AND id != auth_admin_id;
    DELETE FROM users WHERE email = 'manager@singsinggolf.kr' AND id != auth_manager_id;
    DELETE FROM users WHERE email = 'staff@singsinggolf.kr' AND id != auth_staff_id;

    -- 3. users 테이블에 추가 (UUID 타입 그대로 사용)
    -- 관리자
    INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
    VALUES (auth_admin_id, 'admin@singsinggolf.kr', '관리자', 'admin', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = 'admin@singsinggolf.kr',
        name = '관리자',
        role = 'admin',
        is_active = true,
        updated_at = NOW();

    -- 매니저
    INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
    VALUES (auth_manager_id, 'manager@singsinggolf.kr', '매니저', 'manager', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = 'manager@singsinggolf.kr',
        name = '매니저',
        role = 'manager',
        is_active = true,
        updated_at = NOW();

    -- 스탭
    INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
    VALUES (auth_staff_id, 'staff@singsinggolf.kr', '스탭', 'staff', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = 'staff@singsinggolf.kr',
        name = '스탭',
        role = 'staff',
        is_active = true,
        updated_at = NOW();
        
    RAISE NOTICE '테스트 사용자 생성 완료!';
    RAISE NOTICE '관리자: admin@singsinggolf.kr / admin123!';
    RAISE NOTICE '매니저: manager@singsinggolf.kr / manager123!';
    RAISE NOTICE '스탭: staff@singsinggolf.kr / staff123!';
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
LEFT JOIN auth.users au ON au.id = u.id
WHERE u.email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr')
ORDER BY 
    CASE u.role 
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'staff' THEN 3
        ELSE 4
    END;
