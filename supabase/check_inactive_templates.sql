-- 비활성화된 문서 템플릿 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ URL 포함'
    ELSE '✗ URL 없음'
  END as has_url,
  updated_at::date as last_updated
FROM message_templates 
WHERE (
  name IN (
    '종합 여정 안내',
    '일정표 안내',
    '탑승 안내',
    '객실 배정',
    '티타임표 안내',
    '간편일정 안내'
  )
  OR content LIKE '%#{url}%'
)
ORDER BY is_active DESC, name;

-- 필요한 템플릿들 활성화
UPDATE message_templates
SET 
  is_active = true,
  use_case = 'tour_document'
WHERE name IN ('종합 여정 안내', '일정표 안내', '탑승 안내')
  AND content LIKE '%#{url}%';