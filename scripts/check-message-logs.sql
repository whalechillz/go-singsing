-- 발송 실패한 메시지 로그 확인
SELECT 
  ml.id,
  ml.created_at,
  ml.phone_number,
  ml.message_type,
  ml.status,
  ml.cost,
  c.name as customer_name
FROM message_logs ml
LEFT JOIN customers c ON ml.customer_id = c.id
WHERE ml.status = 'failed' 
   OR ml.status = 'pending'
ORDER BY ml.created_at DESC;

-- 오늘 발송된 메시지 통계
SELECT 
  message_type,
  status,
  COUNT(*) as count,
  SUM(cost) as total_cost
FROM message_logs
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY message_type, status
ORDER BY message_type, status;

-- MMS 발송 실패 상세 내역
SELECT 
  id,
  created_at,
  phone_number,
  title,
  SUBSTRING(content, 1, 50) as content_preview,
  status
FROM message_logs
WHERE message_type = 'mms' 
  AND status != 'sent'
ORDER BY created_at DESC
LIMIT 20;

-- 실패한 로그 정리 (선택적)
-- 주의: 실행 전 반드시 백업하세요!
-- DELETE FROM message_logs 
-- WHERE status = 'failed' 
--   AND created_at < NOW() - INTERVAL '7 days';
