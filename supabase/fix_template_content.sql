-- 1. 종합 여정 안내 템플릿의 content 확인
SELECT 
  id,
  name,
  kakao_template_code,
  content,
  buttons,
  variables
FROM message_templates 
WHERE name = '종합 여정 안내';

-- 2. content가 없거나 비어있다면 업데이트
UPDATE message_templates
SET 
  content = '#{이름}님, 안녕하세요.

#{투어명} 투어 안내 페이지입니다.

아래 링크에서 일정표, 탑승안내, 객실배정 등
모든 정보를 확인하실 수 있습니다.

▶ #{url}

문의사항은 언제든지 연락주세요.
감사합니다.',
  buttons = '[{"type":"WL","name":"투어 안내 확인하기","linkMo":"#{url}","linkPc":"#{url}"}]'::jsonb,
  variables = '["이름", "투어명", "url"]'::jsonb
WHERE name = '종합 여정 안내'
  AND (content IS NULL OR content = '');

-- 3. 다른 템플릿들도 추가 (SMS 용)
INSERT INTO message_templates (name, type, use_case, is_active, content, variables) 
SELECT * FROM (VALUES 
  ('일정표 안내', 'sms', 'tour_document', true, '#{이름}님, #{투어명} 일정표입니다.\n\n▶ #{url}\n\n문의사항은 언제든지 연락주세요.', '["이름", "투어명", "url"]'::jsonb),
  ('탑승 안내', 'sms', 'tour_document', true, '#{이름}님, #{투어명} 탑승 안내입니다.\n\n▶ #{url}\n\n안전한 여행 되세요.', '["이름", "투어명", "url"]'::jsonb),
  ('객실 배정', 'sms', 'tour_document', true, '#{이름}님, #{투어명} 객실 배정표입니다.\n\n▶ #{url}\n\n확인 부탁드립니다.', '["이름", "투어명", "url"]'::jsonb)
) AS t(name, type, use_case, is_active, content, variables)
WHERE NOT EXISTS (
  SELECT 1 FROM message_templates WHERE message_templates.name = t.name
);

-- 4. 최종 확인
SELECT 
  name,
  type,
  kakao_template_code,
  use_case,
  is_active,
  LEFT(content, 50) || '...' as content_preview
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true
ORDER BY type, name;