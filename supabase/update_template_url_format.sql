-- 종합 여정 안내 템플릿의 content를 portal 형식으로 수정
UPDATE message_templates
SET 
  content = '#{이름}님, 안녕하세요.

#{투어명} 투어 안내 페이지입니다.

아래 링크에서 일정표, 탑승안내, 객실배정 등
모든 정보를 확인하실 수 있습니다.

▶ https://go.singsinggolf.kr/portal/#{url}

문의사항은 언제든지 연락주세요.
감사합니다.'
WHERE name = '종합 여정 안내';

-- 결과 확인
SELECT 
  name,
  kakao_template_code,
  content,
  buttons
FROM message_templates 
WHERE name = '종합 여정 안내';