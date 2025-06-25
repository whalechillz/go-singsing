-- 현재 종합 여정 안내 템플릿 확인
SELECT 
  id,
  name,
  type,
  kakao_template_code,
  kakao_template_name,
  use_case,
  is_active,
  buttons
FROM message_templates 
WHERE name = '종합 여정 안내'
AND use_case = 'tour_document';

-- 모든 투어 문서 관련 템플릿 확인
SELECT 
  name,
  kakao_template_code,
  is_active
FROM message_templates 
WHERE use_case = 'tour_document'
ORDER BY name;