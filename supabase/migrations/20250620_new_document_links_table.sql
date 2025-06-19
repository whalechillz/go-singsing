-- 새로운 document_links 테이블 생성 (이름 변경 방식)
CREATE TABLE IF NOT EXISTS document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  document_type VARCHAR(50),
  settings JSONB,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- public_document_links에서 데이터 복사
INSERT INTO document_links (
  id, tour_id, title, short_code, document_type, settings, 
  is_active, view_count, created_at
)
SELECT 
  id,
  tour_id,
  CASE 
    WHEN document_type = 'portal' THEN '통합 표지'
    WHEN document_type = 'customer_all' THEN '고객용 통합 문서'
    WHEN document_type = 'staff_all' THEN '스탭용 통합 문서'
    WHEN document_type = 'golf_timetable' THEN '골프장 티타임표'
    WHEN document_type = 'customer_schedule' THEN '고객용 일정표'
    WHEN document_type = 'staff_schedule' THEN '스탭용 일정표'
    WHEN document_type = 'customer_boarding' THEN '고객용 탑승안내'
    WHEN document_type = 'staff_boarding' THEN '스탭용 탑승안내'
    WHEN document_type = 'room_assignment' THEN '고객용 객실배정'
    WHEN document_type = 'room_assignment_staff' THEN '스탭용 객실배정'
    WHEN document_type = 'customer_timetable' THEN '고객용 티타임표'
    WHEN document_type = 'staff_timetable' THEN '스탭용 티타임표'
    WHEN document_type = 'simplified' THEN '간편일정'
    ELSE document_type
  END as title,
  public_url as short_code,
  document_type,
  settings,
  is_active,
  view_count,
  created_at
FROM public_document_links
WHERE NOT EXISTS (
  SELECT 1 FROM document_links dl WHERE dl.id = public_document_links.id
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_document_links_tour ON document_links(tour_id);
CREATE INDEX IF NOT EXISTS idx_document_links_short_code ON document_links(short_code);
CREATE INDEX IF NOT EXISTS idx_document_links_active ON document_links(is_active);
