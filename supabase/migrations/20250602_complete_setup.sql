-- singsing_tour_staff 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS singsing_tour_staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id uuid REFERENCES singsing_tours(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    phone varchar(50),
    role varchar(100),
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tour_staff_tour_id ON singsing_tour_staff(tour_id);

-- 기존 boarding_guide_contacts에서 데이터 이동 (있는 경우)
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

-- 뷰 생성 (모든 필요한 테이블과 컬럼이 준비된 후)
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