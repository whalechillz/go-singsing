-- 옵션 1: 기존 active_users 데이터를 Supabase Auth로 마이그레이션
-- 이 스크립트는 기존 active_users의 사용자를 auth.users에 추가합니다

-- 기존 active_users에서 auth.users로 사용자 복사 (비밀번호는 재설정 필요)
DO $$
DECLARE
    user_record RECORD;
    new_auth_id UUID;
BEGIN
    FOR user_record IN 
        SELECT * FROM public.active_users 
        WHERE email IS NOT NULL 
        AND email != ''
        AND NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = active_users.email
        )
    LOOP
        -- 새 UUID 생성
        new_auth_id := gen_random_uuid();
        
        -- auth.users에 사용자 추가
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            is_super_admin,
            role
        )
        VALUES (
            new_auth_id,
            '00000000-0000-0000-0000-000000000000',
            user_record.email,
            crypt('TempPassword123!', gen_salt('bf')), -- 임시 비밀번호
            NOW(),
            NOW(),
            NOW(),
            jsonb_build_object(
                'name', user_record.name,
                'role', user_record.role,
                'original_id', user_record.id
            ),
            false,
            'authenticated'
        );
        
        -- active_users의 ID를 auth.users의 ID로 업데이트
        UPDATE public.active_users 
        SET id = new_auth_id::text 
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Migrated user: %', user_record.email;
    END LOOP;
END $$;

-- 옵션 2: Supabase 대시보드에서 직접 사용자 추가 후 active_users 동기화
-- Authentication > Users 메뉴에서 사용자 추가 후 이 쿼리 실행

-- auth.users에 있지만 active_users에 없는 사용자 동기화
INSERT INTO public.active_users (id, email, name, role, is_active, created_at, updated_at)
SELECT 
    au.id::text,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'staff'),
    true,
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.active_users 
    WHERE id = au.id::text OR email = au.email
);

-- active_users 테이블의 ID 타입 확인 및 조정
-- UUID 타입으로 변경이 필요한 경우
-- ALTER TABLE public.active_users ALTER COLUMN id TYPE uuid USING id::uuid;
