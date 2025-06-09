-- tour_attraction_options 테이블 처리 스크립트

-- 1. 데이터 내용 확인
SELECT 
    tao.id,
    tao.attraction_id,
    ta.name as attraction_name,
    ta.category as attraction_category,
    tao.is_default,
    tao.additional_price,
    tao.order_no,
    tao.created_at
FROM tour_attraction_options tao
LEFT JOIN tourist_attractions ta ON ta.id = tao.attraction_id;

-- 2. 백업 생성 (안전을 위해)
CREATE TABLE IF NOT EXISTS tour_attraction_options_backup_20250609 AS 
SELECT * FROM tour_attraction_options;

-- 3. schedule_id 컬럼 확인 (이미 삭제되었을 수 있음)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tour_attraction_options';

-- 4. 만약 더 이상 필요없다고 판단되면 삭제
-- DROP TABLE tour_attraction_options CASCADE;

-- 5. tour_schedule_tourist_options는 비어있으므로 바로 삭제 가능
DROP TABLE IF EXISTS tour_schedule_tourist_options CASCADE;