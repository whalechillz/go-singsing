-- 투어 확정 템플릿만 수정
UPDATE message_templates
SET 
  use_case = 'tour_notification'
WHERE name = '투어 확정' 
   OR kakao_template_code = 'KA01TP250624073836331mMaPQvMYSgY';

-- 종합 여정 안내 템플릿 ID 확인
UPDATE message_templates
SET 
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i'
WHERE name = '종합 여정 안내'
  AND use_case = 'tour_document';

-- 결과 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE name IN ('투어 확정', '종합 여정 안내');