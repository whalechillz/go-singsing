-- 메시지 발송 이력 테이블 생성
CREATE TABLE IF NOT EXISTS message_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  batch_id VARCHAR(50) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(100),
  message_type VARCHAR(20) NOT NULL, -- 'sms', 'kakao'
  message_content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'pending'
  error_message TEXT,
  note TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_message_history_tour_id ON message_history(tour_id);
CREATE INDEX idx_message_history_batch_id ON message_history(batch_id);
CREATE INDEX idx_message_history_sent_at ON message_history(sent_at);
CREATE INDEX idx_message_history_status ON message_history(status);

-- 메시지 템플릿 테이블 생성
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'general', 'weather', 'checkin', 'important'
  content TEXT NOT NULL,
  variables TEXT[], -- 변수 목록
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기본 템플릿 데이터 삽입
INSERT INTO message_templates (name, category, type, content, variables) VALUES
('우천시 환불 규정', '날씨', 'weather', '☔ 우천시 환불 규정 안내
• 1홀까지: 전액-기본요금
• 2~9홀: 차등환불
• 10홀이상: 환불불가
• 캐디피: 1홀 3만/2~9홀 8만/10홀이상 15만', '{}'),

('룸키 수령 안내', '체크인', 'checkin', '🔑 룸키 수령 안내
• 2팀 이상: 각 팀 총무님 수령
• 1팀: 대표자님 수령
• 프론트에서 성함 말씀해주세요', '{}'),

('식음료 결제 안내', '일반', 'general', '📢 식음료 결제 안내
• 골프장 식당 이용시 당일 결제
• 객실 미니바 이용시 체크아웃시 결제
• 단체 식사는 투어비에 포함되어 있습니다', '{}'),

('출발 시간 변경', '중요', 'important', '🚌 출발 시간 변경 안내
• 출발 시간이 {이전시간}에서 {변경시간}으로 변경되었습니다
• 탑승 위치는 동일합니다
• 늦지 않도록 주의해주세요', '{이전시간,변경시간}'),

('골프장 드레스 코드', '일반', 'general', '🏌️ 골프장 드레스 코드
• 상의: 카라 있는 셔츠 필수
• 하의: 청바지 불가
• 모자 착용 권장', '{}'),

('집합 장소 안내', '일반', 'general', '📍 집합 장소 안내
• 1차: {1차장소} ({1차시간})
• 2차: {2차장소} ({2차시간})
• 버스 번호: {버스번호}', '{1차장소,1차시간,2차장소,2차시간,버스번호}');

-- 메시지 발송 예약 테이블 (향후 예약 발송 기능용)
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  message_type VARCHAR(20) NOT NULL,
  message_content TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'cancelled', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_scheduled_messages_tour_id ON scheduled_messages(tour_id);
CREATE INDEX idx_scheduled_messages_scheduled_at ON scheduled_messages(scheduled_at);
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status);
