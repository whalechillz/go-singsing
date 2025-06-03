-- ========================================
-- 호환성 유지 마이그레이션
-- 실행일: 2025-06-03
-- 목적: 기존 시스템 중단 없이 데이터 구조 개선
-- ========================================

-- 필드명 통일을 위한 별칭 컬럼 추가
ALTER TABLE tour_products 
ADD COLUMN IF NOT EXISTS includes TEXT,
ADD COLUMN IF NOT EXISTS excludes TEXT;

-- 기존 데이터 동기화
UPDATE tour_products 
SET 
  includes = COALESCE(included_items::text, ''),
  excludes = COALESCE(excluded_items::text, '')
WHERE includes IS NULL OR excludes IS NULL;

-- 자동 동기화를 위한 트리거 함수
CREATE OR REPLACE FUNCTION sync_includes_excludes()
RETURNS TRIGGER AS $$
BEGIN
  -- included_items/excluded_items 변경시 includes/excludes 업데이트
  IF TG_TABLE_NAME = 'tour_products' THEN
    IF NEW.included_items IS NOT NULL THEN
      NEW.includes = NEW.included_items::text;
    END IF;
    IF NEW.excluded_items IS NOT NULL THEN
      NEW.excludes = NEW.excluded_items::text;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS sync_includes_excludes_trigger ON tour_products;
CREATE TRIGGER sync_includes_excludes_trigger
BEFORE INSERT OR UPDATE ON tour_products
FOR EACH ROW
EXECUTE FUNCTION sync_includes_excludes();

-- 확인
SELECT 
  COUNT(*) as total_products,
  COUNT(includes) as has_includes,
  COUNT(excludes) as has_excludes
FROM tour_products;