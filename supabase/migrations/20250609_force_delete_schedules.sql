-- singsing_schedules 테이블 완전 삭제 스크립트
-- 순서대로 실행하세요

-- 1. 현재 상태 확인
SELECT COUNT(*) as record_count FROM singsing_schedules;

-- 2. 백업 생성 (안전을 위해)
CREATE TABLE IF NOT EXISTS singsing_schedules_backup_final AS 
SELECT * FROM singsing_schedules;

-- 3. 외래 키 제약 조건 확인
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'singsing_schedules';

-- 4. RLS 정책 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'singsing_schedules';

-- 5. RLS 비활성화
ALTER TABLE singsing_schedules DISABLE ROW LEVEL SECURITY;

-- 6. 모든 RLS 정책 삭제
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'singsing_schedules'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON singsing_schedules', pol.policyname);
    END LOOP;
END $$;

-- 7. 트리거 삭제
DROP TRIGGER IF EXISTS update_singsing_schedules_updated_at ON singsing_schedules;
DROP TRIGGER IF EXISTS set_updated_at ON singsing_schedules;

-- 8. 뷰나 함수에서 참조 확인
SELECT 
    n.nspname as schema_name,
    c.relname as object_name,
    c.relkind as object_type,
    pg_get_viewdef(c.oid) as definition
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE pg_get_viewdef(c.oid) LIKE '%singsing_schedules%'
   OR c.relkind IN ('v', 'f');

-- 9. 테이블 삭제 시도 (일반)
DROP TABLE IF EXISTS singsing_schedules;

-- 10. 만약 위가 실패하면 CASCADE 사용 (주의: 의존성도 삭제됨)
-- DROP TABLE singsing_schedules CASCADE;

-- 11. 삭제 확인
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'singsing_schedules'
) as table_exists;

-- 12. 백업 테이블도 삭제하려면
-- DROP TABLE IF EXISTS singsing_schedules_backup;
-- DROP TABLE IF EXISTS singsing_schedules_backup_20250609;
-- DROP TABLE IF EXISTS singsing_schedules_backup_final;