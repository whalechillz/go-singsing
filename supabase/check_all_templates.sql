-- 모든 메시지 템플릿 확인
SELECT 
  id,
  name,
  type,
  kakao_template_code,
  kakao_template_name,
  use_case,
  is_active,
  content
FROM message_templates 
ORDER BY use_case, name;

-- 특히 tour_document와 tour_confirmation 템플릿들
SELECT 
  name,
  kakao_template_code,
  use_case,
  content
FROM message_templates 
WHERE use_case IN ('tour_document', 'tour_confirmation')
ORDER BY name;