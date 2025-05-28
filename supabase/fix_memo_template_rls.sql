-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Enable read for all users" ON singsing_memo_templates;

-- 모든 사용자가 템플릿을 읽고 쓸 수 있도록 정책 설정
CREATE POLICY "Enable all operations for templates" ON singsing_memo_templates
  FOR ALL USING (true) WITH CHECK (true);

-- 템플릿 테이블 권한 확인 및 설정
GRANT ALL ON singsing_memo_templates TO authenticated;
GRANT ALL ON singsing_memo_templates TO anon;
