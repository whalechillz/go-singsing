-- 회의록 게시판 RLS 정책 설정
-- 2025-11-24

-- meeting_minutes 테이블 RLS 정책
-- 인증된 사용자는 모든 회의록 조회 가능
CREATE POLICY "인증된 사용자는 모든 회의록 조회 가능"
  ON meeting_minutes FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 회의록 작성 가능
CREATE POLICY "인증된 사용자는 회의록 작성 가능"
  ON meeting_minutes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 인증된 사용자는 회의록 수정 가능
CREATE POLICY "인증된 사용자는 회의록 수정 가능"
  ON meeting_minutes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 인증된 사용자는 회의록 삭제 가능
CREATE POLICY "인증된 사용자는 회의록 삭제 가능"
  ON meeting_minutes FOR DELETE
  TO authenticated
  USING (true);

-- partner_companies 테이블 RLS 정책
-- 인증된 사용자는 모든 협업 업체 조회 가능
CREATE POLICY "인증된 사용자는 모든 협업 업체 조회 가능"
  ON partner_companies FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 협업 업체 작성 가능
CREATE POLICY "인증된 사용자는 협업 업체 작성 가능"
  ON partner_companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 인증된 사용자는 협업 업체 수정 가능
CREATE POLICY "인증된 사용자는 협업 업체 수정 가능"
  ON partner_companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 인증된 사용자는 협업 업체 삭제 가능
CREATE POLICY "인증된 사용자는 협업 업체 삭제 가능"
  ON partner_companies FOR DELETE
  TO authenticated
  USING (true);

-- meeting_minute_attachments 테이블 RLS 정책
-- 인증된 사용자는 모든 첨부파일 조회 가능
CREATE POLICY "인증된 사용자는 모든 첨부파일 조회 가능"
  ON meeting_minute_attachments FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 첨부파일 작성 가능
CREATE POLICY "인증된 사용자는 첨부파일 작성 가능"
  ON meeting_minute_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 인증된 사용자는 첨부파일 삭제 가능
CREATE POLICY "인증된 사용자는 첨부파일 삭제 가능"
  ON meeting_minute_attachments FOR DELETE
  TO authenticated
  USING (true);

