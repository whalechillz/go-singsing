-- 편지 발송 이력 관리 테이블 생성
CREATE TABLE IF NOT EXISTS letter_sending_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  golf_course_contact_id UUID REFERENCES golf_course_contacts(id) ON DELETE CASCADE,
  occasion VARCHAR(50) NOT NULL, -- '추석', '설날', '일반' 등
  letter_content TEXT NOT NULL, -- 편지 내용
  ai_improvement_request TEXT, -- AI 개선 요청사항
  ai_improved_content TEXT, -- AI로 개선된 내용
  sent_date DATE NOT NULL,
  sent_by VARCHAR(100), -- 발송자
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'printed'
  notes TEXT, -- 특이사항
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_letter_sending_golf_course ON letter_sending_history(golf_course_contact_id);
CREATE INDEX idx_letter_sending_date ON letter_sending_history(sent_date);
CREATE INDEX idx_letter_sending_occasion ON letter_sending_history(occasion);
CREATE INDEX idx_letter_sending_status ON letter_sending_history(status);

-- 코멘트 추가
COMMENT ON TABLE letter_sending_history IS '편지 발송 이력 관리';
COMMENT ON COLUMN letter_sending_history.occasion IS '발송 사유 (추석, 설날, 일반 등)';
COMMENT ON COLUMN letter_sending_history.letter_content IS '편지 원본 내용';
COMMENT ON COLUMN letter_sending_history.ai_improvement_request IS 'AI 개선 요청사항';
COMMENT ON COLUMN letter_sending_history.ai_improved_content IS 'AI로 개선된 최종 내용';
COMMENT ON COLUMN letter_sending_history.status IS '편지 상태 (draft: 임시저장, sent: 발송완료, printed: 인쇄완료)';

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_letter_sending_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_letter_sending_history_updated_at
  BEFORE UPDATE ON letter_sending_history
  FOR EACH ROW
  EXECUTE FUNCTION update_letter_sending_history_updated_at();
