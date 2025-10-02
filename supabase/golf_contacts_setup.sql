-- ================================================================
-- 골프장 담당자 관리 및 손편지 발송 시스템 설정
-- ================================================================

-- 1. 골프장 담당자 관리 테이블 생성
CREATE TABLE IF NOT EXISTS golf_course_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  golf_course_name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  position VARCHAR(100), -- 직책 (예: 예약팀장, 영업팀장)
  phone VARCHAR(20),
  mobile VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  notes TEXT, -- 특이사항, 선호하는 연락 시간 등
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_golf_course_contacts_name ON golf_course_contacts(golf_course_name);
CREATE INDEX IF NOT EXISTS idx_golf_course_contacts_active ON golf_course_contacts(is_active);

-- 2. 골프장별 선물 발송 이력 관리 테이블 생성
CREATE TABLE IF NOT EXISTS gift_sending_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  golf_course_contact_id UUID REFERENCES golf_course_contacts(id) ON DELETE CASCADE,
  occasion VARCHAR(50) NOT NULL, -- '추석', '설날', '일반' 등
  gift_type VARCHAR(100) NOT NULL, -- '스타벅스 카드', '상품권' 등
  gift_amount INTEGER NOT NULL, -- 금액 (원)
  quantity INTEGER DEFAULT 1, -- 수량
  sent_date DATE NOT NULL,
  sent_by VARCHAR(100), -- 발송자
  notes TEXT, -- 특이사항
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_gift_sending_golf_course ON gift_sending_history(golf_course_contact_id);
CREATE INDEX IF NOT EXISTS idx_gift_sending_date ON gift_sending_history(sent_date);
CREATE INDEX IF NOT EXISTS idx_gift_sending_occasion ON gift_sending_history(occasion);

-- 3. 초기 데이터 삽입 (순천 파인힐스, 영덕 오션비치)
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('순천 파인힐스', '담당자1', '예약팀장', '061-000-0000', '010-0000-0000', 'contact1@pineshills.co.kr', '추석, 설날 선물 발송 대상'),
('영덕 오션비치', '담당자2', '영업팀장', '054-000-0000', '010-0000-0001', 'contact2@oceanbeach.co.kr', '추석, 설날 선물 발송 대상')
ON CONFLICT DO NOTHING;

-- 4. 손편지 템플릿 추가 (기존 singsing_memo_templates 테이블에)
INSERT INTO singsing_memo_templates (title, content, category, is_active) VALUES
('추석 인사 손편지', 
'안녕하세요. 싱싱골프투어입니다.

올해도 순천 파인힐스와 함께 즐거운 골프 투어를 진행할 수 있어 감사합니다.

추석 명절을 맞아 가정의 평안과 건강을 기원하며, 
앞으로도 더욱 좋은 서비스로 보답하겠습니다.

감사합니다.

싱싱골프투어 드림', 
'손편지', true),

('설날 인사 손편지', 
'새해 복 많이 받으세요. 싱싱골프투어입니다.

새해에도 영덕 오션비치와 함께 멋진 골프 여행을 만들어가겠습니다.

건강하고 행복한 한 해 되시길 바라며, 
언제나 최고의 서비스로 모시겠습니다.

감사합니다.

싱싱골프투어 드림', 
'손편지', true),

('일반 인사 손편지', 
'안녕하세요. 싱싱골프투어입니다.

항상 좋은 파트너십을 유지해주셔서 감사합니다.

앞으로도 더욱 발전하는 골프 투어 서비스로 
함께 성장해나가겠습니다.

감사합니다.

싱싱골프투어 드림', 
'손편지', true)
ON CONFLICT DO NOTHING;

-- 5. 코멘트 추가
COMMENT ON TABLE golf_course_contacts IS '골프장 담당자 연락처 관리';
COMMENT ON COLUMN golf_course_contacts.golf_course_name IS '골프장명';
COMMENT ON COLUMN golf_course_contacts.contact_name IS '담당자명';
COMMENT ON COLUMN golf_course_contacts.position IS '직책';
COMMENT ON COLUMN golf_course_contacts.notes IS '특이사항 및 선물 발송 이력';

COMMENT ON TABLE gift_sending_history IS '골프장 담당자 선물 발송 이력';
COMMENT ON COLUMN gift_sending_history.occasion IS '발송 사유 (추석, 설날, 일반 등)';
COMMENT ON COLUMN gift_sending_history.gift_type IS '선물 종류';
COMMENT ON COLUMN gift_sending_history.gift_amount IS '선물 금액';

-- 6. 확인 쿼리
SELECT '골프장 담당자 테이블 생성 완료' as status;
SELECT COUNT(*) as contact_count FROM golf_course_contacts;
SELECT COUNT(*) as template_count FROM singsing_memo_templates WHERE category = '손편지';
