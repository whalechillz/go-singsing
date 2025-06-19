-- Create tour_promotion_pages table
CREATE TABLE IF NOT EXISTS tour_promotion_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  valid_until TIMESTAMP,
  main_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tour_promotion_pages_tour_id ON tour_promotion_pages(tour_id);
CREATE INDEX idx_tour_promotion_pages_slug ON tour_promotion_pages(slug);
CREATE INDEX idx_tour_promotion_pages_is_public ON tour_promotion_pages(is_public);

-- Add comment
COMMENT ON TABLE tour_promotion_pages IS '투어 홍보 페이지 정보';
COMMENT ON COLUMN tour_promotion_pages.slug IS 'URL 슬러그 (예: jeju-spring-2025)';
COMMENT ON COLUMN tour_promotion_pages.is_public IS '공개 여부';
COMMENT ON COLUMN tour_promotion_pages.valid_until IS '유효기간';
COMMENT ON COLUMN tour_promotion_pages.main_image_url IS '대표 이미지 URL';

-- Create updated_at trigger
CREATE TRIGGER update_tour_promotion_pages_updated_at BEFORE UPDATE
  ON tour_promotion_pages FOR EACH ROW EXECUTE PROCEDURE
  update_updated_at_column();

-- Create tour_attraction_options table
CREATE TABLE IF NOT EXISTS tour_attraction_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES singsing_schedules(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES tourist_attractions(id) ON DELETE CASCADE,
  additional_price INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  order_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tour_attraction_options_tour_id ON tour_attraction_options(tour_id);
CREATE INDEX idx_tour_attraction_options_schedule_id ON tour_attraction_options(schedule_id);
CREATE INDEX idx_tour_attraction_options_attraction_id ON tour_attraction_options(attraction_id);

-- Add comment
COMMENT ON TABLE tour_attraction_options IS '투어별 관광지 옵션';
COMMENT ON COLUMN tour_attraction_options.additional_price IS '추가 요금 (원)';
COMMENT ON COLUMN tour_attraction_options.is_default IS '기본 선택 여부';
COMMENT ON COLUMN tour_attraction_options.order_no IS '표시 순서';

-- Create updated_at trigger
CREATE TRIGGER update_tour_attraction_options_updated_at BEFORE UPDATE
  ON tour_attraction_options FOR EACH ROW EXECUTE PROCEDURE
  update_updated_at_column();

-- Create tourist_attractions table if not exists
CREATE TABLE IF NOT EXISTS tourist_attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  main_image_url TEXT,
  category VARCHAR(100),
  region VARCHAR(100),
  recommended_duration INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tourist_attractions_category ON tourist_attractions(category);
CREATE INDEX idx_tourist_attractions_region ON tourist_attractions(region);
CREATE INDEX idx_tourist_attractions_is_active ON tourist_attractions(is_active);

-- Add comment
COMMENT ON TABLE tourist_attractions IS '관광지 정보';
COMMENT ON COLUMN tourist_attractions.recommended_duration IS '권장 소요시간 (분)';

-- Create updated_at trigger
CREATE TRIGGER update_tourist_attractions_updated_at BEFORE UPDATE
  ON tourist_attractions FOR EACH ROW EXECUTE PROCEDURE
  update_updated_at_column();

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 투어에 대해 기본 홍보 페이지 생성
INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
SELECT 
  id,
  LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9가-힣\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || id,
  true
FROM singsing_tours
WHERE NOT EXISTS (
  SELECT 1 FROM tour_promotion_pages WHERE tour_id = singsing_tours.id
);
