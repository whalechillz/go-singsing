-- 마케팅 콘텐츠 관리 테이블 생성 쿼리
-- Supabase SQL Editor에서 직접 실행하세요

-- 1. 마케팅 콘텐츠 마스터 테이블
CREATE TABLE IF NOT EXISTS marketing_contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_product_id UUID REFERENCES tour_products(id),
    tour_id UUID REFERENCES singsing_tours(id),
    content_type VARCHAR(50) NOT NULL, -- 'tour_product' or 'tour_specific'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 포함사항 테이블
CREATE TABLE IF NOT EXISTS marketing_included_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    marketing_content_id UUID REFERENCES marketing_contents(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- '포함사항', '특별혜택', '불포함사항'
    icon VARCHAR(50), -- 아이콘 타입 (예: 'accommodation', 'meal', 'transport')
    title VARCHAR(200) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_highlight BOOLEAN DEFAULT false, -- 특별히 강조할 항목
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 마케팅 하이라이트 (특별혜택 전용)
CREATE TABLE IF NOT EXISTS marketing_special_benefits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    marketing_content_id UUID REFERENCES marketing_contents(id) ON DELETE CASCADE,
    benefit_type VARCHAR(50), -- 'discount', 'gift', 'upgrade', 'exclusive'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    value VARCHAR(100), -- 할인율, 금액 등
    badge_text VARCHAR(50), -- '한정특가', '조기예약' 등
    badge_color VARCHAR(20), -- 'red', 'blue', 'purple' 등
    valid_until DATE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 마케팅 아이콘 설정 테이블
CREATE TABLE IF NOT EXISTS marketing_icons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    icon_key VARCHAR(50) UNIQUE NOT NULL,
    icon_name VARCHAR(100) NOT NULL,
    icon_class VARCHAR(100), -- Font Awesome 등의 클래스
    svg_path TEXT, -- 커스텀 SVG 경로
    category VARCHAR(50), -- 'accommodation', 'transport', 'meal', 'activity'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_marketing_contents_tour_product ON marketing_contents(tour_product_id);
CREATE INDEX IF NOT EXISTS idx_marketing_contents_tour ON marketing_contents(tour_id);
CREATE INDEX IF NOT EXISTS idx_marketing_items_category ON marketing_included_items(category);
CREATE INDEX IF NOT EXISTS idx_marketing_items_order ON marketing_included_items(display_order);

-- 기본 아이콘 데이터 삽입
INSERT INTO marketing_icons (icon_key, icon_name, category) VALUES
('accommodation', '숙박', 'accommodation'),
('meal', '식사', 'meal'),
('transport', '교통', 'transport'),
('golf_cart', '카트', 'activity'),
('caddie', '캐디', 'activity'),
('locker', '락커', 'activity'),
('green_fee', '그린피', 'activity'),
('insurance', '보험', 'etc'),
('gift', '선물', 'etc'),
('discount', '할인', 'etc')
ON CONFLICT (icon_key) DO NOTHING;

-- RLS (Row Level Security) 정책 추가
ALTER TABLE marketing_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_included_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_special_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_icons ENABLE ROW LEVEL SECURITY;

-- 관리자만 수정 가능, 모든 사용자 읽기 가능
CREATE POLICY "Marketing contents are viewable by everyone" ON marketing_contents
    FOR SELECT USING (true);

CREATE POLICY "Marketing contents are editable by authenticated users" ON marketing_contents
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Marketing items are viewable by everyone" ON marketing_included_items
    FOR SELECT USING (true);

CREATE POLICY "Marketing items are editable by authenticated users" ON marketing_included_items
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Marketing benefits are viewable by everyone" ON marketing_special_benefits
    FOR SELECT USING (true);

CREATE POLICY "Marketing benefits are editable by authenticated users" ON marketing_special_benefits
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Marketing icons are viewable by everyone" ON marketing_icons
    FOR SELECT USING (true);

CREATE POLICY "Marketing icons are editable by authenticated users" ON marketing_icons
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 샘플 데이터 (선택사항)
-- 아래는 예시 데이터입니다. 필요시 주석을 해제하고 사용하세요.

/*
-- 투어 상품에 대한 기본 마케팅 콘텐츠 생성
INSERT INTO marketing_contents (tour_product_id, content_type, is_active)
SELECT id, 'tour_product', true 
FROM tour_products 
WHERE name LIKE '%오션비치%' 
LIMIT 1;

-- 포함사항 샘플 데이터
WITH mc AS (
    SELECT id FROM marketing_contents WHERE content_type = 'tour_product' LIMIT 1
)
INSERT INTO marketing_included_items (marketing_content_id, category, icon, title, description, display_order)
SELECT 
    mc.id,
    '포함사항',
    icon,
    title,
    description,
    display_order
FROM mc, (VALUES
    ('transport', '리무진 버스 (45인승 최고급 차량)', '그린피 및 카트비 (18홀 × 3일)', 0),
    ('accommodation', '호텔 2박 (2인 1실 기준)', '조식 2회 (호텔 조식)', 1),
    ('caddie', '전문 경기 도우미 (경험 많은 전문 가)', '인', 2),
    ('gift', '기념품 (골프공 등)', NULL, 3)
) AS items(icon, title, description, display_order);

-- 특별혜택 샘플 데이터
WITH mc AS (
    SELECT id FROM marketing_contents WHERE content_type = 'tour_product' LIMIT 1
)
INSERT INTO marketing_special_benefits (marketing_content_id, benefit_type, title, description, value, badge_text, badge_color, display_order)
SELECT 
    mc.id,
    'discount',
    '조기예약 특별 할인',
    '출발 30일 전 예약시 적용',
    '10만원',
    '한정특가',
    'red',
    0
FROM mc;

-- 불포함사항 샘플 데이터
WITH mc AS (
    SELECT id FROM marketing_contents WHERE content_type = 'tour_product' LIMIT 1
)
INSERT INTO marketing_included_items (marketing_content_id, category, title, description, display_order)
SELECT 
    mc.id,
    '불포함사항',
    title,
    description,
    display_order
FROM mc, (VALUES
    ('개인 경비 및 매너팁', NULL, 0),
    ('여행자 보험', '개별 가입 권장', 1),
    ('식사 시 음료 및 주류', NULL, 2)
) AS items(title, description, display_order);
*/

-- 실행 완료 메시지
SELECT '✅ 마케팅 콘텐츠 테이블 생성 완료!' as message;
