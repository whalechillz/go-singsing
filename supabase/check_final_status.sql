-- tour_document에 남은 템플릿 확인
SELECT 
  name,
  kakao_template_code,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ URL 포함'
    ELSE '✗ URL 없음'
  END as has_url
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true;

-- 종합 여정 안내 템플릿 상태 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE name = '종합 여정 안내';

-- 투어 확정 템플릿 상태 확인  
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE name LIKE '%투어%확정%';