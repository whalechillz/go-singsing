-- singsing_schedules 테이블에 필요한 컬럼 추가

-- 1. day_number 컬럼 추가
ALTER TABLE singsing_schedules 
ADD COLUMN IF NOT EXISTS day_number integer;

-- 2. schedule_items 컬럼 추가
ALTER TABLE singsing_schedules 
ADD COLUMN IF NOT EXISTS schedule_items jsonb DEFAULT '[]'::jsonb;

-- 3. boarding_info 컬럼 추가
ALTER TABLE singsing_schedules 
ADD COLUMN IF NOT EXISTS boarding_info jsonb DEFAULT '{}'::jsonb;

-- 4. day_number 자동 계산
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

-- 5. description을 schedule_items로 변환 (필요한 경우)
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

-- 6. 확인
SELECT 
    id,
    tour_id,
    date,
    day_number,
    title,
    schedule_items,
    boarding_info
FROM singsing_schedules
LIMIT 5;