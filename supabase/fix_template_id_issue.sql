-- UUID 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto 확장 모듈도 활성화 (gen_random_uuid 사용을 위해)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 템플릿 테이블 재생성 (더 안전한 방법)
ALTER TABLE singsing_memo_templates 
DROP COLUMN id CASCADE;

ALTER TABLE singsing_memo_templates 
ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- 만약 위 방법이 안 되면 다음 방법 사용
-- DROP TABLE IF EXISTS singsing_memo_templates CASCADE;
-- 
-- CREATE TABLE singsing_memo_templates (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   category VARCHAR(20) NOT NULL,
--   title VARCHAR(100) NOT NULL,
--   content_template TEXT NOT NULL,
--   usage_count INTEGER DEFAULT 0,
--   created_at TIMESTAMP DEFAULT NOW()
-- );
-- 
-- -- RLS 정책 재설정
-- ALTER TABLE singsing_memo_templates ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Enable all operations for templates" ON singsing_memo_templates
--   FOR ALL USING (true) WITH CHECK (true);
-- 
-- -- 권한 부여
-- GRANT ALL ON singsing_memo_templates TO authenticated;
-- GRANT ALL ON singsing_memo_templates TO anon;