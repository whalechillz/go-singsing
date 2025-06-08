-- ================================================================
-- 투어 관리 시스템 재구조화 - 최종 마이그레이션
-- 실행일: 2025-06-08
-- 주의: 기존 마이그레이션 실행 이후 추가 작업만 포함
-- ================================================================

-- 1. tourist_attractions 테이블 확장 (기존 테이블에 추가)
-- ================================================================

-- 1-1. 새로운 컬럼 추가 (존재하지 않는 경우만)
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS golf_course_info JSONB,
ADD COLUMN IF NOT EXISTS meal_info JSONB,
ADD COLUMN IF NOT EXISTS parking_info TEXT,
ADD COLUMN IF NOT EXISTS entrance_fee TEXT,
ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT false;

-- 1-2. 카테고리 제약조건 업데이트 (기존 제약조건 삭제 후 재생성)
ALTER TABLE tourist_attractions DROP CONSTRAINT IF EXISTS tourist_attractions_category_check;

ALTER TABLE tourist_attractions 
ADD CONSTRAINT tourist_attractions_category_check 
CHECK (category IN (
  'tourist_spot',  -- 관광명소
  'rest_area',     -- 휴게소
  'restaurant',    -- 맛집
  'shopping',      -- 쇼핑
  'activity',      -- 액티비티
  'mart',          -- 마트 (신규)
  'golf_round',    -- 골프 라운드 (신규)
  'club_meal',     -- 클럽식 (신규)
  'others'         -- 기타 (신규)
));

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


-- 2. tour_journey_items 테이블 생성 확인 및 생성
-- ================================================================

-- 테이블이 없는 경우에만 생성
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tour_journey_items') THEN
    
    -- UUID 확장 활성화
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- 테이블 생성
    CREATE TABLE tour_journey_items (
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
    
    -- 코멘트 추가
    COMMENT ON TABLE tour_journey_items IS '투어별 여정 항목';
    COMMENT ON COLUMN tour_journey_items.boarding_place_id IS '탑승지 ID (탑승지인 경우)';
    COMMENT ON COLUMN tour_journey_items.spot_id IS '스팟 ID (관광지, 식당, 휴게소 등인 경우)';
    COMMENT ON COLUMN tour_journey_items.boarding_type IS '탑승 유형: 승차, 하차, 경유';
    COMMENT ON COLUMN tour_journey_items.meal_type IS '식사 유형: 조식, 중식, 석식, 간식';
    COMMENT ON COLUMN tour_journey_items.display_options IS '표시 옵션 JSON (이미지 표시 여부 등)';
    
    RAISE NOTICE 'tour_journey_items 테이블이 생성되었습니다.';
  ELSE
    RAISE NOTICE 'tour_journey_items 테이블이 이미 존재합니다.';
  END IF;
END $$;

-- 업데이트 시간 자동 갱신 트리거 (테이블이 생성된 경우에만)
CREATE OR REPLACE FUNCTION update_tour_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tour_journey_items_updated_at ON tour_journey_items;
CREATE TRIGGER update_tour_journey_items_updated_at 
BEFORE UPDATE ON tour_journey_items 
FOR EACH ROW 
EXECUTE FUNCTION update_tour_journey_updated_at();


-- 3. singsing_boarding_places 테이블 데이터 정리
-- ================================================================

-- 3-1. 탑승지가 아닌 데이터를 tourist_attractions로 이관
-- (중복 체크: 이름과 주소가 같은 경우 제외)
INSERT INTO tourist_attractions (name, category, address, description, parking_info, created_at, is_active)
SELECT DISTINCT
  bp.name,
  CASE 
    WHEN bp.place_type = 'rest_area' THEN 'rest_area'
    WHEN bp.place_type = 'mart' THEN 'mart'
    WHEN bp.place_type = 'tourist_spot' THEN 'tourist_spot'
    WHEN bp.place_type = 'restaurant' THEN 'restaurant'
    ELSE 'others'
  END as category,
  bp.address,
  bp.description,
  bp.parking_info,
  bp.created_at,
  true as is_active
FROM singsing_boarding_places bp
WHERE bp.place_type != 'boarding' 
  AND bp.place_type IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tourist_attractions ta 
    WHERE ta.name = bp.name AND ta.address = bp.address
  );

-- 3-2. 탑승지가 아닌 데이터 삭제
DELETE FROM singsing_boarding_places 
WHERE place_type != 'boarding' OR place_type IS NULL;

