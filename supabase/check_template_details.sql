-- 종합 여정 안내 템플릿 상세 확인
SELECT 
  id,
  name,
  type,
  kakao_template_code,
  content,
  buttons,
  variables,
  use_case,
  is_active
FROM message_templates 
WHERE kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';

-- content와 buttons가 NULL인지 확인
SELECT 
  name,
  kakao_template_code,
  CASE 
    WHEN content IS NULL THEN 'NULL'
    WHEN content = '' THEN 'EMPTY'
    ELSE 'OK'
  END as content_status,
  CASE 
    WHEN buttons IS NULL THEN 'NULL'
    WHEN buttons::text = '[]' THEN 'EMPTY_ARRAY'
    ELSE 'OK'
  END as buttons_status,
  LENGTH(content) as content_length
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true;