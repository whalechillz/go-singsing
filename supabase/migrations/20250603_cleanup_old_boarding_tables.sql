-- 기존 탑승 정보 관련 테이블 정리
-- 새로운 singsing_tour_boarding_times 테이블로 통합되어 더 이상 필요하지 않음

-- 1. 기존 테이블 삭제
DROP TABLE IF EXISTS boarding_guide_contacts CASCADE;
DROP TABLE IF EXISTS boarding_guide_notices CASCADE;
DROP TABLE IF EXISTS boarding_guide_routes CASCADE;
DROP TABLE IF EXISTS singsing_boarding_schedules CASCADE;

-- 2. singsing_schedules 테이블의 boarding_info 컬럼 삭제
ALTER TABLE singsing_schedules 
DROP COLUMN IF EXISTS boarding_info;

-- 3. Supabase types 재생성을 위한 코멘트
-- Supabase Dashboard에서 "Generate Types" 버튼을 클릭하여 
-- TypeScript 타입 정의를 다시 생성해주세요.
