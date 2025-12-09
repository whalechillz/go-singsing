-- 협업 업체 네이트온 필드 추가 및 데이터 정리
-- 2025-12-09

-- 1. 네이트온 필드 추가
ALTER TABLE partner_companies 
ADD COLUMN IF NOT EXISTS nateon_id VARCHAR(100);

-- 2. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_partner_companies_nateon_id ON partner_companies(nateon_id);

-- 3. 코멘트 추가
COMMENT ON COLUMN partner_companies.nateon_id IS '네이트온 ID';

-- 4. 이름에서 접미사 제거 (_버스기사, _국내부킹, _해외랜드, _해외단독)
UPDATE partner_companies
SET name = TRIM(REPLACE(REPLACE(REPLACE(REPLACE(name, '_버스기사', ''), '_국내부킹', ''), '_해외랜드', ''), '_해외단독', ''))
WHERE name LIKE '%_버스기사%' 
   OR name LIKE '%_국내부킹%' 
   OR name LIKE '%_해외랜드%' 
   OR name LIKE '%_해외단독%';

-- 5. 특정 골프장들을 "국내 버스패키지" 카테고리로 변경
UPDATE partner_companies
SET category = '국내 버스패키지'
WHERE name IN (
  '영덕 오션비치',
  '파인비치,솔라시도',
  '함평 엘리체',
  '순천 파인힐스',
  '고창 컨트리클럽'
)
OR name LIKE '영덕 오션비치%'
OR name LIKE '파인비치%'
OR name LIKE '함평 엘리체%'
OR name LIKE '순천 파인힐스%'
OR name LIKE '고창 컨트리클럽%';

