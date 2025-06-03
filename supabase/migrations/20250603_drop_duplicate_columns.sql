-- ========================================
-- 투어 테이블 컬럼 삭제
-- 실행일: 2025-06-03
-- 목적: 여행상품에서 관리하는 중복 컬럼 제거
-- ========================================

-- 1. 삭제 전 백업 테이블 생성 (안전을 위해)
CREATE TABLE singsing_tours_backup_before_column_drop AS 
SELECT * FROM singsing_tours;

-- 2. 불필요한 컬럼 삭제
ALTER TABLE singsing_tours 
DROP COLUMN IF EXISTS accommodation,
DROP COLUMN IF EXISTS includes,
DROP COLUMN IF EXISTS excludes,
DROP COLUMN IF EXISTS reservation_notices;

-- 3. 삭제된 컬럼 확인
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'singsing_tours' 
ORDER BY ordinal_position;

-- 4. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 컬럼 삭제 완료';
  RAISE NOTICE '- accommodation (숙소) 삭제됨';
  RAISE NOTICE '- includes (포함사항) 삭제됨';
  RAISE NOTICE '- excludes (불포함사항) 삭제됨';
  RAISE NOTICE '- reservation_notices (예약 안내사항) 삭제됨';
  RAISE NOTICE '';
  RAISE NOTICE '백업 테이블: singsing_tours_backup_before_column_drop';
END $$;