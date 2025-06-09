-- singsing_schedules 및 관련 테이블 완전 삭제 스크립트

-- 1. 외래 키 제약 조건 삭제
ALTER TABLE tour_schedule_tourist_options 
DROP CONSTRAINT IF EXISTS tour_schedule_tourist_options_schedule_id_fkey;

ALTER TABLE tour_attraction_options 
DROP CONSTRAINT IF EXISTS tour_attraction_options_schedule_id_fkey;

-- 2. singsing_schedules 테이블 삭제
DROP TABLE IF EXISTS singsing_schedules;

-- 3. 백업 테이블들 삭제
DROP TABLE IF EXISTS singsing_schedules_backup;
DROP TABLE IF EXISTS singsing_schedules_backup_final;

-- 4. 삭제 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%singsing_schedules%'
ORDER BY table_name;

-- 5. tour_schedule_tourist_options와 tour_attraction_options 테이블 확인
-- 이 테이블들이 더 이상 사용되지 않는다면 삭제 고려
SELECT * FROM tour_schedule_tourist_options LIMIT 5;
SELECT * FROM tour_attraction_options LIMIT 5;