-- 메모 테이블 생성
CREATE TABLE IF NOT EXISTS singsing_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES singsing_participants(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  category VARCHAR(20) DEFAULT 'general', -- urgent, payment, boarding, request, general
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, resolved, follow_up
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 2), -- 0:보통, 1:중요, 2:긴급
  created_by VARCHAR(255),
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 메모 템플릿 테이블
CREATE TABLE IF NOT EXISTS singsing_memo_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content_template TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX idx_memos_participant_id ON singsing_memos(participant_id);
CREATE INDEX idx_memos_tour_id ON singsing_memos(tour_id);
CREATE INDEX idx_memos_status ON singsing_memos(status);
CREATE INDEX idx_memos_priority ON singsing_memos(priority);
CREATE INDEX idx_memos_created_at ON singsing_memos(created_at DESC);

-- RLS (Row Level Security) 정책
ALTER TABLE singsing_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_memo_templates ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정
CREATE POLICY "Enable all operations for all users" ON singsing_memos
  FOR ALL USING (true);

CREATE POLICY "Enable read for all users" ON singsing_memo_templates
  FOR SELECT USING (true);

-- 기본 템플릿 데이터 삽입
INSERT INTO singsing_memo_templates (category, title, content_template) VALUES
  ('payment', '현금영수증 발급 요청', '현금영수증 발급 요청 (사업자: {번호})'),
  ('payment', '세금계산서 발급 요청', '세금계산서 발급 요청 (사업자: {번호}, 이메일: {이메일})'),
  ('boarding', '탑승지 변경', '탑승지 변경: {기존} → {변경}'),
  ('boarding', '탑승 인원 추가', '탑승 인원 추가: {장소}에서 {인원}명'),
  ('seat', '좌석 배정 요청', '좌석 배정 요청: {좌석 위치}'),
  ('seat', '멀미 관련', '멀미로 인해 {요청사항}'),
  ('request', '특별 요청사항', '{요청 내용}'),
  ('general', '연락처 변경', '연락처 변경: {이전} → {변경}');

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_singsing_memos_updated_at BEFORE UPDATE
  ON singsing_memos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
