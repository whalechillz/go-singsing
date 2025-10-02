-- 중복된 편지 발송 이력 정리
-- 같은 담당자, 같은 날짜, 같은 발송 사유에 대해 최신 상태만 유지

-- 1. 먼저 중복 데이터 확인
SELECT 
  golf_course_contact_id,
  occasion,
  sent_date,
  status,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at DESC) as ids
FROM letter_sending_history 
GROUP BY golf_course_contact_id, occasion, sent_date, status
HAVING COUNT(*) > 1
ORDER BY golf_course_contact_id, occasion, sent_date, status;

-- 2. 중복 제거: 같은 담당자, 같은 날짜, 같은 발송 사유에 대해 최신 것만 유지
WITH duplicates AS (
  SELECT 
    id,
    golf_course_contact_id,
    occasion,
    sent_date,
    ROW_NUMBER() OVER (
      PARTITION BY golf_course_contact_id, occasion, sent_date 
      ORDER BY created_at DESC
    ) as rn
  FROM letter_sending_history
)
DELETE FROM letter_sending_history 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. 정리 후 결과 확인
SELECT 
  golf_course_contact_id,
  occasion,
  sent_date,
  status,
  COUNT(*) as count
FROM letter_sending_history 
GROUP BY golf_course_contact_id, occasion, sent_date, status
ORDER BY golf_course_contact_id, occasion, sent_date, status;
