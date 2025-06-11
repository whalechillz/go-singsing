-- singsing_tours 테이블에 누락된 컬럼 추가
-- Supabase SQL Editor에서 이 쿼리를 실행하세요

-- 1. company_mobile 컬럼 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS company_mobile VARCHAR(50) DEFAULT '010-3332-9020';

-- 2. company_phone 컬럼 확인 및 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS company_phone VARCHAR(50) DEFAULT '031-215-3990';

-- 3. 컬럼 추가 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'singsing_tours' 
AND column_name IN ('company_phone', 'company_mobile');

-- 4. 스키마 캐시 새로고침을 위한 더미 업데이트
UPDATE singsing_tours 
SET updated_at = NOW() 
WHERE id = (SELECT id FROM singsing_tours LIMIT 1);