-- 모든 템플릿 확인 (URL 포함 여부와 함께)
SELECT 
  name,
  type,
  kakao_template_code,
  use_case,
  is_active,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ URL 포함 (문서 발송용)'
    ELSE '✗ URL 없음 (단순 알림)'
  END as template_type
FROM message_templates 
WHERE is_active = true
ORDER BY 
  CASE 
    WHEN content LIKE '%#{url}%' THEN 0
    ELSE 1
  END,
  name;