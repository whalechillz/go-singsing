-- 🎯 고객 타겟팅 쿼리 모음
-- 2025-06-22

-- ========================================
-- 1. 탑승지 기반 지역별 고객 조회
-- ========================================

-- 탑승지 정보를 가진 고객 조회 (최근 투어 기준)
WITH customer_boarding_info AS (
  SELECT DISTINCT 
    c.id,
    c.name,
    c.phone,
    c.email,
    c.marketing_agreed,
    c.kakao_friend,
    bp.name as boarding_place,
    CASE 
      WHEN bp.name IN ('서울', '인천', '수원', '안양', '성남', '용인') THEN '수도권'
      WHEN bp.name IN ('일산', '파주', '의정부', '양주') THEN '경기북부'
      WHEN bp.name IN ('평택', '안성', '화성', '오산') THEN '경기남부'
      WHEN bp.name IN ('대전', '천안', '청주') THEN '충청권'
      WHEN bp.name IN ('부산', '대구', '울산') THEN '영남권'
      WHEN bp.name IN ('광주', '전주') THEN '호남권'
      ELSE '기타'
    END as region,
    MAX(t.start_date) as last_tour_date
  FROM customers c
  JOIN singsing_participants p ON c.phone = p.phone
  JOIN boarding_place_assignments bpa ON bpa.participant_id = p.id
  JOIN boarding_places bp ON bp.id = bpa.boarding_place_id
  JOIN singsing_tours t ON t.id = p.tour_id
  WHERE c.status = 'active'
  GROUP BY c.id, c.name, c.phone, c.email, c.marketing_agreed, c.kakao_friend, bp.name
)
SELECT * FROM customer_boarding_info;

-- ========================================
-- 2. 투어 참여 이력별 고객
-- ========================================

-- 투어 참여 고객 (전체)
SELECT c.*, 
       COUNT(DISTINCT p.tour_id) as tour_count,
       MAX(t.start_date) as last_tour_date,
       MIN(t.start_date) as first_tour_date
FROM customers c
JOIN singsing_participants p ON c.phone = p.phone
JOIN singsing_tours t ON p.tour_id = t.id
WHERE c.status = 'active'
  AND t.status != 'cancelled'
GROUP BY c.id;

-- 투어 미참여 고객
SELECT c.*
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM singsing_participants p
  WHERE p.phone = c.phone
);

-- ========================================
-- 3. 연락 시점별 고객
-- ========================================

-- 최근 연락 이력별 고객 조회
WITH last_contact AS (
  SELECT 
    c.*,
    MAX(ml.sent_at) as last_contact_date,
    COUNT(ml.id) as total_messages,
    CASE 
      WHEN MAX(ml.sent_at) > NOW() - INTERVAL '1 month' THEN '1개월 이내'
      WHEN MAX(ml.sent_at) > NOW() - INTERVAL '3 months' THEN '3개월 이내'
      WHEN MAX(ml.sent_at) > NOW() - INTERVAL '6 months' THEN '6개월 이내'
      WHEN MAX(ml.sent_at) > NOW() - INTERVAL '1 year' THEN '1년 이내'
      WHEN MAX(ml.sent_at) > NOW() - INTERVAL '2 years' THEN '2년 이내'
      WHEN MAX(ml.sent_at) > NOW() - INTERVAL '3 years' THEN '3년 이내'
      ELSE '3년 이상'
    END as contact_period
  FROM customers c
  LEFT JOIN message_logs ml ON c.id = ml.customer_id
  WHERE ml.status = 'delivered'
  GROUP BY c.id
)
SELECT * FROM last_contact;

-- ========================================
-- 4. 모임/그룹별 고객
-- ========================================

-- 태그 기반 모임별 고객
SELECT 
  c.*,
  unnest(c.tags) as group_name
FROM customers c
WHERE c.tags IS NOT NULL AND array_length(c.tags, 1) > 0
ORDER BY group_name, c.name;

-- ========================================
-- 5. 마케팅 타겟 복합 쿼리
-- ========================================

