-- 투어 확정 알림을 위한 별도 템플릿 생성 (없는 경우)
INSERT INTO message_templates (
  name,
  type,
  kakao_template_code,
  kakao_template_name,
  title,
  content,
  use_case,
  is_active,
  buttons,
  variables
) VALUES (
  '투어 확정 알림',
  'alimtalk',
  'KA01TP250624073836331mMaPQvMYSgY',
  '투어 확정',
  '[싱싱골프] 투어 확정 안내',
  '#{이름}님, 안녕하세요.

신청하신 #{투어명} 투어가 확정되었습니다.

📅 일정: #{투어일정}
👥 확정 인원: #{확정인원}명

자세한 일정 및 안내사항은 추후 문자로 발송드리겠습니다.

감사합니다.
싱싱골프 드림',
  'tour_notification',
  true,
  '[]'::jsonb,
  '["이름", "투어명", "투어일정", "확정인원"]'::jsonb
) ON CONFLICT (kakao_template_code) 
DO UPDATE SET 
  use_case = 'tour_notification',
  name = '투어 확정 알림';

-- 기존 잘못된 템플릿 정리
UPDATE message_templates
SET is_active = false
WHERE name = '투어 확정'
  AND use_case = 'tour_document';