-- notices 필드 처리는 별도 마이그레이션 파일(20250602_consolidate_notices_to_jsonb.sql)에서 처리
-- singsing_tours 테이블에 이미 notices text 필드가 존재하므로 별도 처리 필요

-- schedules 테이블에 boarding_info 필드 추가
ALTER TABLE singsing_schedules
ADD COLUMN IF NOT EXISTS boarding_info jsonb DEFAULT '{}'::jsonb;

-- 기존 boarding_guide_routes 데이터를 schedules로 이동
UPDATE singsing_schedules ss
SET boarding_info = jsonb_build_object(
  'time', bgr.time,
  'place', bgr.place,
  'order', bgr.order
)
FROM boarding_guide_routes bgr
WHERE bgr.tour_id = ss.tour_id
AND bgr.time::date = ss.schedule_date;

-- 백업 테이블 생성 (안전을 위해)
CREATE TABLE IF NOT EXISTS _backup_boarding_guide_contacts AS SELECT * FROM boarding_guide_contacts;
CREATE TABLE IF NOT EXISTS _backup_boarding_guide_notices AS SELECT * FROM boarding_guide_notices;
CREATE TABLE IF NOT EXISTS _backup_boarding_guide_routes AS SELECT * FROM boarding_guide_routes;

-- 기존 테이블 삭제 (주의: 백업 확인 후 실행)
-- DROP TABLE IF EXISTS boarding_guide_contacts;
-- DROP TABLE IF EXISTS boarding_guide_notices;
-- DROP TABLE IF EXISTS boarding_guide_routes;

-- 뷰 생성: 투어 일정 미리보기용
CREATE OR REPLACE VIEW tour_schedule_preview AS
SELECT 
  t.id as tour_id,
  t.tour_name,
  t.start_date,
  t.end_date,
  t.notices,
  json_agg(
    json_build_object(
      'date', s.schedule_date,
      'day_number', s.day_number,
      'schedule_items', s.schedule_items,
      'boarding_info', s.boarding_info,
      'tee_times', (
        SELECT json_agg(
          json_build_object(
            'time', tt.tee_time,
            'course', tt.golf_course_name,
            'participants', (
              SELECT json_agg(
                json_build_object(
                  'name', p.name,
                  'phone', p.phone,
                  'gender', p.gender
                )
              )
              FROM singsing_participants p
              WHERE p.id = ANY(tt.participant_ids)
            )
          )
        )
        FROM singsing_tee_times tt
        WHERE tt.tour_id = t.id
        AND tt.play_date = s.schedule_date
      )
    ) ORDER BY s.schedule_date
  ) as schedules,
  (
    SELECT json_agg(
      json_build_object(
        'name', sts.name,
        'phone', sts.phone,
        'role', sts.role
      ) ORDER BY sts.order
    )
    FROM singsing_tour_staff sts
    WHERE sts.tour_id = t.id
  ) as staff
FROM singsing_tours t
LEFT JOIN singsing_schedules s ON s.tour_id = t.id
GROUP BY t.id, t.tour_name, t.start_date, t.end_date, t.notices;