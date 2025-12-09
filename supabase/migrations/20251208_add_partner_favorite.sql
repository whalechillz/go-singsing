-- 협업 업체 즐겨찾기(긴밀 협력) 필드 추가
-- 2025-12-08

-- 1. 즐겨찾기 필드 추가
ALTER TABLE partner_companies 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 2. 인덱스 추가 (필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_partner_companies_is_favorite ON partner_companies(is_favorite);

-- 3. 코멘트 추가
COMMENT ON COLUMN partner_companies.is_favorite IS '긴밀 협력 업체 여부 (즐겨찾기)';
