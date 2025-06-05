-- accommodation 컬럼 추가 마이그레이션
-- singsing_tours 테이블에 accommodation 컬럼이 없는 경우 추가

-- 컬럼이 이미 존재하는지 확인하고 없으면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'singsing_tours' 
        AND column_name = 'accommodation'
    ) THEN
        ALTER TABLE singsing_tours 
        ADD COLUMN accommodation TEXT DEFAULT '';
    END IF;
END $$;

-- 기존 데이터 업데이트 (tour_products의 hotel 정보를 가져와서 업데이트)
UPDATE singsing_tours t
SET accommodation = COALESCE(p.hotel, '')
FROM tour_products p
WHERE t.tour_product_id = p.id
AND t.accommodation IS NULL OR t.accommodation = '';
