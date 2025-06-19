-- document_links 테이블에 필요한 컬럼 추가
ALTER TABLE public_document_links 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS short_code VARCHAR(50);

-- 기존 데이터에 대한 기본값 설정
UPDATE public_document_links 
SET title = CASE 
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
END
WHERE title IS NULL;

-- short_code는 public_url과 동일하게 설정
UPDATE public_document_links 
SET short_code = public_url
WHERE short_code IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_document_links_short_code ON public_document_links(short_code);
