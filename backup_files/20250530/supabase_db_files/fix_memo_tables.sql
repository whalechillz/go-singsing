-- 메모 시스템 테이블 생성 스크립트
-- 2025-05-28

-- 1. 메모 테이블 생성
CREATE TABLE IF NOT EXISTS singsing_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES singsing_participants(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  category VARCHAR(20) DEFAULT 'general',
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 2),
  created_by VARCHAR(255),
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 메모 템플릿 테이블 생성
CREATE TABLE IF NOT EXISTS singsing_memo_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content_template TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_memos_participant_id ON singsing_memos(participant_id);
CREATE INDEX IF NOT EXISTS idx_memos_tour_id ON singsing_memos(tour_id);
CREATE INDEX IF NOT EXISTS idx_memos_status ON singsing_memos(status);
CREATE INDEX IF NOT EXISTS idx_memos_priority ON singsing_memos(priority);
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON singsing_memos(created_at DESC);

-- 4. RLS 정책 설정
ALTER TABLE singsing_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_memo_templates ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Enable all operations for all users" ON singsing_memos;
DROP POLICY IF EXISTS "Enable read for all users" ON singsing_memo_templates;

-- 새 정책 생성
CREATE POLICY "Enable all operations for all users" ON singsing_memos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON singsing_memo_templates
  FOR SELECT USING (true);

-- 5. 기본 템플릿 데이터 삽입 (중복 방지)
INSERT INTO singsing_memo_templates (category, title, content_template) 
SELECT * FROM (VALUES
  ('payment', '현금영수증 발급 요청', '현금영수증 발급 요청 (사업자: {번호})'),
  ('payment', '세금계산서 발급 요청', '세금계산서 발급 요청 (사업자: {번호}, 이메일: {이메일})'),
  ('boarding', '탑승지 변경', '탑승지 변경: {기존} → {변경}'),
  ('boarding', '탑승 인원 추가', '탑승 인원 추가: {장소}에서 {인원}명'),
  ('seat', '좌석 배정 요청', '좌석 배정 요청: {좌석 위치}'),
  ('seat', '멀미 관련', '멀미로 인해 {요청사항}'),
  ('request', '특별 요청사항', '{요청 내용}'),
  ('general', '연락처 변경', '연락처 변경: {이전} → {변경}')
) AS t(category, title, content_template)
WHERE NOT EXISTS (
  SELECT 1 FROM singsing_memo_templates 
  WHERE singsing_memo_templates.title = t.title
);

-- 6. 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 트리거 생성
DROP TRIGGER IF EXISTS update_singsing_memos_updated_at ON singsing_memos;
CREATE TRIGGER update_singsing_memos_updated_at 
  BEFORE UPDATE ON singsing_memos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 테이블 확인
SELECT 'singsing_memos' as table_name, COUNT(*) as row_count FROM singsing_memos
UNION ALL
SELECT 'singsing_memo_templates', COUNT(*) FROM singsing_memo_templates;
