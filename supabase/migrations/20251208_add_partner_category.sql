-- 협업 업체 카테고리 필드 추가 및 기존 데이터 분류
-- 2025-12-08

-- 1. 카테고리 필드 추가
ALTER TABLE partner_companies 
ADD COLUMN IF NOT EXISTS category VARCHAR(50); -- 해외업체, 해외랜드, 국내부킹, 버스기사, 프로, 기타

-- 2. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_partner_companies_category ON partner_companies(category);

-- 3. 기존 데이터 분류 (이름과 비고 필드 기반)
UPDATE partner_companies
SET category = CASE
  -- 버스기사: 이름에 "버스 기사" 또는 "기사" 포함
  WHEN name LIKE '%버스 기사%' OR name LIKE '%기사%' OR notes LIKE '%버스%' OR notes LIKE '%기사%' THEN '버스기사'
  
  -- 프로: 이름에 "프로" 포함
  WHEN name LIKE '%프로%' THEN '프로'
  
  -- 해외랜드: 이름에 "_해외랜드" 또는 "해외랜드" 포함
  WHEN name LIKE '%_해외랜드%' OR name LIKE '%해외랜드%' OR notes LIKE '%해외랜드%' THEN '해외랜드'
  
  -- 해외업체: 이름에 "_해외단독" 또는 "해외" 포함 (해외랜드 제외)
  WHEN name LIKE '%_해외단독%' OR (name LIKE '%해외%' AND name NOT LIKE '%해외랜드%') OR 
       (country IS NOT NULL AND country NOT LIKE '%국내%' AND country NOT LIKE '%한국%') THEN '해외업체'
  
  -- 국내부킹: 이름에 "_국내부킹" 또는 "국내부킹" 포함
  WHEN name LIKE '%_국내부킹%' OR name LIKE '%국내부킹%' OR notes LIKE '%국내부킹%' THEN '국내부킹'
  
  -- 기타: 위 조건에 해당하지 않는 경우
  ELSE '기타'
END
WHERE category IS NULL;

-- 4. 코멘트 추가
COMMENT ON COLUMN partner_companies.category IS '업체 분류: 해외업체, 해외랜드, 국내부킹, 버스기사, 프로, 기타';
