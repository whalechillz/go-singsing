-- users 테이블에 email unique constraint 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name = 'users_email_key'
    ) THEN
        -- email에 unique constraint 추가
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

-- Supabase Auth 사용자 생성 시 users 테이블에 자동으로 추가하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- users 테이블에 새 사용자 추가
  INSERT INTO public.users (
    id, 
    email, 
    name,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    true,
    NOW(),
    NOW()
  );
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- 에러 발생 시 로그만 남기고 계속 진행
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (이미 존재하는 경우 먼저 삭제)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 테스트 사용자 추가
DO $$
DECLARE
    admin_id TEXT := gen_random_uuid()::text;
    manager_id TEXT := gen_random_uuid()::text;
    staff_id TEXT := gen_random_uuid()::text;
BEGIN
    -- Auth 사용자 생성
    -- 관리자
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
    VALUES (
      admin_id::uuid,
      'admin@singsinggolf.kr', 
      crypt('admin123!', gen_salt('bf')), 
      NOW(), 
      'authenticated',
      '{"role": "admin", "name": "관리자"}'::jsonb
    ) ON CONFLICT (email) DO NOTHING;

    -- 매니저
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
    VALUES (
      manager_id::uuid,
      'manager@singsinggolf.kr', 
      crypt('manager123!', gen_salt('bf')), 
      NOW(), 
      'authenticated',
      '{"role": "manager", "name": "매니저"}'::jsonb
    ) ON CONFLICT (email) DO NOTHING;

    -- 스탭
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
    VALUES (
      staff_id::uuid,
      'staff@singsinggolf.kr', 
      crypt('staff123!', gen_salt('bf')), 
      NOW(), 
      'authenticated',
      '{"role": "staff", "name": "스탭"}'::jsonb
    ) ON CONFLICT (email) DO NOTHING;

    -- users 테이블에 직접 추가 (id로 체크)
    -- 관리자
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = admin_id) THEN
        INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
        VALUES (admin_id, 'admin@singsinggolf.kr', '관리자', 'admin', true, NOW(), NOW());
    ELSE
        UPDATE users SET 
            email = 'admin@singsinggolf.kr',
            name = '관리자',
            role = 'admin',
            is_active = true,
            updated_at = NOW()
        WHERE id = admin_id;
    END IF;

    -- 매니저
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = manager_id) THEN
        INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
        VALUES (manager_id, 'manager@singsinggolf.kr', '매니저', 'manager', true, NOW(), NOW());
    ELSE
        UPDATE users SET 
            email = 'manager@singsinggolf.kr',
            name = '매니저',
            role = 'manager',
            is_active = true,
            updated_at = NOW()
        WHERE id = manager_id;
    END IF;

    -- 스탭
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = staff_id) THEN
        INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
        VALUES (staff_id, 'staff@singsinggolf.kr', '스탭', 'staff', true, NOW(), NOW());
    ELSE
        UPDATE users SET 
            email = 'staff@singsinggolf.kr',
            name = '스탭',
            role = 'staff',
            is_active = true,
            updated_at = NOW()
        WHERE id = staff_id;
    END IF;
        
    RAISE NOTICE '테스트 사용자 생성 완료!';
    RAISE NOTICE '관리자: admin@singsinggolf.kr / admin123!';
    RAISE NOTICE '매니저: manager@singsinggolf.kr / manager123!';
    RAISE NOTICE '스탭: staff@singsinggolf.kr / staff123!';
END $$;

-- 생성된 사용자 확인 
SELECT 
    email,
    name,
    role,
    is_active,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = active_users.email) 
        THEN '✓ Auth 연결됨'
        ELSE '✗ Auth 없음'
    END as auth_status
FROM active_users
WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr')
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'staff' THEN 3
        ELSE 4
    END;
