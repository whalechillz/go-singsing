-- 문서별 하단 내용 관리 테이블
CREATE TABLE IF NOT EXISTS document_footers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- rounding_timetable, boarding_guide, room_assignment, tour_schedule
  section_title VARCHAR(100) NOT NULL, -- 라운딩 주의사항, 탑승 주의사항, 객실 이용 안내 등
  content TEXT,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tour_id, document_type, section_title)
);

-- 인덱스 생성
CREATE INDEX idx_document_footers_tour_id ON document_footers(tour_id);
CREATE INDEX idx_document_footers_document_type ON document_footers(document_type);

-- 권한 설정
GRANT ALL ON document_footers TO authenticated;
GRANT SELECT ON document_footers TO anon;

-- 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_footers_updated_at 
  BEFORE UPDATE ON document_footers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 기존 공지사항 데이터 마이그레이션 (선택사항)
-- 기존 공지사항이 있다면 아래 쿼리로 마이그레이션 가능
/*
INSERT INTO document_footers (tour_id, document_type, section_title, content, order_index)
SELECT 
  tour_id,
  CASE 
    WHEN order_index = 1 THEN 'rounding_timetable'
    WHEN order_index = 2 THEN 'boarding_guide'
    WHEN order_index IN (3, 4) THEN 'room_assignment'
    WHEN order_index = 5 THEN 'tour_schedule'
  END as document_type,
  CASE 
    WHEN order_index = 1 THEN '라운딩 주의사항'
    WHEN order_index = 2 THEN '탑승 주의사항'
    WHEN order_index = 3 THEN '객실 이용 안내'
    WHEN order_index = 4 THEN '식사 안내'
    WHEN order_index = 5 THEN '락카 이용 안내'
  END as section_title,
  content,
  CASE 
    WHEN order_index IN (3, 4) THEN order_index - 2
    ELSE 1
  END as order_index
FROM document_notices
WHERE document_type = 'integrated_schedule';
*/