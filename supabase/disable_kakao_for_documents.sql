-- 문서 발송용 템플릿을 일시적으로 SMS 타입으로 변경
-- 카카오 템플릿 문제가 해결될 때까지 SMS로만 발송

UPDATE message_templates
SET 
  type = 'sms',
  updated_at = NOW()
WHERE use_case = 'tour_document';

-- 결과 확인
SELECT id, name, type, kakao_template_code, use_case
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
