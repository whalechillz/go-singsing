-- 캠페인 대상자 쿼리를 안전하게 실행하는 RPC 함수
CREATE OR REPLACE FUNCTION execute_campaign_query(query_text TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  last_tour_date DATE,
  total_tour_count INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 보안을 위해 허용된 쿼리만 실행
  IF query_text NOT LIKE '%customers%' OR 
     query_text LIKE '%;%' OR 
     query_text ILIKE '%DROP%' OR 
     query_text ILIKE '%DELETE%' OR 
     query_text ILIKE '%UPDATE%' OR 
     query_text ILIKE '%INSERT%' THEN
    RAISE EXCEPTION 'Invalid query';
  END IF;
  
  -- 쿼리 실행
  RETURN QUERY EXECUTE query_text;
END;
$$;

-- 권한 설정
GRANT EXECUTE ON FUNCTION execute_campaign_query(TEXT) TO authenticated;
