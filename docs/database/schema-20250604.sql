-- 싱싱골프투어 데이터베이스 스키마
-- 최종 업데이트: 2025-06-04
-- 권한/유저 관리 시스템 추가

-- =====================================================
-- 권한/유저 관리 테이블
-- =====================================================

-- 권한 역할 테이블
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 시스템 사용자 테이블 (확장)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  team VARCHAR(50),
  role VARCHAR(50), -- 기존 호환성
  
  -- 인증 정보
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  role_id UUID REFERENCES roles(id),
  
  -- 추가 정보
  department VARCHAR(50),
  hire_date DATE,
  profile_image_url TEXT,
  emergency_phone VARCHAR(20),
  
  -- 로그인 정보
  last_login TIMESTAMP,
  login_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 고객 마스터 테이블
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  birth_date DATE,
  gender VARCHAR(10),
  
  -- 마케팅 동의
  marketing_agreed BOOLEAN DEFAULT false,
  marketing_agreed_at TIMESTAMP,
  kakao_friend BOOLEAN DEFAULT false,
  kakao_friend_at TIMESTAMP,
  
  -- 고객 상태
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked
  customer_type VARCHAR(20), -- vip, regular, new
  
  -- 통계 정보
  first_tour_date DATE,
  last_tour_date DATE,
  total_tour_count INT DEFAULT 0,
  total_payment_amount DECIMAL(12,2) DEFAULT 0,
  
  -- 메타 정보
  source VARCHAR(50), -- google_sheet, website, manual
  notes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 기존 테이블 (수정사항 포함)
-- =====================================================

-- singsing_tours 테이블 수정
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(20);

-- singsing_tour_staff 테이블 수정
ALTER TABLE singsing_tour_staff 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- =====================================================
-- 인덱스
-- =====================================================

-- users 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- customers 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);

-- tour_staff 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_tour_staff_tour_id ON singsing_tour_staff(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_staff_user_id ON singsing_tour_staff(user_id);

-- =====================================================
-- 함수
-- =====================================================

-- 권한 확인 함수
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_resource VARCHAR,
  p_action VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  -- 사용자의 권한 가져오기
  SELECT r.permissions INTO v_permissions
  FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.id = p_user_id AND u.is_active = true;
  
  -- 전체 권한 확인
  IF v_permissions->>'all' = 'true' THEN
    RETURN true;
  END IF;
  
  -- 리소스별 권한 확인
  IF v_permissions->p_resource = 'true' THEN
    RETURN true;
  END IF;
  
  -- 특정 액션 권한 확인
  IF v_permissions->p_resource ? p_action THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 고객 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 참가자가 추가/수정될 때 고객 통계 업데이트
  UPDATE customers c
  SET 
    total_tour_count = (
      SELECT COUNT(DISTINCT tour_id) 
      FROM singsing_participants 
      WHERE phone = NEW.phone
    ),
    last_tour_date = (
      SELECT MAX(t.start_date)
      FROM singsing_participants p
      JOIN singsing_tours t ON p.tour_id = t.id
      WHERE p.phone = NEW.phone
    ),
    updated_at = NOW()
  WHERE c.phone = NEW.phone;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 트리거
-- =====================================================

-- users 테이블 트리거
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- customers 테이블 트리거
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 참가자 변경시 고객 통계 자동 업데이트
CREATE TRIGGER update_customer_stats_trigger
AFTER INSERT OR UPDATE ON singsing_participants
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

-- =====================================================
-- 뷰
-- =====================================================

-- 활성 사용자 뷰
CREATE OR REPLACE VIEW active_users AS
SELECT 
  u.*,
  r.name as role_name,
  r.permissions
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.is_active = true;

-- 투어 스태프 상세 뷰
CREATE OR REPLACE VIEW tour_staff_details AS
SELECT 
  ts.*,
  t.title as tour_title,
  t.start_date,
  t.end_date,
  u.email as user_email,
  u.department
FROM singsing_tour_staff ts
LEFT JOIN singsing_tours t ON ts.tour_id = t.id
LEFT JOIN users u ON ts.user_id = u.id
ORDER BY t.start_date DESC, ts.display_order;

-- =====================================================
-- 기본 데이터
-- =====================================================

-- 기본 역할 추가
INSERT INTO roles (name, description, permissions) VALUES 
  ('admin', '관리자 - 모든 권한', '{"all": true}'),
  ('manager', '매니저 - 투어/참가자/문서 관리', '{"tours": true, "participants": true, "documents": true, "memos": true}'),
  ('staff', '스태프 - 읽기 권한', '{"tours": ["read"], "participants": ["read"], "documents": ["read"]}'),
  ('driver', '기사 - 투어 정보 조회', '{"tours": ["read"], "participants": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- 기본 관리자 계정 생성
INSERT INTO users (name, phone, email, role_id, department, is_active) 
VALUES (
  '관리자',
  '010-0000-0000',
  'admin@singsinggolf.kr',
  (SELECT id FROM roles WHERE name = 'admin'),
  '경영지원',
  true
) ON CONFLICT (phone) DO NOTHING;

-- =====================================================
-- RLS (Row Level Security) 설정
-- 개발 중이므로 비활성화 상태
-- =====================================================

-- 모든 테이블 RLS 비활성화 (개발용)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tours DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_tour_staff DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 참고: 프로덕션 배포 시 RLS 활성화 및 정책 설정 필요
-- =====================================================