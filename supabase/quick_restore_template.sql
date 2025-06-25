-- 1. 종합 여정 안내 템플릿 즉시 생성
INSERT INTO message_templates (
  name,
  type,
  kakao_template_code,
  use_case,
  is_active
) VALUES (
  '종합 여정 안내',
  'alimtalk',
  'KA01TP250623020608338KLK7e8Ic71i',
  'tour_document',
  true
) ON CONFLICT (kakao_template_code) 
DO UPDATE SET 
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i',
  use_case = 'tour_document',
  is_active = true;

-- 2. 확인
SELECT name, kakao_template_code, use_case, is_active 
FROM message_templates 
WHERE use_case = 'tour_document';