-- URL이 포함된 모든 템플릿을 tour_document로 복구
UPDATE message_templates
SET use_case = 'tour_document'
WHERE content LIKE '%#{url}%'
  AND is_active = true
  AND use_case != 'tour_document';

-- 결과 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  type
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY name;