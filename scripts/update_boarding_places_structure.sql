-- singsing_boarding_places 테이블 구조 개선 SQL

-- 1. 기존에 없는 컬럼들만 추가 (이미 있으면 무시됨)
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS place_type VARCHAR(50) DEFAULT 'boarding' 
CHECK (place_type IN ('boarding', 'rest_area', 'mart', 'tourist_spot', 'restaurant'));

ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES tourist_attractions(id);

-- 2. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_boarding_places_place_type ON singsing_boarding_places(place_type);
CREATE INDEX IF NOT EXISTS idx_boarding_places_attraction_id ON singsing_boarding_places(attraction_id);

-- 3. 향후 고려사항: 장소 유형별 추가 정보를 위한 테이블 (선택사항)
-- 현재는 기존 구조를 유지하되, UI에서 조건부로 필드를 표시/숨김 처리

-- 예시: 맛집/휴게소 전용 정보 테이블 (필요시 추가)
/*
CREATE TABLE IF NOT EXISTS place_additional_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id UUID REFERENCES singsing_boarding_places(id) ON DELETE CASCADE,
    business_hours TEXT,
    phone_number VARCHAR(50),
    menu_info TEXT,
    facilities TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
*/

-- 4. 기존 데이터가 있다면 place_type 업데이트 (선택사항)
-- 모든 기존 데이터는 기본값인 'boarding'으로 설정됨