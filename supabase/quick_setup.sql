-- 빠른 테스트 사용자 생성 스크립트
-- Supabase SQL Editor에서 바로 실행 가능

-- 기존 테스트 사용자 삭제 (선택사항)
/*
DELETE FROM public.active_users WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');
DELETE FROM auth.users WHERE email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr');
*/

-- 테스트 사용자 생성
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    manager_id UUID := gen_random_uuid();
    staff_id UUID := gen_random_uuid();
BEGIN
    -- 관리자 생성
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role)
    VALUES (
        admin_id,
        'admin@singsinggolf.kr',
        crypt('admin123!', gen_salt('bf')),
        NOW(),
        '{"name": "관리자", "role": "admin"}'::jsonb,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    -- 매니저 생성
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role)
    VALUES (
        manager_id,
        'manager@singsinggolf.kr',
        crypt('manager123!', gen_salt('bf')),
        NOW(),
        '{"name": "매니저", "role": "manager"}'::jsonb,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    -- 스탭 생성
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role)
    VALUES (
        staff_id,
        'staff@singsinggolf.kr',
        crypt('staff123!', gen_salt('bf')),
        NOW(),
        '{"name": "스탭", "role": "staff"}'::jsonb,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    -- active_users 동기화 (트리거가 작동하지 않는 경우)
    INSERT INTO public.active_users (id, email, name, role, is_active, team, department, created_at, updated_at)
    VALUES
        (admin_id::text, 'admin@singsinggolf.kr', '관리자', 'admin', true, '경영팀', '관리부', NOW(), NOW()),
        (manager_id::text, 'manager@singsinggolf.kr', '매니저', 'manager', true, '운영팀', '투어사업부', NOW(), NOW()),
        (staff_id::text, 'staff@singsinggolf.kr', '스탭', 'staff', true, '운영팀', '투어사업부', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        is_active = true,
        updated_at = NOW();

    RAISE NOTICE '테스트 사용자 생성 완료!';
    RAISE NOTICE '관리자: admin@singsinggolf.kr / admin123!';
    RAISE NOTICE '매니저: manager@singsinggolf.kr / manager123!';
    RAISE NOTICE '스탭: staff@singsinggolf.kr / staff123!';
END $$;

-- 생성된 사용자 확인
SELECT 
    au.email,
    au.name,
    au.role,
    au.is_active,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = au.email) 
        THEN '✓ Auth 연결됨'
        ELSE '✗ Auth 없음'
    END as auth_status
FROM public.active_users au
WHERE au.email IN ('admin@singsinggolf.kr', 'manager@singsinggolf.kr', 'staff@singsinggolf.kr')
ORDER BY 
    CASE au.role 
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'staff' THEN 3
        ELSE 4
    END;
