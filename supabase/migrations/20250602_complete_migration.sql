-- 전체 마이그레이션 (하나의 파일로 통합)

-- 1. 필요한 컬럼들 추가
ALTER TABLE singsing_schedules 
ADD COLUMN IF NOT EXISTS day_number integer;

ALTER TABLE singsing_schedules 
ADD COLUMN IF NOT EXISTS schedule_items jsonb DEFAULT '[]'::jsonb;

ALTER TABLE singsing_schedules 
ADD COLUMN IF NOT EXISTS boarding_info jsonb DEFAULT '{}'::jsonb;

-- 2. day_number 자동 계산
UPDATE singsing_schedules s
SET day_number = sub.day_num
FROM (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY tour_id ORDER BY date) as day_num
    FROM singsing_schedules
    WHERE date IS NOT NULL
) sub
WHERE s.id = sub.id AND s.day_number IS NULL;

-- 3. description을 schedule_items로 변환
UPDATE singsing_schedules
SET schedule_items = 
    CASE 
        WHEN description IS NOT NULL AND TRIM(description) != '' THEN
            jsonb_build_array(
                jsonb_build_object(
                    'time', '',
                    'content', description
                )
            )
        ELSE '[]'::jsonb
    END
WHERE schedule_items = '[]'::jsonb 
AND description IS NOT NULL 
AND TRIM(description) != '';

-- 4. singsing_tour_staff 테이블 생성
CREATE TABLE IF NOT EXISTS singsing_tour_staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id uuid REFERENCES singsing_tours(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    phone varchar(50),
    role varchar(100),
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_staff_tour_id ON singsing_tour_staff(tour_id);

-- 5. boarding_guide_contacts에서 데이터 이동
INSERT INTO singsing_tour_staff (tour_id, name, phone, role, display_order)
SELECT 
    bgc.tour_id,
    bgc.name,
    bgc.phone,
    bgc.role,
    bgc.id as display_order
FROM boarding_guide_contacts bgc
WHERE NOT EXISTS (
    SELECT 1 FROM singsing_tour_staff sts 
    WHERE sts.tour_id = bgc.tour_id 
    AND sts.name = bgc.name
);

-- 6. boarding_guide_routes 데이터를 schedules의 boarding_info로 이동
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

-- 7. 뷰 생성
CREATE OR REPLACE VIEW tour_schedule_preview AS
SELECT 
  t.id as tour_id,
  t.title as tour_name,
  t.start_date,
  t.end_date,
  t.notices,
  COALESCE(
    json_agg(
      json_build_object(
        'date', s.date,
        'day_number', COALESCE(s.day_number, 1),
        'schedule_items', COALESCE(s.schedule_items, '[]'::jsonb),
        'boarding_info', COALESCE(s.boarding_info, '{}'::jsonb),
        'title', s.title,
        'description', s.description,
        'meal_breakfast', s.meal_breakfast,
        'meal_lunch', s.meal_lunch,
        'meal_dinner', s.meal_dinner,
        'menu_breakfast', s.menu_breakfast,
        'menu_lunch', s.menu_lunch,
        'menu_dinner', s.menu_dinner,
        'tee_times', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'time', tt.tee_time,
              'course', tt.golf_course,
              'participants', (
                SELECT COALESCE(json_agg(
                  json_build_object(
                    'name', p.name,
                    'phone', p.phone,
                    'gender', p.gender,
                    'team_name', p.team_name
                  ) ORDER BY ptt.created_at
                ), '[]'::json)
                FROM singsing_participants p
                JOIN singsing_participant_tee_times ptt ON ptt.participant_id = p.id
                WHERE ptt.tee_time_id = tt.id
              )
            ) ORDER BY tt.tee_time
          ), '[]'::json)
          FROM singsing_tee_times tt
          WHERE tt.tour_id = t.id
          AND tt.play_date = s.date
        )
      ) ORDER BY s.date
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) as schedules,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'name', sts.name,
          'phone', sts.phone,
          'role', sts.role
        ) ORDER BY sts.display_order, sts.id
      )
      FROM singsing_tour_staff sts
      WHERE sts.tour_id = t.id
    ),
    '[]'::json
  ) as staff
FROM singsing_tours t
LEFT JOIN singsing_schedules s ON s.tour_id = t.id
GROUP BY t.id, t.title, t.start_date, t.end_date, t.notices;

-- 8. 백업 테이블 생성
CREATE TABLE IF NOT EXISTS _backup_boarding_guide_contacts AS 
SELECT * FROM boarding_guide_contacts;

CREATE TABLE IF NOT EXISTS _backup_boarding_guide_notices AS 
SELECT * FROM boarding_guide_notices;

CREATE TABLE IF NOT EXISTS _backup_boarding_guide_routes AS 
SELECT * FROM boarding_guide_routes;

-- 9. 확인 쿼리
SELECT 
    tour_id,
    tour_name,
    jsonb_array_length(notices) as notice_count,
    json_array_length(schedules) as schedule_count,
    json_array_length(staff) as staff_count
FROM tour_schedule_preview
LIMIT 5;