-- 1. 현재 모든 템플릿 상태 확인
SELECT 
  id,
  name,
  kakao_template_code,
  use_case,
  content,
  buttons
FROM message_templates 
ORDER BY use_case, name;

-- 2. '투어 확정' 템플릿의 use_case 확인
SELECT 
  id,
  name,
  kakao_template_code,
  use_case,
  content
FROM message_templates 
WHERE name LIKE '%투어%확정%' 
   OR name LIKE '%확정%'
   OR kakao_template_code = 'KA01TP250624073836331mMaPQvMYSgY';

-- 3. 투어 확정 템플릿의 use_case를 tour_confirmation으로 변경
UPDATE message_templates
SET 
  use_case = 'tour_confirmation'
WHERE name = '투어 확정'
   OR kakao_template_code = 'KA01TP250624073836331mMaPQvMYSgY';

-- 4. 종합 여정 안내 템플릿 ID 재확인 및 수정
UPDATE message_templates
SET 
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i',
  kakao_template_name = '종합 여정 안내'
WHERE name = '종합 여정 안내'
  AND use_case = 'tour_document';

-- 5. 문서 발송용 템플릿만 확인 (DocumentSendModal에서 표시될 템플릿들)
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY name;

-- 6. 알림용 템플릿 확인 (투어 확정 등)
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE use_case IN ('tour_confirmation', 'tour_notification', 'general')
  AND is_active = true
ORDER BY name;