-- tour_products 테이블에 기본 안내사항 필드 추가
ALTER TABLE tour_products 
ADD COLUMN IF NOT EXISTS golf_courses jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS included_items text DEFAULT '그린피(18홀×3일), 숙박 2박, 전일정 클럽식, 카트비, 리무진 버스(상해보장), 2일차 관광',
ADD COLUMN IF NOT EXISTS excluded_items text DEFAULT '캐디피',
ADD COLUMN IF NOT EXISTS accommodation_info text,
ADD COLUMN IF NOT EXISTS general_notices jsonb DEFAULT '[]'::jsonb;

-- singsing_tours 테이블에 투어별 안내사항 필드 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS reservation_notices jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS other_notices text,
ADD COLUMN IF NOT EXISTS document_settings jsonb DEFAULT '{
  "customer_schedule": true,
  "customer_boarding": true,
  "staff_boarding": true,
  "room_assignment": true,
  "tee_time": true,
  "simplified": true
}'::jsonb;

-- 예시 데이터 업데이트
UPDATE tour_products 
SET 
  golf_courses = '[
    {"name": "파인힐스", "description": "18홀 파72"},
    {"name": "레이크힐스", "description": "18홀 파72"}
  ]'::jsonb,
  general_notices = '[
    {"order": 1, "content": "티오프 시간: 사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다."},
    {"order": 2, "content": "객실 배정: 예약 접수 순서대로 진행되오니 참고 부탁드립니다."},
    {"order": 3, "content": "식사 서비스: 불참 시에도 별도 환불이 불가하오니 양해 바랍니다."},
    {"order": 4, "content": "리무진 좌석: 가는 날 좌석은 오는 날에도 동일하게 이용해 주세요."}
  ]'::jsonb
WHERE id IS NOT NULL;

-- 문서별 공지사항 통합 관리를 위한 테이블 생성
CREATE TABLE IF NOT EXISTS document_notices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id uuid REFERENCES singsing_tours(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'customer_schedule', 
    'customer_boarding', 
    'staff_boarding', 
    'room_assignment', 
    'tee_time', 
    'simplified'
  )),
  notices jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 문서 템플릿 설정 테이블
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name text NOT NULL,
  document_type text NOT NULL,
  content_blocks jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 기본 문서 공지사항 템플릿 삽입
INSERT INTO document_templates (template_name, document_type, content_blocks, is_default)
VALUES 
  ('고객용 일정표 기본', 'customer_schedule', '[
    {"type": "notice", "title": "여행 준비물", "content": "여권, 비자, 개인 상비약, 골프용품"}
  ]'::jsonb, true),
  ('고객용 탑승안내서 기본', 'customer_boarding', '[
    {"type": "notice", "title": "집합 안내", "content": "출발 30분 전까지 지정된 장소에 모여주세요"}
  ]'::jsonb, true),
  ('스탭용 탑승안내서 기본', 'staff_boarding', '[
    {"type": "notice", "title": "스탭 준비사항", "content": "참가자 명단, 일정표, 비상연락망 확인"}
  ]'::jsonb, true),
  ('객실 배정표 기본', 'room_assignment', '[
    {"type": "notice", "title": "객실 이용 안내", "content": "체크인 시간: 15:00, 체크아웃 시간: 12:00"}
  ]'::jsonb, true),
  ('티타임표 기본', 'tee_time', '[
    {"type": "notice", "title": "라운드 준비", "content": "티오프 30분 전 도착, 연습볼 제공"}
  ]'::jsonb, true),
  ('간편 일정표 기본', 'simplified', '[
    {"type": "notice", "title": "간편 안내", "content": "자세한 내용은 전체 일정표를 참고해주세요"}
  ]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_document_notices_tour_id ON document_notices(tour_id);
CREATE INDEX IF NOT EXISTS idx_document_notices_type ON document_notices(document_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(document_type);