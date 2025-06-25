-- 기본 문서 템플릿들 생성 (없는 경우를 대비)
-- 먼저 기존 템플릿 확인
SELECT name FROM message_templates WHERE name IN ('일정표 안내', '탑승 안내', '객실 배정', '티타임표 안내');

-- 없는 템플릿만 생성
INSERT INTO message_templates (name, type, use_case, is_active, content) 
SELECT * FROM (VALUES 
  ('일정표 안내', 'sms', 'tour_document', true, '#{이름}님, #{투어명} 일정표입니다.\n#{url}'),
  ('탑승 안내', 'sms', 'tour_document', true, '#{이름}님, #{투어명} 탑승 안내입니다.\n#{url}'),
  ('객실 배정', 'sms', 'tour_document', true, '#{이름}님, #{투어명} 객실 배정표입니다.\n#{url}'),
  ('티타임표 안내', 'sms', 'tour_document', true, '#{이름}님, #{투어명} 티타임표입니다.\n#{url}')
) AS t(name, type, use_case, is_active, content)
WHERE NOT EXISTS (
  SELECT 1 FROM message_templates WHERE message_templates.name = t.name
);

-- 기존 템플릿 업데이트
UPDATE message_templates 
SET 
  use_case = 'tour_document',
  is_active = true
WHERE name IN ('일정표 안내', '탑승 안내', '객실 배정', '티타임표 안내')
  AND content LIKE '%#{url}%';

-- 결과 확인
SELECT name, type, kakao_template_code 
FROM message_templates 
WHERE use_case = 'tour_document' 
  AND is_active = true
ORDER BY name;