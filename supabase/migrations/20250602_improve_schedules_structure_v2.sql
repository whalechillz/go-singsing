-- singsing_schedules 테이블 구조 개선 (수정 버전)

-- 1. 테이블 구조 확인
DO $$
DECLARE
    v_has_date boolean;
    v_has_schedule_date boolean;
BEGIN
    -- date 컬럼 존재 여부 확인
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'singsing_schedules' 
        AND column_name = 'date'
    ) INTO v_has_date;
    
    -- schedule_date 컬럼 존재 여부 확인
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'singsing_schedules' 
        AND column_name = 'schedule_date'
    ) INTO v_has_schedule_date;
    
    -- date 컬럼만 있고 schedule_date가 없으면 그대로 사용
    -- 둘 다 없으면 date 컬럼 추가
    IF NOT v_has_date AND NOT v_has_schedule_date THEN
        ALTER TABLE singsing_schedules ADD COLUMN date date;
    END IF;
END $$;

-- 2. 나머지 필요한 컬럼들 추가
DO $$
BEGIN
    -- day_number 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'singsing_schedules' 
        AND column_name = 'day_number'
    ) THEN
        ALTER TABLE singsing_schedules ADD COLUMN day_number integer;
    END IF;

    -- schedule_items 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'singsing_schedules' 
        AND column_name = 'schedule_items'
    ) THEN
        ALTER TABLE singsing_schedules ADD COLUMN schedule_items jsonb DEFAULT '[]'::jsonb;
    END IF;

    -- boarding_info 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'singsing_schedules' 
        AND column_name = 'boarding_info'
    ) THEN
        ALTER TABLE singsing_schedules ADD COLUMN boarding_info jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. day_number 자동 계산 (date 기준)
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

-- 4. description을 schedule_items로 변환 (필요한 경우)
UPDATE singsing_schedules
SET schedule_items = 
    CASE 
        WHEN description IS NOT NULL AND TRIM(description) != '' THEN
            -- description의 각 줄을 별도의 item으로 변환
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'time', '',
                        'content', line
                    )
                )
                FROM unnest(string_to_array(description, E'\n')) AS line
                WHERE TRIM(line) != ''
            )
        ELSE '[]'::jsonb
    END
WHERE schedule_items = '[]'::jsonb 
AND description IS NOT NULL 
AND TRIM(description) != '';

-- 5. boarding_guide_routes 데이터를 schedules로 이동
UPDATE singsing_schedules ss
SET boarding_info = jsonb_build_object(
    'time', bgr.time,
    'place', bgr.place,
    'order', bgr.order
)
FROM boarding_guide_routes bgr
WHERE bgr.tour_id = ss.tour_id
AND bgr.time::date = ss.date
AND ss.boarding_info = '{}'::jsonb;

-- 6. 뷰 생성: 투어 일정 미리보기용
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
              'course', tt.course,
              'team_no', tt.team_no,
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
          AND tt.date = s.date::text
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
        ) ORDER BY sts."order"
      )
      FROM singsing_tour_staff sts
      WHERE sts.tour_id = t.id
    ),
    '[]'::json
  ) as staff
FROM singsing_tours t
LEFT JOIN schedule_data s ON s.tour_id = t.id
GROUP BY t.id, t.title, t.start_date, t.end_date, t.notices;

-- 7. 확인 쿼리
SELECT 
    tour_id,
    date,
    day_number,
    title,
    jsonb_pretty(schedule_items) as schedule_items,
    jsonb_pretty(boarding_info) as boarding_info
FROM singsing_schedules
WHERE tour_id IS NOT NULL
ORDER BY tour_id, date
LIMIT 5;