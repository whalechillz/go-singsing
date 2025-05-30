-- Phase 2: 사용자 권한 시스템

-- 권한 타입 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM ('super_admin', 'office_admin', 'staff', 'customer');
    END IF;
END$$;

-- 사용자 권한 테이블
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    permissions JSONB DEFAULT '{}',
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    UNIQUE(user_id, role)
);

-- 인덱스
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- 권한 템플릿 테이블
CREATE TABLE IF NOT EXISTS permission_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role_type NOT NULL UNIQUE,
    permissions JSONB NOT NULL,
    description TEXT
);

-- 기본 권한 템플릿 삽입
INSERT INTO permission_templates (role, permissions, description) VALUES
('super_admin', '{
    "tours": ["create", "read", "update", "delete"],
    "participants": ["create", "read", "update", "delete"],
    "payments": ["create", "read", "update", "delete"],
    "documents": ["create", "read", "update", "delete"],
    "users": ["create", "read", "update", "delete"],
    "settings": ["read", "update"],
    "reports": ["create", "read"],
    "system": ["all"]
}', '시스템 전체 관리 권한'),

('office_admin', '{
    "tours": ["create", "read", "update"],
    "participants": ["create", "read", "update"],
    "payments": ["create", "read", "update"],
    "documents": ["create", "read", "update"],
    "users": ["read"],
    "settings": ["read"],
    "reports": ["create", "read"]
}', '사무실 관리자 권한'),

('staff', '{
    "tours": ["read", "update"],
    "participants": ["read", "update"],
    "payments": ["read"],
    "documents": ["read", "update"],
    "users": [],
    "settings": [],
    "reports": ["read"]
}', '현장 스탭 권한'),

('customer', '{
    "tours": ["read"],
    "participants": ["read"],
    "payments": ["read"],
    "documents": ["read"],
    "users": [],
    "settings": [],
    "reports": []
}', '고객 권한')
ON CONFLICT (role) DO UPDATE SET 
    permissions = EXCLUDED.permissions,
    description = EXCLUDED.description;

-- 사용자 프로필 확장
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    nationality VARCHAR(100) DEFAULT 'KR',
    passport_number VARCHAR(50),
    address TEXT,
    company_name VARCHAR(255),
    department VARCHAR(100),
    position VARCHAR(100),
    golf_handicap INTEGER,
    dietary_restrictions TEXT,
    medical_conditions TEXT,
    preferred_room_type room_type,
    preferred_seat VARCHAR(20), -- 'window', 'aisle', 'front', 'back'
    marketing_consent BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 권한 확인 함수
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_resource VARCHAR,
    p_action VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
    v_resource_permissions JSONB;
BEGIN
    -- 활성 권한 조회
    SELECT permissions INTO v_permissions
    FROM user_roles
    WHERE user_id = p_user_id
    AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW())
    ORDER BY 
        CASE role 
            WHEN 'super_admin' THEN 1
            WHEN 'office_admin' THEN 2
            WHEN 'staff' THEN 3
            WHEN 'customer' THEN 4
        END
    LIMIT 1;
    
    -- 권한이 없으면 false
    IF v_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 시스템 전체 권한 확인
    IF v_permissions->'system' ? 'all' THEN
        RETURN TRUE;
    END IF;
    
    -- 리소스별 권한 확인
    v_resource_permissions := v_permissions->p_resource;
    IF v_resource_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 액션 권한 확인
    RETURN v_resource_permissions ? p_action;
END;
$$ LANGUAGE plpgsql;

-- 사용자 역할 부여 함수
CREATE OR REPLACE FUNCTION assign_user_role(
    p_user_id UUID,
    p_role user_role_type,
    p_assigned_by UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_permissions JSONB;
BEGIN
    -- 권한 템플릿에서 권한 가져오기
    SELECT permissions INTO v_permissions
    FROM permission_templates
    WHERE role = p_role;
    
    -- 기존 역할 비활성화
    UPDATE user_roles
    SET is_active = FALSE
    WHERE user_id = p_user_id
    AND role = p_role;
    
    -- 새 역할 부여
    INSERT INTO user_roles (user_id, role, permissions, assigned_by)
    VALUES (p_user_id, p_role, v_permissions, COALESCE(p_assigned_by, auth.uid()))
    ON CONFLICT (user_id, role) DO UPDATE
    SET 
        permissions = v_permissions,
        is_active = TRUE,
        assigned_by = COALESCE(p_assigned_by, auth.uid()),
        assigned_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 참가자와 사용자 연결
ALTER TABLE singsing_participants 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS invite_accepted_at TIMESTAMP;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON singsing_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_invite_token ON singsing_participants(invite_token);

-- 초대 토큰 생성 함수
CREATE OR REPLACE FUNCTION generate_invite_token(p_participant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_token VARCHAR;
BEGIN
    v_token := encode(gen_random_bytes(32), 'hex');
    
    UPDATE singsing_participants
    SET 
        invite_token = v_token,
        invite_sent_at = NOW()
    WHERE id = p_participant_id;
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거들
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 슈퍼 관리자만 권한 관리 가능
CREATE POLICY "Only super admins can manage roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'super_admin'
            AND ur.is_active = TRUE
        )
    );

-- 사용자는 자신의 권한 조회 가능
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

-- 프로필 정책
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'office_admin')
            AND is_active = TRUE
        )
    );

-- 코멘트 추가
COMMENT ON TABLE user_roles IS '사용자 권한 관리';
COMMENT ON TABLE user_profiles IS '사용자 상세 프로필 정보';
COMMENT ON COLUMN singsing_participants.invite_token IS '참가자 회원가입 초대 토큰';