-- 1. 모든 템플릿 중 URL이 포함된 것들 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active,
  type
FROM message_templates 
WHERE content LIKE '%#{url}%'
ORDER BY name;

-- 2. URL이 포함된 활성 템플릿들을 모두 tour_document로 변경
UPDATE message_templates
SET use_case = 'tour_document'
WHERE content LIKE '%#{url}%'
  AND is_active = true
  AND use_case != 'tour_document';

-- 3. 비활성화된 문서 템플릿들 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE content LIKE '%#{url}%'
  AND is_active = false;

-- 4. 주요 문서 템플릿들 활성화
UPDATE message_templates
SET 
  is_active = true,
  use_case = 'tour_document'
WHERE name IN (
  '일정표 안내',
  '탑승 안내',
  '객실 배정',
  '티타임표 안내',
  '간편일정 안내'
)
AND content LIKE '%#{url}%';

-- 5. 최종 결과 확인
SELECT 
  name,
  kakao_template_code,
  type,
  is_active
FROM message_templates 
WHERE use_case = 'tour_document'
ORDER BY name;