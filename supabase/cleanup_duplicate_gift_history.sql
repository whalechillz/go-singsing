-- 중복된 선물 발송 이력 정리
-- 같은 골프장, 같은 담당자, 같은 발송일, 같은 사유에 대해 최신 것만 유지

WITH duplicates AS (
  SELECT 
    id,
    golf_course_contact_id,
    occasion,
    sent_date,
    gift_type,
    gift_amount,
    quantity,
    ROW_NUMBER() OVER (
      PARTITION BY golf_course_contact_id, occasion, sent_date, gift_type, gift_amount, quantity
      ORDER BY created_at DESC
    ) as rn
  FROM gift_sending_history
)
DELETE FROM gift_sending_history 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 정리 결과 확인
SELECT 
  gc.golf_course_name,
  gc.contact_name,
  gsh.occasion,
  gsh.gift_type,
  gsh.gift_amount,
  gsh.quantity,
  gsh.sent_date,
  COUNT(*) as count
FROM gift_sending_history gsh
JOIN golf_course_contacts gc ON gsh.golf_course_contact_id = gc.id
GROUP BY gc.golf_course_name, gc.contact_name, gsh.occasion, gsh.gift_type, gsh.gift_amount, gsh.quantity, gsh.sent_date
HAVING COUNT(*) > 1
ORDER BY count DESC;
