-- auth.users에 사용자 추가 시 자동으로 identity 생성하는 트리거
-- 2025-06-15

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION create_identity_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- email provider로 identity 생성
    IF NEW.email IS NOT NULL THEN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            NEW.id,
            jsonb_build_object(
                'sub', NEW.id::text,
                'email', NEW.email,
                'email_verified', true,
                'provider', 'email'
            ),
            'email',
            NULL,
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created_identity ON auth.users;
CREATE TRIGGER on_auth_user_created_identity
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_identity_for_new_user();

-- 권한 부여
GRANT EXECUTE ON FUNCTION create_identity_for_new_user() TO service_role;
