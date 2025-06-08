-- 업무 메모 테이블 생성 (고객과 무관한 일반 메모)
CREATE TABLE IF NOT EXISTS singsing_work_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general', -- general, notice, meeting, todo
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 2),
  status VARCHAR(20) DEFAULT 'active', -- active, completed, archived
  created_by VARCHAR(255),
  assigned_to VARCHAR(255),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 업무 메모 댓글 테이블
CREATE TABLE IF NOT EXISTS singsing_work_memo_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memo_id UUID REFERENCES singsing_work_memos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_work_memos_category ON singsing_work_memos(category);
CREATE INDEX idx_work_memos_status ON singsing_work_memos(status);
CREATE INDEX idx_work_memos_created_at ON singsing_work_memos(created_at DESC);
CREATE INDEX idx_work_memo_comments_memo_id ON singsing_work_memo_comments(memo_id);

-- RLS 정책
ALTER TABLE singsing_work_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE singsing_work_memo_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users" ON singsing_work_memos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON singsing_work_memo_comments
  FOR ALL USING (true) WITH CHECK (true);
