-- 뷰만 다시 생성 (컬럼 오류 수정)
CREATE OR REPLACE VIEW tour_schedule_preview AS
WITH schedule_data AS (
  SELECT 
    s.*,
    ROW_NUMBER() OVER (PARTITION BY s.tour_id ORDER BY s.date) as calculated_day_number
  FROM singsing_schedules s
)
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
        'day_number', COALESCE(s.day_number, s.calculated_day_number),
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
        ) ORDER BY sts.id  -- order 컬럼이 없는 경우 id로 정렬
      )
      FROM singsing_tour_staff sts
      WHERE sts.tour_id = t.id
    ),
    '[]'::json
  ) as staff
FROM singsing_tours t
LEFT JOIN schedule_data s ON s.tour_id = t.id
GROUP BY t.id, t.title, t.start_date, t.end_date, t.notices;