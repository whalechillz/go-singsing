-- 손편지 발송을 위한 메시지 템플릿 추가
-- 기존 singsing_memo_templates 테이블에 손편지 템플릿 추가

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
'손편지', true);

-- 골프장별 선물 발송 이력 관리 테이블 생성
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
CREATE INDEX idx_gift_sending_golf_course ON gift_sending_history(golf_course_contact_id);
CREATE INDEX idx_gift_sending_date ON gift_sending_history(sent_date);
CREATE INDEX idx_gift_sending_occasion ON gift_sending_history(occasion);

-- 코멘트 추가
COMMENT ON TABLE gift_sending_history IS '골프장 담당자 선물 발송 이력';
COMMENT ON COLUMN gift_sending_history.occasion IS '발송 사유 (추석, 설날, 일반 등)';
COMMENT ON COLUMN gift_sending_history.gift_type IS '선물 종류';
COMMENT ON COLUMN gift_sending_history.gift_amount IS '선물 금액';
