-- 종합 여정 안내 템플릿 ID 수정
UPDATE message_templates
SET 
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i'
WHERE name = '종합 여정 안내'
AND use_case = 'tour_document';

-- 확인
SELECT name, kakao_template_code 
FROM message_templates 
WHERE name = '종합 여정 안내';
