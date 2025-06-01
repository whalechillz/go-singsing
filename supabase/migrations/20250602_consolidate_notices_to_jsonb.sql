-- 1. 먼저 현재 데이터 상태 확인
DO $$
BEGIN
    -- notices 필드가 이미 jsonb인지 확인
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'singsing_tours' 
        AND column_name = 'notices' 
        AND data_type = 'jsonb'
    ) THEN
        RAISE NOTICE 'notices column is already jsonb type';
        RETURN;
    END IF;
END $$;

-- 2. 백업 컬럼 생성
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS notices_text_backup text;

-- 3. 기존 text 데이터 백업
UPDATE singsing_tours 
SET notices_text_backup = notices
WHERE notices IS NOT NULL;

-- 4. 임시 jsonb 컬럼 생성
ALTER TABLE singsing_tours 
ADD COLUMN notices_jsonb jsonb DEFAULT '[]'::jsonb;

-- 5. 기존 text 데이터를 jsonb로 변환 (빈 문자열이 아닌 경우만)
UPDATE singsing_tours 
SET notices_jsonb = 
    CASE 
        WHEN notices IS NOT NULL AND TRIM(notices) != '' THEN
            jsonb_build_array(
                jsonb_build_object(
                    'notice', notices, 
                    'order', 0
                )
            )
        ELSE '[]'::jsonb
    END;

-- 6. boarding_guide_notices 데이터를 jsonb로 병합
WITH boarding_notices_data AS (
    SELECT 
        tour_id,
        jsonb_agg(
            jsonb_build_object(
                'notice', notice,
                'order', CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM singsing_tours st 
                        WHERE st.id = bgn.tour_id 
                        AND st.notices IS NOT NULL 
                        AND TRIM(st.notices) != ''
                    ) 
                    THEN bgn."order" + 1
                    ELSE bgn."order"
                END
            ) ORDER BY bgn."order"
        ) as notices_json
    FROM boarding_guide_notices bgn
    GROUP BY tour_id
)
UPDATE singsing_tours st
SET notices_jsonb = 
    CASE 
        WHEN st.notices_jsonb = '[]'::jsonb THEN bnd.notices_json
        ELSE st.notices_jsonb || bnd.notices_json
    END
FROM boarding_notices_data bnd
WHERE bnd.tour_id = st.id;

-- 7. 기존 notices 컬럼 삭제하고 새 컬럼으로 교체
ALTER TABLE singsing_tours DROP COLUMN notices;
ALTER TABLE singsing_tours RENAME COLUMN notices_jsonb TO notices;

-- 8. 백업 테이블 생성 (boarding_guide_notices)
CREATE TABLE IF NOT EXISTS _backup_boarding_guide_notices AS 
SELECT * FROM boarding_guide_notices;

-- 9. 기존 테이블 삭제 (주의: 백업 확인 후 실행)
-- DROP TABLE IF EXISTS boarding_guide_notices;

-- 10. 확인 쿼리
SELECT 
    id,
    title,
    notices,
    jsonb_array_length(notices) as notice_count
FROM singsing_tours
WHERE jsonb_array_length(notices) > 0
LIMIT 5;