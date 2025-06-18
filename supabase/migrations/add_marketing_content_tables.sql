-- 마케팅 콘텐츠 관리를 위한 새로운 테이블들

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
CREATE INDEX idx_marketing_contents_tour_product ON marketing_contents(tour_product_id);
CREATE INDEX idx_marketing_contents_tour ON marketing_contents(tour_id);
CREATE INDEX idx_marketing_items_category ON marketing_included_items(category);
CREATE INDEX idx_marketing_items_order ON marketing_included_items(display_order);

-- 기본 아이콘 데이터 삽입
INSERT INTO marketing_icons (icon_key, icon_name, category) VALUES
('accommodation', '숙박', 'accommodation'),
('meal', '식사', 'meal'),
('transport', '교통', 'transport'),
('golf_cart', '카트', 'activity'),
('caddie', '캐디', 'activity'),
('locker', '락커', 'activity'),
('green_fee', '그린피', 'activity'),
('insurance', '보험', 'etc');
