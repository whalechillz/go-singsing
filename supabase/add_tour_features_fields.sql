-- 투어 또는 투어 상품에 포함/불포함 사항 및 특별 혜택 필드 추가

-- singsing_tours 테이블에 필드 추가 (투어별로 다르게 설정하려면)
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS includes JSONB DEFAULT '["리무진 버스", "그린피 및 카트비", "호텔 숙박", "조식", "전문 기사가이드"]',
ADD COLUMN IF NOT EXISTS special_benefits JSONB DEFAULT '["지역 맛집 투어", "그룹 사진 촬영", "물 및 간식 제공"]',
ADD COLUMN IF NOT EXISTS excludes JSONB DEFAULT '["캐디피", "중식 및 석식", "개인 경비"]';

-- 또는 tour_products 테이블에 필드 추가 (상품별로 기본값을 설정하려면)
ALTER TABLE tour_products
ADD COLUMN IF NOT EXISTS default_includes JSONB DEFAULT '["리무진 버스", "그린피 및 카트비", "호텔 숙박", "조식", "전문 기사가이드"]',
ADD COLUMN IF NOT EXISTS default_special_benefits JSONB DEFAULT '["지역 맛집 투어", "그룹 사진 촬영", "물 및 간식 제공"]',
ADD COLUMN IF NOT EXISTS default_excludes JSONB DEFAULT '["캐디피", "중식 및 석식", "개인 경비"]';

-- 필드 설명
COMMENT ON COLUMN singsing_tours.includes IS '투어 포함사항 목록';
COMMENT ON COLUMN singsing_tours.special_benefits IS '투어 특별 혜택 목록';
COMMENT ON COLUMN singsing_tours.excludes IS '투어 불포함사항 목록';

COMMENT ON COLUMN tour_products.default_includes IS '상품 기본 포함사항 목록';
COMMENT ON COLUMN tour_products.default_special_benefits IS '상품 기본 특별 혜택 목록';
COMMENT ON COLUMN tour_products.default_excludes IS '상품 기본 불포함사항 목록';
