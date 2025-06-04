-- 고객 마스터 데이터베이스 설계
-- 2025-06-04

-- 1. 고객 마스터 테이블 (통합 고객 정보)
CREATE TABLE customers (
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
  source VARCHAR(50), -- google_sheet, website, manual, etc
  source_id VARCHAR(100), -- 원본 데이터 ID
  notes TEXT,
  tags TEXT[], -- 태그 배열
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 고객 히스토리 (변경 이력)
CREATE TABLE customer_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  field_name VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- 3. 메시지 발송 이력
CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  message_type VARCHAR(20), -- kakao_alimtalk, kakao_friendtalk, sms, mms
  template_id VARCHAR(50),
  phone_number VARCHAR(20),
  
  -- 메시지 내용
  title VARCHAR(200),
  content TEXT,
  image_url TEXT,
  buttons JSONB,
  
  -- 발송 정보
  status VARCHAR(20), -- pending, sent, delivered, failed
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  
  -- 솔라피 정보
  solapi_message_id VARCHAR(100),
  solapi_group_id VARCHAR(100),
  solapi_result JSONB,
  
  -- 비용
  cost DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 메시지 템플릿
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20), -- kakao_alimtalk, kakao_friendtalk, sms, mms
  
  -- 카카오 알림톡 정보
  kakao_template_code VARCHAR(50),
  kakao_template_name VARCHAR(100),
  
  -- 템플릿 내용
  title VARCHAR(200),
  content TEXT,
  variables JSONB, -- {name: "고객명", tour_name: "투어명"}
  buttons JSONB,
  
  -- 사용 조건
  use_case VARCHAR(50), -- tour_confirm, payment_remind, marketing
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 마케팅 캠페인
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- 캠페인 설정
  target_query TEXT, -- SQL 쿼리로 대상자 선정
  target_count INT,
  template_id UUID REFERENCES message_templates(id),
  
  -- 일정
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- 결과
  total_sent INT DEFAULT 0,
  total_delivered INT DEFAULT 0,
  total_read INT DEFAULT 0,
  total_clicked INT DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, running, completed, cancelled
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. 웹사이트 회원 연동
CREATE TABLE customer_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  website VARCHAR(50), -- singsinggolf, singsingtour
  
  -- 인증 정보
  username VARCHAR(100),
  email VARCHAR(255),
  password_hash VARCHAR(255),
  
  -- 소셜 로그인
  provider VARCHAR(20), -- kakao, naver, google
  provider_id VARCHAR(100),
  
  -- 상태
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 고객 세그먼트 (그룹)
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- 세그먼트 조건
  conditions JSONB, -- {tour_count: {gte: 3}, last_tour: {within: "6months"}}
  query TEXT, -- SQL 쿼리
  
  -- 자동 업데이트
  is_dynamic BOOLEAN DEFAULT true,
  last_updated_at TIMESTAMP,
  member_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. 고객-세그먼트 연결
CREATE TABLE customer_segment_members (
  customer_id UUID REFERENCES customers(id),
  segment_id UUID REFERENCES customer_segments(id),
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (customer_id, segment_id)
);

-- 인덱스 생성
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_last_tour ON customers(last_tour_date);
CREATE INDEX idx_message_logs_customer ON message_logs(customer_id);
CREATE INDEX idx_message_logs_status ON message_logs(status);
CREATE INDEX idx_message_logs_sent_at ON message_logs(sent_at);

-- 뷰: 활성 고객
CREATE VIEW active_customers AS
SELECT 
  c.*,
  COUNT(DISTINCT p.tour_id) as actual_tour_count,
  MAX(t.start_date) as actual_last_tour_date
FROM customers c
LEFT JOIN singsing_participants p ON c.phone = p.phone
LEFT JOIN singsing_tours t ON p.tour_id = t.id
WHERE c.status = 'active'
GROUP BY c.id;

-- 뷰: VIP 고객 (3회 이상 참여)
CREATE VIEW vip_customers AS
SELECT * FROM active_customers
WHERE actual_tour_count >= 3
OR customer_type = 'vip';

-- 함수: 고객 통계 업데이트
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

-- 트리거: 참가자 변경시 고객 통계 자동 업데이트
CREATE TRIGGER update_customer_stats_trigger
AFTER INSERT OR UPDATE ON singsing_participants
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();