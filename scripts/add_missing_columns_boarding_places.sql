-- singsing_boarding_places 테이블에 누락된 컬럼들 추가

-- 1. place_type 컬럼 추가
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS place_type VARCHAR(50) DEFAULT 'boarding' 
CHECK (place_type IN ('boarding', 'rest_area', 'mart', 'tourist_spot', 'restaurant'));

-- 2. image_url 컬럼 추가
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. attraction_id 컬럼 추가 (tourist_attractions 테이블 참조)
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES tourist_attractions(id);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_boarding_places_place_type ON singsing_boarding_places(place_type);
CREATE INDEX IF NOT EXISTS idx_boarding_places_attraction_id ON singsing_boarding_places(attraction_id);