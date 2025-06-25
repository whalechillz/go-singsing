-- 1. 카카오 템플릿 코드가 있는 모든 템플릿 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active,
  type,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ 문서링크'
    ELSE '✗ 단순알림'
  END as has_url
FROM message_templates 
WHERE kakao_template_code IS NOT NULL 
  AND kakao_template_code != ''
  AND type = 'alimtalk'
ORDER BY name;

-- 2. 문서 발송용으로 사용 가능한 템플릿들 (카카오 코드 있고 URL 포함)
UPDATE message_templates
SET 
  use_case = 'tour_document',
  is_active = true
WHERE kakao_template_code IS NOT NULL 
  AND kakao_template_code != ''
  AND content LIKE '%#{url}%'
  AND type = 'alimtalk';

-- 3. 결과 확인
SELECT 
  name,
  kakao_template_code,
  type
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY name;