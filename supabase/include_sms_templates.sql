-- 1. SMS 템플릿 중 URL이 포함된 것들도 확인
SELECT 
  name,
  type,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE content LIKE '%#{url}%'
  AND type = 'sms'
ORDER BY name;

-- 2. SMS 문서 템플릿들도 tour_document로 변경
UPDATE message_templates
SET 
  use_case = 'tour_document',
  is_active = true
WHERE content LIKE '%#{url}%'
  AND type = 'sms'
  AND name LIKE '%안내%';

-- 3. 전체 tour_document 템플릿 확인
SELECT 
  name,
  type,
  kakao_template_code,
  CASE 
    WHEN type = 'alimtalk' THEN '카카오알림톡'
    WHEN type = 'sms' THEN 'SMS'
    ELSE type
  END as send_type
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY type, name;