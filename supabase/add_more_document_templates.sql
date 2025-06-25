-- URL이 포함된 다른 템플릿들 확인
SELECT 
  name,
  type,
  kakao_template_code,
  use_case,
  is_active,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ 문서 발송용'
    ELSE '✗ 단순 알림용'
  END as template_type
FROM message_templates 
WHERE is_active = true
  AND (
    name LIKE '%안내%' 
    OR name LIKE '%일정%'
    OR name LIKE '%탑승%'
    OR name LIKE '%객실%'
    OR name LIKE '%티타임%'
    OR content LIKE '%#{url}%'
  )
ORDER BY 
  CASE WHEN use_case = 'tour_document' THEN 0 ELSE 1 END,
  name;

-- URL이 포함되어 있지만 tour_document가 아닌 템플릿들을 tour_document로 변경
UPDATE message_templates
SET use_case = 'tour_document'
WHERE content LIKE '%#{url}%'
  AND is_active = true
  AND use_case != 'tour_document';

-- 변경 후 최종 확인
SELECT 
  name,
  kakao_template_code,
  type
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY name;