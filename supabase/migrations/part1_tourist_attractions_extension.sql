-- ================================================================
-- Part 1: tourist_attractions 테이블 확장
-- ================================================================

-- 1-1. 새로운 컬럼 추가 (존재하지 않는 경우만)
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS golf_course_info JSONB,
ADD COLUMN IF NOT EXISTS meal_info JSONB,
ADD COLUMN IF NOT EXISTS parking_info TEXT,
ADD COLUMN IF NOT EXISTS entrance_fee TEXT,
ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT false;

-- 1-2. 카테고리 제약조건 업데이트
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

-- 확인 쿼리
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'tourist_attractions'
  AND column_name IN ('sub_category', 'golf_course_info', 'meal_info', 'parking_info', 'entrance_fee', 'booking_required');
