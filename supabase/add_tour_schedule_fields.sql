-- 투어 테이블에 일정 관련 필드 추가
-- 이미 존재하는 필드는 자동으로 스킵됩니다

-- departure_location (출발 장소)
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS departure_location TEXT;

-- itinerary (일정 상세)
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS itinerary TEXT;

-- included_items (포함 사항)
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS included_items TEXT;

-- notes (기타 안내)
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 기본값 설정 (필요한 경우)
UPDATE singsing_tours 
SET departure_location = '서울 강남 신논현역 9번 출구'
WHERE departure_location IS NULL;

COMMENT ON COLUMN singsing_tours.departure_location IS '출발 장소';
COMMENT ON COLUMN singsing_tours.itinerary IS '일정 상세 정보';
COMMENT ON COLUMN singsing_tours.included_items IS '투어 포함 사항';
COMMENT ON COLUMN singsing_tours.notes IS '기타 안내 사항';