-- 수도권 지역 + 6개월 이내 투어 + 카카오 친구
WITH target_customers AS (
  SELECT DISTINCT
    c.id,
    c.name,
    c.phone,
    c.email,
    c.marketing_agreed,
    c.kakao_friend,
    cb.region,
    cb.boarding_place,
    cb.last_tour_date,
    lc.last_contact_date,
    lc.contact_period,
    c.total_tour_count
  FROM customers c
  JOIN (
    -- 탑승지 정보
    SELECT DISTINCT 
      c.id,
      bp.name as boarding_place,
      CASE 
        WHEN bp.name IN ('서울', '인천', '수원', '안양', '성남', '용인') THEN '수도권'
        WHEN bp.name IN ('일산', '파주', '의정부', '양주') THEN '경기북부'
        WHEN bp.name IN ('평택', '안성', '화성', '오산') THEN '경기남부'
        ELSE '기타'
      END as region,
      MAX(t.start_date) as last_tour_date
    FROM customers c
    JOIN singsing_participants p ON c.phone = p.phone
    JOIN boarding_place_assignments bpa ON bpa.participant_id = p.id
    JOIN boarding_places bp ON bp.id = bpa.boarding_place_id
    JOIN singsing_tours t ON t.id = p.tour_id
    GROUP BY c.id, bp.name
  ) cb ON cb.id = c.id
  LEFT JOIN (
    -- 최근 연락 정보
    SELECT 
      customer_id,
      MAX(sent_at) as last_contact_date,
      CASE 
        WHEN MAX(sent_at) > NOW() - INTERVAL '3 months' THEN '3개월 이내'
        WHEN MAX(sent_at) > NOW() - INTERVAL '6 months' THEN '6개월 이내'
        ELSE '6개월 이상'
      END as contact_period
    FROM message_logs
    WHERE status = 'delivered'
    GROUP BY customer_id
  ) lc ON lc.customer_id = c.id
  WHERE c.status = 'active'
    AND c.marketing_agreed = true
    AND cb.region = '수도권'
    AND cb.last_tour_date > NOW() - INTERVAL '6 months'
    AND c.kakao_friend = true
)
SELECT * FROM target_customers;

-- ========================================
-- 6. VIP 고객 (3회 이상 참여)
-- ========================================

SELECT 
  c.*,
  COUNT(DISTINCT p.tour_id) as actual_tour_count,
  SUM(p.payment_amount) as total_spent,
  MAX(t.start_date) as last_tour_date,
  string_agg(DISTINCT t.title, ', ') as tour_history
FROM customers c
JOIN singsing_participants p ON c.phone = p.phone
JOIN singsing_tours t ON p.tour_id = t.id
WHERE c.status = 'active'
  AND t.status != 'cancelled'
GROUP BY c.id
HAVING COUNT(DISTINCT p.tour_id) >= 3
ORDER BY actual_tour_count DESC, total_spent DESC;

-- ========================================
-- 7. 리텐션 대상 고객 (3개월 이상 미참여)
-- ========================================

WITH retention_targets AS (
  SELECT 
    c.*,
    MAX(t.start_date) as last_tour_date,
    EXTRACT(MONTH FROM AGE(NOW(), MAX(t.start_date))) as months_since_last_tour
  FROM customers c
  JOIN singsing_participants p ON c.phone = p.phone
  JOIN singsing_tours t ON p.tour_id = t.id
  WHERE c.status = 'active'
    AND t.status != 'cancelled'
  GROUP BY c.id
  HAVING MAX(t.start_date) < NOW() - INTERVAL '3 months'
    AND MAX(t.start_date) > NOW() - INTERVAL '1 year'
)
SELECT * FROM retention_targets
ORDER BY months_since_last_tour ASC;

-- ========================================
-- 8. 생일 마케팅 대상
-- ========================================

SELECT 
  c.*,
  EXTRACT(DAY FROM AGE(c.birth_date, DATE_TRUNC('year', c.birth_date))) as birth_day_of_year,
  CASE 
    WHEN EXTRACT(MONTH FROM c.birth_date) = EXTRACT(MONTH FROM NOW()) THEN '이번달 생일'
    WHEN EXTRACT(MONTH FROM c.birth_date) = EXTRACT(MONTH FROM NOW() + INTERVAL '1 month') THEN '다음달 생일'
    ELSE '기타'
  END as birthday_status
