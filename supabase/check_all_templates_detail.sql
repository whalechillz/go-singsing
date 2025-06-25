-- 모든 템플릿 상세 정보 확인
SELECT 
  name,
  type,
  kakao_template_code,
  use_case,
  LEFT(content, 100) as content_preview,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '⚠️ URL 포함'
    ELSE '✓ URL 없음'
  END as has_url,
  CASE 
    WHEN buttons::text != '[]' AND buttons IS NOT NULL THEN '✓ 버튼 있음'
    ELSE '- 버튼 없음'
  END as has_buttons,
  is_active
FROM message_templates 
ORDER BY 
  CASE 
    WHEN use_case = 'tour_document' THEN 1
    WHEN use_case = 'tour_confirmation' THEN 2
    WHEN use_case = 'tour_notification' THEN 3
    ELSE 4
  END,
  name;