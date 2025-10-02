-- 골프장 담당자 관리 테이블 생성
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
CREATE INDEX idx_golf_course_contacts_name ON golf_course_contacts(golf_course_name);
CREATE INDEX idx_golf_course_contacts_active ON golf_course_contacts(is_active);

-- 초기 데이터 삽입 (순천 파인힐스, 영덕 오션비치)
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('순천 파인힐스', '담당자1', '예약팀장', '061-000-0000', '010-0000-0000', 'contact1@pineshills.co.kr', '추석, 설날 선물 발송 대상'),
('영덕 오션비치', '담당자2', '영업팀장', '054-000-0000', '010-0000-0001', 'contact2@oceanbeach.co.kr', '추석, 설날 선물 발송 대상');

-- 코멘트 추가
COMMENT ON TABLE golf_course_contacts IS '골프장 담당자 연락처 관리';
COMMENT ON COLUMN golf_course_contacts.golf_course_name IS '골프장명';
COMMENT ON COLUMN golf_course_contacts.contact_name IS '담당자명';
COMMENT ON COLUMN golf_course_contacts.position IS '직책';
COMMENT ON COLUMN golf_course_contacts.notes IS '특이사항 및 선물 발송 이력';
