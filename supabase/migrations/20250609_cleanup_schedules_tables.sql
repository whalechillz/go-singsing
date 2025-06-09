-- singsing_schedules 테이블 삭제 마이그레이션
-- 실행 전 반드시 백업하세요!

-- 1. 먼저 데이터 확인 (삭제 전 실행)
SELECT COUNT(*) as total_records FROM singsing_schedules;

-- 2. 백업 테이블 생성 (안전을 위해)
CREATE TABLE IF NOT EXISTS singsing_schedules_backup_20250609 AS 
SELECT * FROM singsing_schedules;

-- 3. 외래 키 제약 조건 확인
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'singsing_schedules';

-- 4. RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view schedules for their tours" ON singsing_schedules;
DROP POLICY IF EXISTS "Users can manage schedules for their tours" ON singsing_schedules;

-- 5. 트리거 삭제
DROP TRIGGER IF EXISTS update_singsing_schedules_updated_at ON singsing_schedules;

-- 6. 테이블 삭제
DROP TABLE IF EXISTS singsing_schedules;

-- 7. backup 테이블도 필요시 삭제
-- DROP TABLE IF EXISTS singsing_schedules_backup;

-- 8. 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%schedule%'
ORDER BY table_name;
