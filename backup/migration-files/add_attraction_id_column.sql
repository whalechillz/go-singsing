-- singsing_boarding_places 테이블에 attraction_id 컬럼 추가
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES tourist_attractions(id);

-- 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_boarding_places_attraction_id 
ON singsing_boarding_places(attraction_id);