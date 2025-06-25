-- 비활성 템플릿 포함 전체 확인
SELECT 
  name,
  type,
  kakao_template_code,
  use_case,
  is_active,
  CASE 
    WHEN content LIKE '%#{url}%' THEN 'URL 포함'
    ELSE 'URL 없음'
  END as has_url,
  created_at::date as created,
  updated_at::date as updated
FROM message_templates 
WHERE name IN (
  '종합 여정 안내',
  '일정표 안내',
  '탑승 안내',
  '객실 배정',
  '티타임표 안내',
  '간편일정 안내',
  '스탭용 일정표',
  '스탭용 탑승안내',
  '스탭용 객실배정',
  '스탭용 티타임표'
)
ORDER BY is_active DESC, name;