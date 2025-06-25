-- 1. 현재 데이터베이스의 모든 템플릿 확인 (비활성 포함)
SELECT 
  name,
  type,
  use_case,
  is_active,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ URL 포함 → 문서 발송용'
    ELSE '✗ URL 없음 → 단순 알림용'
  END as template_purpose
FROM message_templates 
ORDER BY 
  CASE WHEN content LIKE '%#{url}%' THEN 0 ELSE 1 END,
  is_active DESC,
  name;

-- 2. URL이 포함된 모든 템플릿을 tour_document로 변경하고 활성화
UPDATE message_templates
SET 
  use_case = 'tour_document',
  is_active = true
WHERE content LIKE '%#{url}%';

-- 3. 최종 결과 - 사용 가능한 문서 템플릿들
SELECT 
  name,
  type,
  kakao_template_code
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY name;