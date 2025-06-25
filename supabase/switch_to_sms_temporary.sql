-- 문서 발송용 템플릿을 SMS 타입으로 변경
-- 카카오 문제가 해결될 때까지 임시 조치

UPDATE message_templates
SET 
  type = 'sms',
  updated_at = NOW()
WHERE use_case = 'tour_document';

-- 결과 확인
SELECT id, name, type, use_case
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;

-- 나중에 다시 카카오톡으로 전환하려면:
-- UPDATE message_templates SET type = 'alimtalk' WHERE use_case = 'tour_document';
