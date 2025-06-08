-- ================================================================
-- 투어 관리 시스템 완전 재구조화 마이그레이션
-- 실행일: 2025-06-08
-- ================================================================

-- 1. tourist_attractions 테이블 확장
-- ================================================================

-- 1-1. 카테고리 제약조건 업데이트
ALTER TABLE tourist_attractions DROP CONSTRAINT IF EXISTS tourist_attractions_category_check;

ALTER TABLE tourist_attractions 
ADD CONSTRAINT tourist_attractions_category_check 
CHECK (category IN (
  'tourist_spot',  -- 관광명소
  'rest_area',     -- 휴게소
  'restaurant',    -- 맛집
  'shopping',      -- 쇼핑
  'activity',      -- 액티비티
  'mart',          -- 마트
  'golf_round',    -- 골프 라운드
  'club_meal',     -- 클럽식
  'others'         -- 기타(개별휴식 등)
));

-- 1-2. 새로운 컬럼 추가
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS golf_course_info JSONB,
ADD COLUMN IF NOT EXISTS meal_info JSONB,
ADD COLUMN IF NOT EXISTS parking_info TEXT,
ADD COLUMN IF NOT EXISTS entrance_fee TEXT,
ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT false;

-- 1-3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_sub_category ON tourist_attractions(sub_category);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_booking ON tourist_attractions(booking_required);

-- 1-4. 코멘트 업데이트
COMMENT ON TABLE tourist_attractions IS '전체 스팟 마스터 데이터 (관광지, 휴게소, 맛집, 쇼핑, 액티비티, 마트, 골프장, 클럽식 등)';
COMMENT ON COLUMN tourist_attractions.category IS '스팟 카테고리: tourist_spot(관광명소), rest_area(휴게소), restaurant(맛집), shopping(쇼핑), activity(액티비티), mart(마트), golf_round(골프 라운드), club_meal(클럽식), others(기타)';
COMMENT ON COLUMN tourist_attractions.sub_category IS '세부 카테고리 (예: 기타-개별휴식, 기타-자유시간 등)';
COMMENT ON COLUMN tourist_attractions.golf_course_info IS '골프장 관련 정보 JSON (홀수, 그린피 등)';
COMMENT ON COLUMN tourist_attractions.meal_info IS '식사 관련 정보 JSON (메뉴, 가격 등)';
COMMENT ON COLUMN tourist_attractions.parking_info IS '주차 정보';
COMMENT ON COLUMN tourist_attractions.entrance_fee IS '입장료';
COMMENT ON COLUMN tourist_attractions.booking_required IS '예약 필요 여부';


-- 2. tour_journey_items 테이블 생성 (새로운 핵심 테이블)
-- ================================================================

-- UUID 확장 활성화 (이미 있을 수 있으므로 IF NOT EXISTS 사용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 테이블 생성
CREATE TABLE IF NOT EXISTS tour_journey_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  
  -- 장소 정보 (둘 중 하나만 사용)
  boarding_place_id UUID REFERENCES singsing_boarding_places(id),
  spot_id UUID REFERENCES tourist_attractions(id),
  
  -- 시간 정보
  arrival_time TIME,
  departure_time TIME,
  stay_duration VARCHAR(50),
  
  -- 거리/소요시간 정보
  distance_from_prev VARCHAR(50),
  duration_from_prev VARCHAR(50),
  
  -- 탑승 정보 (탑승지인 경우만)
  passenger_count INTEGER,
  boarding_type VARCHAR(50), -- '승차', '하차', '경유'
  
  -- 식사 정보 (식당/클럽식인 경우)
  meal_type VARCHAR(50), -- '조식', '중식', '석식', '간식'
  meal_menu TEXT,
  
  -- 골프 정보 (골프장인 경우)
  golf_info JSONB,
  
  -- 기타 정보
  notes TEXT,
  display_options JSONB, -- 이미지 표시 여부 등 표시 옵션
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 복합 유니크 제약조건
  UNIQUE(tour_id, day_number, order_index)
);

