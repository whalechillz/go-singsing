-- 혹시 문제가 계속되면 버튼을 문자열로 저장
UPDATE message_templates
SET 
  buttons = '[{"type":"WL","name":"투어 안내 확인하기","linkMo":"https://go.singsinggolf.kr/s/#{url}","linkPc":"https://go.singsinggolf.kr/s/#{url}"}]'
WHERE kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';

-- 확인
SELECT 
  name,
  kakao_template_code,
  pg_typeof(buttons) as buttons_type,
  buttons,
  buttons::text as buttons_text
FROM message_templates 
WHERE kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';