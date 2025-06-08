-- ================================================================
-- tour_journey_items 테이블 외래 키 확인 및 재설정
-- ================================================================

-- 1. 현재 외래 키 제약조건 확인
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS foreign_table_name,
    af.attname AS foreign_column_name
FROM 
    pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE 
    c.contype = 'f' 
    AND c.conrelid = 'tour_journey_items'::regclass;

-- 2. 외래 키가 없다면 추가
-- boarding_place_id 외래 키
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tour_journey_items_boarding_place_id_fkey'
    ) THEN
        ALTER TABLE tour_journey_items
        ADD CONSTRAINT tour_journey_items_boarding_place_id_fkey
        FOREIGN KEY (boarding_place_id) 
        REFERENCES singsing_boarding_places(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'boarding_place_id 외래 키가 추가되었습니다.';
    END IF;
END $$;

-- spot_id 외래 키
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tour_journey_items_spot_id_fkey'
    ) THEN
        ALTER TABLE tour_journey_items
        ADD CONSTRAINT tour_journey_items_spot_id_fkey
        FOREIGN KEY (spot_id) 
        REFERENCES tourist_attractions(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'spot_id 외래 키가 추가되었습니다.';
    END IF;
END $$;

-- 3. Supabase 스키마 캐시 갱신을 위한 함수 (선택사항)
-- 이 쿼리는 Supabase가 관계를 다시 인식하도록 도움을 줄 수 있습니다
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'tour_journey_items';

-- 4. 확인 메시지
DO $$
BEGIN
    RAISE NOTICE '외래 키 설정이 완료되었습니다. Supabase 대시보드를 새로고침하세요.';
END $$;
