-- 2025-06-08: 일정 관리에서 여정 관리로 전환
-- 일정 관리 정보(description 필드) 제거

-- 1. description 컬럼 제거
ALTER TABLE singsing_schedules 
DROP COLUMN IF EXISTS description;

-- 2. schedule_items 컬럼 제거 (일정 관리에서 사용하던 필드)
ALTER TABLE singsing_schedules 
DROP COLUMN IF EXISTS schedule_items;

-- 주의: 이 마이그레이션을 실행하기 전에 반드시 데이터 백업을 수행하세요.
-- 백업된 데이터는 /Users/prowhale/MASLABS/go2.singsinggolf.kr/backup/2025-06-08-schedule-to-journey 디렉토리에 있습니다.