FROM customers c
WHERE c.birth_date IS NOT NULL
  AND c.status = 'active'
  AND c.marketing_agreed = true
  AND EXTRACT(MONTH FROM c.birth_date) IN (
    EXTRACT(MONTH FROM NOW()),
    EXTRACT(MONTH FROM NOW() + INTERVAL '1 month')
  )
ORDER BY EXTRACT(MONTH FROM c.birth_date), EXTRACT(DAY FROM c.birth_date);

-- ========================================
-- 9. 메시지 발송 대상 필터링 함수
-- ========================================

CREATE OR REPLACE FUNCTION get_marketing_targets(
  p_region TEXT DEFAULT NULL,
  p_tour_history VARCHAR DEFAULT 'all', -- 'participated', 'not_participated', 'all'
  p_last_contact_months INT DEFAULT NULL,
  p_last_tour_months INT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_kakao_only BOOLEAN DEFAULT false,
  p_limit INT DEFAULT 1000
)
RETURNS TABLE (
  customer_id UUID,
  name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  region TEXT,
  last_tour_date DATE,
  last_contact_date TIMESTAMP,
  tour_count INT,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_data AS (
    SELECT DISTINCT
      c.id as customer_id,
      c.name,
      c.phone,
      c.email,
      COALESCE(cb.region, '미분류') as region,
      cb.last_tour_date,
      ml.last_contact_date,
      c.total_tour_count as tour_count,
      c.tags
    FROM customers c
    LEFT JOIN LATERAL (
      SELECT 
        CASE 
          WHEN bp.name IN ('서울', '인천', '수원', '안양', '성남', '용인') THEN '수도권'
          WHEN bp.name IN ('일산', '파주', '의정부', '양주') THEN '경기북부'
          WHEN bp.name IN ('평택', '안성', '화성', '오산') THEN '경기남부'
          WHEN bp.name IN ('대전', '천안', '청주') THEN '충청권'
          WHEN bp.name IN ('부산', '대구', '울산') THEN '영남권'
          WHEN bp.name IN ('광주', '전주') THEN '호남권'
          ELSE '기타'
        END as region,
        MAX(t.start_date) as last_tour_date
      FROM singsing_participants p
      JOIN boarding_place_assignments bpa ON bpa.participant_id = p.id
      JOIN boarding_places bp ON bp.id = bpa.boarding_place_id
      JOIN singsing_tours t ON t.id = p.tour_id
      WHERE p.phone = c.phone
      GROUP BY bp.name
      ORDER BY MAX(t.start_date) DESC
      LIMIT 1
    ) cb ON true
    LEFT JOIN LATERAL (
      SELECT MAX(sent_at) as last_contact_date
      FROM message_logs
      WHERE customer_id = c.id AND status = 'delivered'
    ) ml ON true
    WHERE c.status = 'active'
      AND c.marketing_agreed = true
      AND (p_kakao_only = false OR c.kakao_friend = true)
  )
  SELECT * FROM customer_data
  WHERE 
    -- 지역 필터
    (p_region IS NULL OR region = p_region)
    -- 투어 이력 필터
    AND (
      p_tour_history = 'all' 
      OR (p_tour_history = 'participated' AND tour_count > 0)
      OR (p_tour_history = 'not_participated' AND tour_count = 0)
    )
    -- 최근 연락 필터
    AND (
      p_last_contact_months IS NULL 
      OR last_contact_date IS NULL
      OR last_contact_date < NOW() - (p_last_contact_months || ' months')::INTERVAL
    )
    -- 최근 투어 필터
    AND (
      p_last_tour_months IS NULL 
      OR last_tour_date IS NULL
      OR last_tour_date < NOW() - (p_last_tour_months || ' months')::INTERVAL
    )
    -- 태그 필터
    AND (
      p_tags IS NULL 
      OR tags && p_tags -- 배열 중복 체크
    )
  ORDER BY last_tour_date DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 사용 예시:
-- SELECT * FROM get_marketing_targets('수도권', 'participated', 3, 6, ARRAY['VIP'], true, 100);