-- singsing_tours 테이블 누락 컬럼 전체 추가
-- Supabase SQL Editor에서 실행하세요

-- 1. company_phone 추가 (누락됨)
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS company_phone character varying DEFAULT '031-215-3990';

-- 2. 혹시 또 누락된 컬럼들 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS golf_reservation_phone character varying,
ADD COLUMN IF NOT EXISTS golf_reservation_mobile character varying,
ADD COLUMN IF NOT EXISTS footer_message text DEFAULT '♡ 즐거운 하루 되시길 바랍니다. ♡';

-- 3. 추가된 컬럼 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'singsing_tours' 
AND column_name IN ('company_phone', 'company_mobile', 'golf_reservation_phone', 'golf_reservation_mobile', 'footer_message')
ORDER BY column_name;

-- 4. 스키마 캐시 새로고침
SELECT pg_reload_conf();