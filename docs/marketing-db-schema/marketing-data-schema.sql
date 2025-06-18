-- ===================================================
-- 마케팅용 데이터 관리를 위한 DB 스키마 개선안
-- ===================================================

-- 옵션 1: 기존 테이블에 마케팅용 필드 추가
-- tour_products 테이블에 마케팅용 필드 추가
ALTER TABLE tour_products ADD COLUMN IF NOT EXISTS marketing_included_items jsonb;
ALTER TABLE tour_products ADD COLUMN IF NOT EXISTS marketing_excluded_items jsonb;
ALTER TABLE tour_products ADD COLUMN IF NOT EXISTS marketing_special_benefits jsonb;

-- singsing_tours 테이블에도 동일하게 추가 (투어별 커스터마이징 가능)
ALTER TABLE singsing_tours ADD COLUMN IF NOT EXISTS marketing_included_items jsonb;
ALTER TABLE singsing_tours ADD COLUMN IF NOT EXISTS marketing_excluded_items jsonb;
ALTER TABLE singsing_tours ADD COLUMN IF NOT EXISTS marketing_special_benefits jsonb;

-- jsonb 구조 예시:
-- {
--   "items": [
--     {
--       "icon": "🏨",
--       "title": "리조트 숙박",
--       "description": "리우컨 버스 (45인승 최고급 차량)",
--       "highlight": true
--     },
--     {
--       "icon": "🍽️",
--       "title": "식사",
--       "description": "그린피 및 카트비 (18홀 × 3일)",
--       "subItems": ["조식 2회", "중식 3회", "석식 2회"]
--     }
--   ]
-- }

-- 옵션 2: 별도의 마케팅 콘텐츠 테이블 생성 (추천)
CREATE TABLE IF NOT EXISTS marketing_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_product_id uuid REFERENCES tour_products(id),
  tour_id uuid REFERENCES singsing_tours(id),
  content_type varchar(50) NOT NULL, -- 'included', 'excluded', 'special_benefit'
  display_order integer DEFAULT 0,
  icon varchar(10),
  title text NOT NULL,
  description text,
  sub_items jsonb, -- ["서브아이템1", "서브아이템2"]
  highlight boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 인덱스 추가
CREATE INDEX idx_marketing_contents_tour_product ON marketing_contents(tour_product_id);
CREATE INDEX idx_marketing_contents_tour ON marketing_contents(tour_id);
CREATE INDEX idx_marketing_contents_type ON marketing_contents(content_type);

-- 템플릿 시스템 (자주 사용하는 항목 재사용)
CREATE TABLE IF NOT EXISTS marketing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  category varchar(50) NOT NULL, -- 'resort', 'golf', 'meal', 'transport' 등
  content_type varchar(50) NOT NULL,
  icon varchar(10),
  title text NOT NULL,
  description text,
  sub_items jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 샘플 데이터
INSERT INTO marketing_templates (name, category, content_type, icon, title, description) VALUES
('리조트 숙박 기본', 'resort', 'included', '🏨', '리조트 숙박', '최고급 리조트에서의 편안한 휴식'),
('45인승 버스', 'transport', 'included', '🚌', '전용 차량', '리우컨 버스 (45인승 최고급 차량)'),
('그린피 포함', 'golf', 'included', '⛳', '골프', '그린피 및 카트비 포함'),
('식사 제공', 'meal', 'included', '🍽️', '식사', '맛있는 식사 제공'),
('개인 경비', 'personal', 'excluded', '💰', '개인 경비', '개인적인 소비 및 경비'),
('여행자 보험', 'insurance', 'excluded', '🛡️', '여행자 보험', '개별 가입 필요');
