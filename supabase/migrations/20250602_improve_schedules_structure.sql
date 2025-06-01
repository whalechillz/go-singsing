-- singsing_schedules 테이블 구조 개선

-- 1. 필요한 컬럼들이 이미 존재하는지 확인
DO $$
BEGIN
    -- schedule_date 컬럼 추가 (date 컬럼이 이미 있을 수 있음)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'singsing_schedules' 
        AND column_name = 'schedule_date'
    ) THEN
        -- date 컬럼이 있으면 이름 변경, 없으면 추가
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'singsing_schedules' 
            AND column_name = 'date'
        ) THEN
            ALTER TABLE singsing_schedules RENAME COLUMN date TO schedule_date;
        ELSE
            ALTER TABLE singsing_schedules ADD COLUMN schedule_date date;
        END IF;
    END IF;

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

-- 2. day_number 자동 계산 (schedule_date 기준)
UPDATE singsing_schedules s
SET day_number = sub.day_num
FROM (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY tour_id ORDER BY schedule_date) as day_num
    FROM singsing_schedules
    WHERE schedule_date IS NOT NULL
) sub
WHERE s.id = sub.id AND s.day_number IS NULL;

-- 3. description을 schedule_items로 변환 (필요한 경우)
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

-- 4. boarding_guide_routes 데이터를 schedules로 이동
UPDATE singsing_schedules ss
SET boarding_info = jsonb_build_object(
    'time', bgr.time,
    'place', bgr.place,
    'order', bgr.order
)
FROM boarding_guide_routes bgr
WHERE bgr.tour_id = ss.tour_id
AND bgr.time::date = ss.schedule_date
AND ss.boarding_info = '{}'::jsonb;

-- 5. 확인 쿼리
SELECT 
    tour_id,
    schedule_date,
    day_number,
    title,
    schedule_items,
    boarding_info
FROM singsing_schedules
ORDER BY tour_id, day_number
LIMIT 10;