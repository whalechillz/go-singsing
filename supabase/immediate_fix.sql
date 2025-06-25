-- 종합 여정 안내 템플릿 복구 또는 생성
DO $$
BEGIN
  -- 기존 템플릿이 있으면 업데이트
  IF EXISTS (
    SELECT 1 FROM message_templates 
    WHERE name = '종합 여정 안내' 
       OR kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i'
  ) THEN
    UPDATE message_templates
    SET 
      name = '종합 여정 안내',
      kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i',
      use_case = 'tour_document',
      is_active = true,
      type = 'alimtalk'
    WHERE name = '종합 여정 안내' 
       OR kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';
  ELSE
    -- 없으면 생성
    INSERT INTO message_templates (
      name,
      type,
      kakao_template_code,
      kakao_template_name,
      use_case,
      is_active
    ) VALUES (
      '종합 여정 안내',
      'alimtalk',
      'KA01TP250623020608338KLK7e8Ic71i',
      '종합 여정 안내',
      'tour_document',
      true
    );
  END IF;
END $$;

-- 결과 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE use_case = 'tour_document'
   AND is_active = true;