-- 종합 여정 안내 템플릿 content 설정
UPDATE message_templates
SET 
  content = '#{이름}님, 안녕하세요.

#{투어명} 투어 안내 페이지입니다.

아래 링크에서 일정표, 탑승안내, 객실배정 등
모든 정보를 확인하실 수 있습니다.

▶ https://go.singsinggolf.kr/portal/#{url}

문의사항은 언제든지 연락주세요.
감사합니다.',
  buttons = '[{"type":"WL","name":"투어 안내 확인하기","linkMo":"https://go.singsinggolf.kr/portal/#{url}","linkPc":"https://go.singsinggolf.kr/portal/#{url}"}]'::jsonb,
  variables = '["이름", "투어명", "url"]'::jsonb
WHERE kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';

-- 확인
SELECT 
  name,
  content,
  buttons
FROM message_templates 
WHERE kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';