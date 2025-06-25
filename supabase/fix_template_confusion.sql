-- 1. 현재 상태 확인
SELECT 
  id,
  name,
  kakao_template_code,
  use_case,
  content
FROM message_templates 
WHERE use_case IN ('tour_document', 'tour_confirmation')
ORDER BY name;

-- 2. 종합 여정 안내 템플릿 ID 수정 (문서 발송용)
UPDATE message_templates
SET 
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i',
  kakao_template_name = '종합 여정 안내'
WHERE name = '종합 여정 안내'
AND use_case = 'tour_document';

-- 3. 투어 확정 템플릿이 따로 있는지 확인
SELECT * FROM message_templates 
WHERE name LIKE '%투어%확정%' 
   OR kakao_template_code = 'KA01TP250624073836331mMaPQvMYSgY';

-- 4. 만약 투어 확정 템플릿이 없다면 생성
INSERT INTO message_templates (
  name,
  type,
  kakao_template_code,
  kakao_template_name,
  title,
  content,
  use_case,
  is_active,
  buttons
) VALUES (
  '투어 확정',
  'alimtalk',
  'KA01TP250624073836331mMaPQvMYSgY',
  '투어 확정',
  '[싱싱골프] 투어 확정 안내',
  '#{이름}님, #{투어명} 투어가 확정되었습니다.\n\n투어 일정: #{투어일정}\n\n자세한 내용은 추후 안내드리겠습니다.\n\n감사합니다.',
  'tour_confirmation',
  true,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 5. 최종 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active
FROM message_templates 
WHERE use_case IN ('tour_document', 'tour_confirmation')
ORDER BY use_case, name;