-- 인덱스 생성
CREATE INDEX idx_tour_journey_tour_id ON tour_journey_items(tour_id);
CREATE INDEX idx_tour_journey_day ON tour_journey_items(tour_id, day_number);
CREATE INDEX idx_tour_journey_order ON tour_journey_items(tour_id, day_number, order_index);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_tour_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tour_journey_items_updated_at 
BEFORE UPDATE ON tour_journey_items 
FOR EACH ROW 
EXECUTE FUNCTION update_tour_journey_updated_at();

-- 코멘트 추가
COMMENT ON TABLE tour_journey_items IS '투어별 여정 항목';
COMMENT ON COLUMN tour_journey_items.boarding_place_id IS '탑승지 ID (탑승지인 경우)';
COMMENT ON COLUMN tour_journey_items.spot_id IS '스팟 ID (관광지, 식당, 휴게소 등인 경우)';
COMMENT ON COLUMN tour_journey_items.boarding_type IS '탑승 유형: 승차, 하차, 경유';
COMMENT ON COLUMN tour_journey_items.meal_type IS '식사 유형: 조식, 중식, 석식, 간식';
COMMENT ON COLUMN tour_journey_items.display_options IS '표시 옵션 JSON (이미지 표시 여부 등)';


-- 3. singsing_boarding_places 테이블 정리
-- ================================================================

-- 3-1. 탑승지가 아닌 데이터를 tourist_attractions로 이관 (중복 방지)
INSERT INTO tourist_attractions (name, category, address, description, parking_info, created_at)
SELECT 
  name,
  CASE 
    WHEN place_type = 'rest_area' THEN 'rest_area'
    WHEN place_type = 'mart' THEN 'mart'
    WHEN place_type = 'tourist_spot' THEN 'tourist_spot'
    WHEN place_type = 'restaurant' THEN 'restaurant'
  END as category,
  address,
  description,
  parking_info,
  created_at
FROM singsing_boarding_places
WHERE place_type != 'boarding' AND place_type IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3-2. 탑승지가 아닌 데이터 삭제
DELETE FROM singsing_boarding_places WHERE place_type != 'boarding' OR place_type IS NULL;

-- 3-3. place_type 제약조건 변경
ALTER TABLE singsing_boarding_places DROP CONSTRAINT IF EXISTS singsing_boarding_places_place_type_check;
ALTER TABLE singsing_boarding_places 
ADD CONSTRAINT singsing_boarding_places_place_type_check 
CHECK (place_type = 'boarding' OR place_type IS NULL);

-- 3-4. 코멘트 업데이트
COMMENT ON TABLE singsing_boarding_places IS '탑승지 마스터 데이터';
COMMENT ON COLUMN singsing_boarding_places.place_type IS '장소 유형: boarding(탑승지)만 허용';


-- 4. RLS (Row Level Security) 정책 설정
-- ================================================================

-- tour_journey_items 테이블 RLS 활성화
ALTER TABLE tour_journey_items ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Enable read access for all users" ON tour_journey_items
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON tour_journey_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON tour_journey_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON tour_journey_items
  FOR DELETE USING (auth.role() = 'authenticated');


-- 5. 기존 데이터 마이그레이션 (선택사항)
-- ================================================================

-- 기존 tour_attraction_options 데이터를 활용한 초기 데이터 생성 예시
-- (필요한 경우 주석 해제하여 사용)
/*
INSERT INTO tour_journey_items (
  tour_id, 
  day_number, 
  order_index, 
  spot_id,
  arrival_time,
  notes
)
SELECT DISTINCT
  tao.tour_id,
  1 as day_number,  -- 기본값으로 1일차
  ROW_NUMBER() OVER (PARTITION BY tao.tour_id ORDER BY tao.order_no) as order_index,
  tao.attraction_id,
  NULL as arrival_time,
  '기존 데이터에서 마이그레이션됨' as notes
FROM tour_attraction_options tao
WHERE tao.is_default = true
ON CONFLICT DO NOTHING;
*/


-- 6. 마이그레이션 완료 확인
-- ================================================================

-- 실행 결과 확인용 쿼리
DO $$
BEGIN
  RAISE NOTICE '마이그레이션 완료!';
  RAISE NOTICE '- tourist_attractions: 카테고리 확장 및 새 컬럼 추가';
  RAISE NOTICE '- tour_journey_items: 새 테이블 생성';
  RAISE NOTICE '- singsing_boarding_places: 탑승지만 관리하도록 정리';
END $$;
