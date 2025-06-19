-- message_logs 테이블에 문서 발송 관련 필드 추가
ALTER TABLE message_logs
ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES singsing_tours(id),
ADD COLUMN IF NOT EXISTS document_link_id UUID REFERENCES document_links(id),
ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(100);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_message_logs_tour_id ON message_logs(tour_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_document_link_id ON message_logs(document_link_id);

-- 문서 발송용 템플릿 ID 규칙
-- template_id 필드에 'document_link_[type]' 형식으로 저장
-- 예: 'document_link_customer', 'document_link_staff', 'document_link_golf'

COMMENT ON COLUMN message_logs.tour_id IS '투어 ID (문서 발송 시 사용)';
COMMENT ON COLUMN message_logs.document_link_id IS '발송한 문서 링크 ID';
COMMENT ON COLUMN message_logs.recipient_name IS '수신자 이름 (참가자명)';
