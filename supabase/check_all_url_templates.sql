-- 전체 템플릿 현황 파악
SELECT 
  use_case,
  COUNT(*) as total,
  SUM(CASE WHEN content LIKE '%#{url}%' THEN 1 ELSE 0 END) as with_url,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active
FROM message_templates 
GROUP BY use_case
ORDER BY use_case;

-- URL이 포함된 모든 템플릿 상세 정보
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active,
  LEFT(content, 50) || '...' as content_preview
FROM message_templates 
WHERE content LIKE '%#{url}%'
ORDER BY is_active DESC, use_case, name;