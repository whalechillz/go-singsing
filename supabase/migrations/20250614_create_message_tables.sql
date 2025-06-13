-- 2025-06-14 메시지 관련 테이블 생성

-- 메시지 관련 테이블이 없으므로 생성
-- (이미 20250604_customer_database.sql에 정의되어 있지만 실행되지 않은 경우)
CREATE TABLE IF NOT EXISTS message_logs (
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
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
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

CREATE TABLE IF NOT EXISTS message_templates (
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

CREATE TABLE IF NOT EXISTS marketing_campaigns (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_message_logs_customer ON message_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_status ON message_logs(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_sent_at ON message_logs(sent_at);

-- 인덱스 추가 (singsing_tour_staff)
CREATE INDEX IF NOT EXISTS idx_tour_staff_tour_id ON singsing_tour_staff(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_staff_user_id ON singsing_tour_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_staff_role ON singsing_tour_staff(role);

-- 코멘트 추가
COMMENT ON TABLE singsing_tour_staff IS '투어별 운영진 관리 (기사, 가이드, 인솔자 등)';
COMMENT ON COLUMN singsing_tour_staff.display_order IS '표시 순서';
COMMENT ON TABLE message_logs IS '메시지 발송 이력';
COMMENT ON TABLE message_templates IS '메시지 템플릿 관리';
COMMENT ON TABLE marketing_campaigns IS '마케팅 캠페인 관리';
