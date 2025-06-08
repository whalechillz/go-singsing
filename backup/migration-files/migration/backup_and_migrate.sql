-- ======================================
-- Phase 2 마이그레이션 실행 스크립트
-- 실행일: 2025-05-30
-- ======================================

-- 1. 백업 생성
CREATE TABLE IF NOT EXISTS singsing_schedules_backup_20250530 AS SELECT * FROM singsing_schedules;
CREATE TABLE IF NOT EXISTS singsing_tours_backup_20250530 AS SELECT * FROM singsing_tours;
CREATE TABLE IF NOT EXISTS singsing_participants_backup_20250530 AS SELECT * FROM singsing_participants;
CREATE TABLE IF NOT EXISTS singsing_rooms_backup_20250530 AS SELECT * FROM singsing_rooms;
CREATE TABLE IF NOT EXISTS singsing_tee_times_backup_20250530 AS SELECT * FROM singsing_tee_times;

-- 2. 백업 확인
SELECT 
    'singsing_schedules_backup' as table_name, 
    COUNT(*) as row_count 
FROM singsing_schedules_backup_20250530
UNION ALL
SELECT 
    'singsing_tours_backup' as table_name, 
    COUNT(*) as row_count 
FROM singsing_tours_backup_20250530
UNION ALL
SELECT 
    'singsing_participants_backup' as table_name, 
    COUNT(*) as row_count 
FROM singsing_participants_backup_20250530;

-- 3. 완료 메시지
SELECT '백업 완료! 이제 개별 마이그레이션 파일을 순서대로 실행하세요.' as message;
