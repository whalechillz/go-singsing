-- 1. 종합 여정 안내 템플릿 복구/생성
INSERT INTO message_templates (
  name,
  type,
  kakao_template_code,
  kakao_template_name,
  title,
  content,
  use_case,
  is_active,
  buttons
) VALUES (
  '종합 여정 안내',
  'alimtalk',
  'KA01TP250623020608338KLK7e8Ic71i',
  '종합 여정 안내',
  '[싱싱골프] 투어 안내',
  '#{이름}님, 안녕하세요.

#{투어명} 투어 안내 페이지입니다.

아래 링크에서 일정표, 탑승안내, 객실배정 등
모든 정보를 확인하실 수 있습니다.

▶ #{url}

문의사항은 언제든지 연락주세요.
감사합니다.',
  'tour_document',
  true,
  '[{"type":"WL","name":"투어 안내 확인하기","linkMo":"#{url}","linkPc":"#{url}"}]'::jsonb
) ON CONFLICT (kakao_template_code) 
DO UPDATE SET 
  name = '종합 여정 안내',
  use_case = 'tour_document',
  is_active = true;

-- 2. 다른 문서 발송용 템플릿들도 확인
UPDATE message_templates
SET use_case = 'tour_document'
WHERE name IN (
  '일정표 안내',
  '탑승 안내', 
  '객실 배정',
  '티타임표 안내',
  '간편일정 안내'
)
AND content LIKE '%#{url}%';

-- 3. 결과 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ URL 포함'
    ELSE '✗ URL 없음'
  END as has_url
FROM message_templates 
WHERE use_case = 'tour_document'
   OR name = '종합 여정 안내'
ORDER BY name;

-- 4. 전체 템플릿 현황
SELECT 
  use_case,
  COUNT(*) as count
FROM message_templates
WHERE is_active = true
GROUP BY use_case
ORDER BY use_case;