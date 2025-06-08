-- tourist_attractions 테이블 카테고리 확장
-- 기존: tourist_spot, rest_area, restaurant, shopping, activity
-- 추가: mart, golf_round, club_meal, others

-- 기존 카테고리 제약조건 삭제
ALTER TABLE tourist_attractions DROP CONSTRAINT IF EXISTS tourist_attractions_category_check;

-- 새로운 카테고리 제약조건 추가
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

-- 필요한 추가 컬럼들
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100),  -- 세부 카테고리
ADD COLUMN IF NOT EXISTS golf_course_info JSONB,     -- 골프장 관련 정보 (홀수, 그린피 등)
ADD COLUMN IF NOT EXISTS meal_info JSONB,            -- 식사 관련 정보 (메뉴, 가격 등)
ADD COLUMN IF NOT EXISTS parking_info TEXT,          -- 주차 정보
ADD COLUMN IF NOT EXISTS entrance_fee TEXT,          -- 입장료
ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT false;  -- 예약 필요 여부

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_sub_category ON tourist_attractions(sub_category);

-- 테이블 이름 변경 (관광지 -> 전체 스팟)
-- 실제로는 테이블명은 그대로 두고 UI에서만 "전체 스팟 관리"로 표시

-- 코멘트 업데이트
COMMENT ON TABLE tourist_attractions IS '전체 스팟 마스터 데이터 (관광지, 휴게소, 맛집, 쇼핑, 액티비티, 마트, 골프장, 클럽식 등)';
COMMENT ON COLUMN tourist_attractions.category IS '스팟 카테고리: tourist_spot(관광명소), rest_area(휴게소), restaurant(맛집), shopping(쇼핑), activity(액티비티), mart(마트), golf_round(골프 라운드), club_meal(클럽식), others(기타)';
COMMENT ON COLUMN tourist_attractions.sub_category IS '세부 카테고리 (예: 기타-개별휴식, 기타-자유시간 등)';
