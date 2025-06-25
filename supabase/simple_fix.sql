-- 1. 종합 여정 안내가 있는지 확인
SELECT * FROM message_templates WHERE name = '종합 여정 안내';

-- 2. 있으면 업데이트
UPDATE message_templates
SET 
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i',
  use_case = 'tour_document',
  is_active = true
WHERE name = '종합 여정 안내';

-- 3. 없으면 수동으로 생성 (위 UPDATE가 0 rows affected일 경우)
-- INSERT INTO message_templates (name, type, kakao_template_code, use_case, is_active)
-- VALUES ('종합 여정 안내', 'alimtalk', 'KA01TP250623020608338KLK7e8Ic71i', 'tour_document', true);

-- 4. 결과 확인
SELECT name, kakao_template_code, use_case 
FROM message_templates 
WHERE use_case = 'tour_document';