-- 문서 발송 이력 테이블
CREATE TABLE IF NOT EXISTS document_send_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  document_ids UUID[] NOT NULL, -- 발송한 문서 ID 배열
  participant_count INTEGER NOT NULL, -- 발송 대상 참가자 수
  send_method VARCHAR(20) NOT NULL, -- 'sms', 'kakao' 등
  message_template TEXT, -- 사용된 메시지 템플릿
  sent_by TEXT, -- 발송자 (나중에 user_id로 변경 가능)
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 메시지 발송 큐 테이블
CREATE TABLE IF NOT EXISTS message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(100),
  message_type VARCHAR(20) NOT NULL, -- 'SMS', 'LMS', 'ALIMTALK' 등
  message_content TEXT NOT NULL,
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE SET NULL,
  document_send_history_id UUID REFERENCES document_send_history(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가
CREATE INDEX idx_document_send_history_tour ON document_send_history(tour_id);
CREATE INDEX idx_message_queue_status ON message_queue(status);
CREATE INDEX idx_message_queue_tour ON message_queue(tour_id);
