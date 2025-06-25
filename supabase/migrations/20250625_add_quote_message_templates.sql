-- 견적서용 메시지 템플릿 추가
INSERT INTO message_templates (
  name,
  type,
  title,
  content,
  variables,
  use_case,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  '견적서 발송',
  'sms',
  '[싱싱골프] 견적서',
  '#{이름}님, 요청하신 견적서입니다.\n\n#{견적서명}\n\n▶ #{url}\n\n유효기간: #{만료일}\n문의: 031-215-3990',
  '{"이름": "string", "견적서명": "string", "url": "string", "만료일": "string"}',
  'quote',
  true,
  NOW(),
  NOW()
),
(
  '견적서 알림톡',
  'alimtalk',
  '[싱싱골프] 견적서 안내',
  '#{이름}님, 안녕하세요.\n싱싱골프입니다.\n\n요청하신 #{견적서명} 안내드립니다.\n\n▶ 견적 상세보기\n#{url}\n\n■ 유효기간: #{만료일}\n■ 문의전화: 031-215-3990\n\n견적서는 유효기간 내에만 확인 가능합니다.\n감사합니다.',
  '{"이름": "string", "견적서명": "string", "url": "string", "만료일": "string"}',
  'quote',
  true,
  NOW(),
  NOW()
);

-- 견적서용 카카오 알림톡 템플릿 정보 추가 (실제 카카오 비즈니스에서 승인받은 후 업데이트 필요)
UPDATE message_templates 
SET 
  kakao_template_code = NULL,  -- 카카오에서 승인받은 템플릿 코드 입력
  kakao_template_name = '견적서 안내',
  buttons = '[{"name": "견적서 확인하기", "type": "WL", "linkMo": "#{url}", "linkPc": "#{url}"}]'::jsonb
WHERE name = '견적서 알림톡' AND use_case = 'quote';
