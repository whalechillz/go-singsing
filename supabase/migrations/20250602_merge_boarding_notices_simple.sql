-- boarding_guide_notices 데이터를 기존 JSONB notices에 병합

-- 1. 기존 notices가 이미 JSONB 타입인지 확인
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'singsing_tours' 
        AND column_name = 'notices' 
        AND data_type = 'jsonb'
    ) THEN
        RAISE EXCEPTION 'notices column is not jsonb type';
    END IF;
    
    RAISE NOTICE 'notices column is already jsonb type - proceeding with merge';
END $$;

-- 2. boarding_guide_notices 데이터를 기존 notices JSONB에 병합
WITH boarding_notices_data AS (
    SELECT 
        tour_id,
        jsonb_agg(
            jsonb_build_object(
                'notice', notice,
                'order', "order"
            ) ORDER BY "order"
        ) as new_notices
    FROM boarding_guide_notices
    GROUP BY tour_id
)
UPDATE singsing_tours st
SET notices = 
    CASE 
        -- notices가 NULL이면 새 데이터로 설정
        WHEN st.notices IS NULL THEN bnd.new_notices
        -- notices가 빈 배열이면 새 데이터로 설정
        WHEN st.notices = '[]'::jsonb THEN bnd.new_notices
        -- 기존 notices가 있으면 병합
        ELSE st.notices || bnd.new_notices
    END
FROM boarding_notices_data bnd
WHERE bnd.tour_id = st.id;

-- 3. 백업 테이블 생성
CREATE TABLE IF NOT EXISTS _backup_boarding_guide_notices AS 
SELECT * FROM boarding_guide_notices;

-- 4. 결과 확인
SELECT 
    t.id,
    t.title,
    jsonb_array_length(t.notices) as notice_count,
    jsonb_pretty(t.notices) as notices_formatted
FROM singsing_tours t
WHERE t.notices IS NOT NULL AND jsonb_array_length(t.notices) > 0
LIMIT 3;

-- 5. 기존 테이블 삭제는 확인 후 수동으로 실행
-- DROP TABLE IF EXISTS boarding_guide_notices;