-- 전체 마이그레이션 순서

-- 1. 먼저 필요한 컬럼들 추가
\i /supabase/migrations/20250602_add_missing_columns.sql

-- 2. singsing_tour_staff 테이블 생성 및 뷰 생성
\i /supabase/migrations/20250602_complete_setup.sql

-- 3. boarding_guide_routes 데이터를 schedules의 boarding_info로 이동
UPDATE singsing_schedules ss
SET boarding_info = 
    COALESCE(boarding_info, '{}'::jsonb) || 
    (
        SELECT jsonb_build_object(
            'routes', jsonb_agg(
                jsonb_build_object(
                    'time', bgr.time,
                    'place', bgr.place,
                    'order', bgr.order
                ) ORDER BY bgr.order
            )
        )
        FROM boarding_guide_routes bgr
        WHERE bgr.tour_id = ss.tour_id
    )
WHERE ss.id = (
    SELECT id FROM singsing_schedules 
    WHERE tour_id = ss.tour_id 
    ORDER BY date 
    LIMIT 1
)
AND EXISTS (
    SELECT 1 FROM boarding_guide_routes bgr 
    WHERE bgr.tour_id = ss.tour_id
);

-- 4. 백업 테이블 생성
CREATE TABLE IF NOT EXISTS _backup_boarding_guide_contacts AS 
SELECT * FROM boarding_guide_contacts;

CREATE TABLE IF NOT EXISTS _backup_boarding_guide_notices AS 
SELECT * FROM boarding_guide_notices;

CREATE TABLE IF NOT EXISTS _backup_boarding_guide_routes AS 
SELECT * FROM boarding_guide_routes;

-- 5. 뷰가 제대로 생성되었는지 테스트
SELECT 
    tour_id,
    tour_name,
    jsonb_array_length(notices) as notice_count,
    json_array_length(schedules) as schedule_count,
    json_array_length(staff) as staff_count
FROM tour_schedule_preview
LIMIT 5;

-- 6. 확인 후 기존 테이블 삭제 (수동으로 실행)
-- DROP TABLE IF EXISTS boarding_guide_contacts;
-- DROP TABLE IF EXISTS boarding_guide_notices;
-- DROP TABLE IF EXISTS boarding_guide_routes;