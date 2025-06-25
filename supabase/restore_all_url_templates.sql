-- 1. 현재 활성화된 모든 템플릿 확인
SELECT 
  name,
  type,
  kakao_template_code,
  use_case,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ URL 포함 → tour_document'
    ELSE '✗ URL 없음'
  END as should_be_document
FROM message_templates 
WHERE is_active = true
ORDER BY 
  CASE WHEN content LIKE '%#{url}%' THEN 0 ELSE 1 END,
  name;

-- 2. URL이 포함된 템플릿들을 tour_document로 변경
UPDATE message_templates
SET use_case = 'tour_document'
WHERE content LIKE '%#{url}%'
  AND is_active = true
  AND use_case != 'tour_document';

-- 3. 변경 후 tour_document 템플릿 확인
SELECT 
  name,
  kakao_template_code,
  type
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY name;