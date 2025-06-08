-- Phase 2: 여행상품 테이블 확장

-- 상품 카테고리 ENUM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
        CREATE TYPE product_category AS ENUM ('domestic', 'overseas', 'package', 'custom');
    END IF;
END$$;

-- tour_products 테이블 확장
ALTER TABLE tour_products 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category product_category DEFAULT 'domestic',
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration VARCHAR(50), -- '2박3일', '3박4일' 등
ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS image_urls TEXT[], -- 여러 이미지 URL 배열
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT, -- 대표 이미지
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS tags TEXT[], -- ['순천', '가성비', '초보자추천'] 등
ADD COLUMN IF NOT EXISTS included_items JSONB, -- {meal: true, cart: true, caddie: false, ...}
ADD COLUMN IF NOT EXISTS excluded_items JSONB,
ADD COLUMN IF NOT EXISTS itinerary JSONB, -- [{day: 1, activities: [...]}]
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS special_notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tour_products_category ON tour_products(category);
CREATE INDEX IF NOT EXISTS idx_tour_products_is_active ON tour_products(is_active);
CREATE INDEX IF NOT EXISTS idx_tour_products_tags ON tour_products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tour_products_price ON tour_products(price);

-- 상품 리뷰 테이블
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES tour_products(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES singsing_participants(id),
    tour_id UUID REFERENCES singsing_tours(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    pros TEXT,
    cons TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE, -- 실제 참가자 확인
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, participant_id, tour_id)
);

-- 리뷰 도움됨 표시
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- 상품 조회수 테이블
CREATE TABLE IF NOT EXISTS product_view_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES tour_products(id) ON DELETE CASCADE,
    viewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
    view_count INTEGER DEFAULT 1,
    unique_visitors INTEGER DEFAULT 1,
    UNIQUE(product_id, viewed_at)
);

-- 상품 즐겨찾기
CREATE TABLE IF NOT EXISTS product_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES tour_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- 상품 가격 이력
CREATE TABLE IF NOT EXISTS product_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES tour_products(id) ON DELETE CASCADE,
    previous_price INTEGER,
    new_price INTEGER NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    reason TEXT
);

-- 평점 업데이트 트리거
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tour_products
    SET 
        rating = (
            SELECT ROUND(AVG(rating), 1)
            FROM product_reviews
            WHERE product_id = NEW.product_id
        ),
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_rating_trigger ON product_reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- 예약 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_product_booking_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tour_products
    SET 
        total_bookings = (
            SELECT COUNT(DISTINCT t.id)
            FROM singsing_tours t
            WHERE t.product_id = NEW.product_id
        ),
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- tours 테이블에 product_id 추가 (상품과 연결)
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES tour_products(id);

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_product_views(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO product_view_stats (product_id, viewed_at, view_count, unique_visitors)
    VALUES (p_product_id, CURRENT_DATE, 1, 1)
    ON CONFLICT (product_id, viewed_at) DO UPDATE
    SET view_count = product_view_stats.view_count + 1;
END;
$$ LANGUAGE plpgsql;

-- 도움됨 투표 함수
CREATE OR REPLACE FUNCTION toggle_review_helpful(p_review_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM review_helpful_votes 
        WHERE review_id = p_review_id AND user_id = p_user_id
    ) INTO v_exists;
    
    IF v_exists THEN
        DELETE FROM review_helpful_votes 
        WHERE review_id = p_review_id AND user_id = p_user_id;
        
        UPDATE product_reviews 
        SET helpful_count = helpful_count - 1
        WHERE id = p_review_id;
        
        RETURN FALSE;
    ELSE
        INSERT INTO review_helpful_votes (review_id, user_id)
        VALUES (p_review_id, p_user_id);
        
        UPDATE product_reviews 
        SET helpful_count = helpful_count + 1
        WHERE id = p_review_id;
        
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_tour_products_updated_at ON tour_products;
CREATE TRIGGER update_tour_products_updated_at
BEFORE UPDATE ON tour_products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 상품 통계 뷰
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    p.rating,
    p.total_bookings,
    COUNT(DISTINCT pr.id) as review_count,
    COUNT(DISTINCT pf.id) as favorite_count,
    COALESCE(SUM(pvs.view_count), 0) as total_views
FROM tour_products p
LEFT JOIN product_reviews pr ON pr.product_id = p.id
LEFT JOIN product_favorites pf ON pf.product_id = p.id
LEFT JOIN product_view_stats pvs ON pvs.product_id = p.id
GROUP BY p.id, p.name, p.category, p.price, p.rating, p.total_bookings;

-- RLS 정책
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_favorites ENABLE ROW LEVEL SECURITY;

-- 리뷰는 인증된 사용자만 작성 가능
CREATE POLICY "Authenticated users can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 리뷰 작성자는 자신의 리뷰 수정/삭제 가능
CREATE POLICY "Users can manage own reviews" ON product_reviews
    FOR UPDATE USING (
        participant_id IN (
            SELECT id FROM singsing_participants WHERE user_id = auth.uid()
        )
    );

-- 모든 사용자는 리뷰 조회 가능
CREATE POLICY "Everyone can view reviews" ON product_reviews
    FOR SELECT USING (true);

-- 즐겨찾기는 로그인 사용자만
CREATE POLICY "Users can manage own favorites" ON product_favorites
    FOR ALL USING (user_id = auth.uid());

-- 코멘트 추가
COMMENT ON TABLE product_reviews IS '상품 리뷰 및 평점';
COMMENT ON TABLE product_favorites IS '사용자별 상품 즐겨찾기';
COMMENT ON COLUMN tour_products.included_items IS '포함 항목 JSON {meal: true, cart: true, caddie: false}';
COMMENT ON COLUMN tour_products.itinerary IS '일정표 JSON [{day: 1, activities: [...]}]';