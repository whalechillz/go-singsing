-- RLS 없이 간단한 인증 설정
-- active_users 테이블은 이미 존재하므로 auth.users와 연동만 설정

-- Supabase Auth 사용자 생성 시 active_users에 자동으로 추가하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- active_users 테이블에 새 사용자 추가
  INSERT INTO public.active_users (
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
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (이미 존재하는 경우 먼저 삭제)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 테스트 사용자 추가 (auth.users에 추가)
DO $$
DECLARE
    admin_id UUID;
    manager_id UUID;
    staff_id UUID;
BEGIN
    -- ID 생성
    admin_id := gen_random_uuid();
    manager_id := gen_random_uuid();
    staff_id := gen_random_uuid();
    
    -- 관리자
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
    VALUES (
      admin_id,
      'admin@singsinggolf.kr', 
      crypt('admin123!', gen_salt('bf')), 
      NOW(), 
      'authenticated',
      '{"role": "admin", "name": "관리자"}'::jsonb
    ) ON CONFLICT (email) DO NOTHING;

    -- 매니저
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
    VALUES (
      manager_id,
      'manager@singsinggolf.kr', 
      crypt('manager123!', gen_salt('bf')), 
      NOW(), 
      'authenticated',
      '{"role": "manager", "name": "매니저"}'::jsonb
    ) ON CONFLICT (email) DO NOTHING;

    -- 스탭
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data)
    VALUES (
      staff_id,
      'staff@singsinggolf.kr', 
      crypt('staff123!', gen_salt('bf')), 
      NOW(), 
      'authenticated',
      '{"role": "staff", "name": "스탭"}'::jsonb
    ) ON CONFLICT (email) DO NOTHING;

    -- active_users에 직접 추가 (트리거가 작동하지 않는 경우를 대비)
    INSERT INTO public.active_users (id, email, name, role, is_active, created_at, updated_at)
    VALUES
        (admin_id::text, 'admin@singsinggolf.kr', '관리자', 'admin', true, NOW(), NOW()),
        (manager_id::text, 'manager@singsinggolf.kr', '매니저', 'manager', true, NOW(), NOW()),
        (staff_id::text, 'staff@singsinggolf.kr', '스탭', 'staff', true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
        id = EXCLUDED.id,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        is_active = true,
        updated_at = NOW();
        
    RAISE NOTICE '테스트 사용자 생성 완료!';
END $$;

-- 생성된 사용자 확인
SELECT 
    au.id,
    au.email,
    au.name,
    au.role,
    au.is_active,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE id::text = au.id OR email = au.email) 
        THEN '✓ Auth 연결됨'
        ELSE '✗ Auth 없음'
    END as auth_status
FROM public.active_users au
WHERE au.email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');