-- 3-3. place_type 기본값 설정 (NULL인 경우 'boarding'으로)
UPDATE singsing_boarding_places 
SET place_type = 'boarding' 
WHERE place_type IS NULL;

-- 3-4. place_type 제약조건 재설정
ALTER TABLE singsing_boarding_places DROP CONSTRAINT IF EXISTS singsing_boarding_places_place_type_check;
ALTER TABLE singsing_boarding_places 
ADD CONSTRAINT singsing_boarding_places_place_type_check 
CHECK (place_type = 'boarding');

-- 3-5. 코멘트 업데이트
COMMENT ON TABLE singsing_boarding_places IS '탑승지 마스터 데이터 (탑승지만 관리)';
COMMENT ON COLUMN singsing_boarding_places.place_type IS '장소 유형: boarding(탑승지)만 허용';


-- 4. RLS (Row Level Security) 정책 설정
-- ================================================================

-- tour_journey_items 테이블 RLS 활성화
ALTER TABLE tour_journey_items ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON tour_journey_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tour_journey_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON tour_journey_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tour_journey_items;

-- 새 정책 생성
CREATE POLICY "Enable read access for all users" ON tour_journey_items
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON tour_journey_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON tour_journey_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON tour_journey_items
  FOR DELETE USING (auth.role() = 'authenticated');


-- 5. 샘플 데이터 생성 (개발/테스트용)
-- ================================================================

-- 새로운 카테고리 스팟 샘플 데이터 (실제 운영시 제거)
/*
-- 마트 샘플
INSERT INTO tourist_attractions (name, category, sub_category, address, description, operating_hours, is_active)
VALUES 
  ('이마트 순천점', 'mart', '대형마트', '전남 순천시 조례동 123-45', '대형 할인마트', '09:00-22:00', true),
  ('CU 편의점', 'mart', '편의점', '전남 순천시 연향동 456-78', '24시간 편의점', '24시간', true);

-- 골프장 샘플
INSERT INTO tourist_attractions (name, category, sub_category, address, description, golf_course_info, booking_required, is_active)
VALUES 
  ('순천 컨트리클럽', 'golf_round', '18홀', '전남 순천시 해룡면 신대리', '18홀 정규 골프장', 
   '{"holes": "18", "green_fee": "200000", "cart_fee": "80000"}'::jsonb, true, true);

-- 클럽식 샘플
INSERT INTO tourist_attractions (name, category, sub_category, address, description, meal_info, is_active)
VALUES 
  ('클럽하우스 레스토랑', 'club_meal', '중식', '골프장 클럽하우스 2층', '한정식 뷔페', 
   '{"meal_type": "중식", "menu": "한정식 뷔페", "price": "35000"}'::jsonb, true);

-- 기타 샘플
INSERT INTO tourist_attractions (name, category, sub_category, description, is_active)
VALUES 
  ('호텔 휴식', 'others', '개별휴식', '호텔에서 개별 휴식 시간', true),
  ('자유시간', 'others', '자유시간', '개인 자유시간', true);
*/


-- 6. 마이그레이션 완료 상태 확인
-- ================================================================

DO $$
DECLARE
  v_journey_exists boolean;
  v_new_columns_count integer;
  v_new_categories_count integer;
BEGIN
  -- tour_journey_items 테이블 존재 확인
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tour_journey_items'
  ) INTO v_journey_exists;
  
  -- tourist_attractions 새 컬럼 확인
  SELECT COUNT(*) INTO v_new_columns_count
  FROM information_schema.columns
  WHERE table_name = 'tourist_attractions'
    AND column_name IN ('sub_category', 'golf_course_info', 'meal_info', 'parking_info', 'entrance_fee', 'booking_required');
  
  -- 새 카테고리 데이터 확인
  SELECT COUNT(DISTINCT category) INTO v_new_categories_count
  FROM tourist_attractions
  WHERE category IN ('mart', 'golf_round', 'club_meal', 'others');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '마이그레이션 완료 상태:';
  RAISE NOTICE '- tour_journey_items 테이블: %', CASE WHEN v_journey_exists THEN '생성됨' ELSE '생성 실패' END;
  RAISE NOTICE '- tourist_attractions 새 컬럼 수: %/6', v_new_columns_count;
  RAISE NOTICE '- 새로운 카테고리 종류: %', v_new_categories_count;
  RAISE NOTICE '========================================';
END $$;
