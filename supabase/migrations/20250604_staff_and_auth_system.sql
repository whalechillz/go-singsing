-- 스태프 및 계정 관리 개선
-- 2025-06-04

-- 1. singsing_tours 테이블에 driver_phone 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(20);

-- 2. 권한 관리를 위한 roles 테이블 생성
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 기본 역할 추가
INSERT INTO roles (name, description, permissions) VALUES 
  ('admin', '관리자', '{"all": true}'),
  ('manager', '매니저', '{"tours": true, "participants": true, "documents": true}'),
  ('staff', '스태프', '{"tours": ["read"], "participants": ["read"]}'),
  ('driver', '기사', '{"tours": ["read"], "participants": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- 3. users 테이블 확장
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- 4. singsing_tour_staff와 users 연결
ALTER TABLE singsing_tour_staff 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- 5. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tour_staff_tour_id ON singsing_tour_staff(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_staff_user_id ON singsing_tour_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_staff_role ON singsing_tour_staff(role);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- 6. 기존 기사 정보 마이그레이션 (driver_name이 있는 경우)
UPDATE singsing_tours t
SET driver_phone = (
  SELECT s.phone 
  FROM singsing_tour_staff s 
  WHERE s.tour_id = t.id 
  AND s.role = '기사' 
  AND s.name = t.driver_name
  LIMIT 1
)
WHERE t.driver_name IS NOT NULL 
AND t.driver_phone IS NULL;

-- 7. 스태프 정보를 tours 테이블과 동기화하는 함수
CREATE OR REPLACE FUNCTION sync_tour_driver_info()
RETURNS TRIGGER AS $$
BEGIN
  -- 기사 역할인 경우만 처리
  IF NEW.role = '기사' THEN
    UPDATE singsing_tours
    SET 
      driver_name = NEW.name,
      driver_phone = NEW.phone
    WHERE id = NEW.tour_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS sync_tour_driver_trigger ON singsing_tour_staff;
CREATE TRIGGER sync_tour_driver_trigger
AFTER INSERT OR UPDATE ON singsing_tour_staff
FOR EACH ROW
EXECUTE FUNCTION sync_tour_driver_info();

-- 9. 권한 체크 함수
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
  -- 사용자의 권한 가져오기
  SELECT r.permissions INTO v_permissions
  FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.id = p_user_id AND u.is_active = true;
  
  -- 권한이 없으면 false
  IF v_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- 전체 권한이 있는지 확인
  IF v_permissions->>'all' = 'true' THEN
    RETURN true;
  END IF;
  
  -- 특정 리소스에 대한 권한 확인
  v_resource_permissions := v_permissions->p_resource;
  IF v_resource_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- 리소스에 대한 전체 권한이 있는지 확인
  IF v_resource_permissions = 'true' THEN
    RETURN true;
  END IF;
  
  -- 특정 액션에 대한 권한 확인
  IF v_resource_permissions ? p_action THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 10. 뷰 생성: 활성 스태프 목록
CREATE OR REPLACE VIEW active_tour_staff AS
SELECT 
  s.*,
  t.title as tour_title,
  t.start_date,
  t.end_date,
  u.email as user_email,
  u.is_active as user_active
FROM singsing_tour_staff s
LEFT JOIN singsing_tours t ON s.tour_id = t.id
LEFT JOIN users u ON s.user_id = u.id
WHERE t.end_date >= CURRENT_DATE
ORDER BY t.start_date, s.role, s.order;