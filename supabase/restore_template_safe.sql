-- 1. 종합 여정 안내 템플릿 확인
SELECT id, name, kakao_template_code, use_case, is_active
FROM message_templates 
WHERE name = '종합 여정 안내' 
   OR kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';

-- 2. 만약 있다면 업데이트
UPDATE message_templates
SET 
  name = '종합 여정 안내',
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i',
  use_case = 'tour_document',
  is_active = true,
  type = 'alimtalk',
  content = '#{이름}님, 안녕하세요.

#{투어명} 투어 안내 페이지입니다.

아래 링크에서 일정표, 탑승안내, 객실배정 등
모든 정보를 확인하실 수 있습니다.

▶ #{url}

문의사항은 언제든지 연락주세요.
감사합니다.',
  buttons = '[{"type":"WL","name":"투어 안내 확인하기","linkMo":"#{url}","linkPc":"#{url}"}]'::jsonb
WHERE name = '종합 여정 안내' 
   OR kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i';

-- 3. 업데이트가 안되었다면 (템플릿이 없었다면) 생성
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
) 
SELECT 
  '종합 여정 안내',
  'alimtalk',
  'KA01TP250623020608338KLK7e8Ic71i',
  '종합 여정 안내',
  '[싱싱골프] 투어 안내',
  '#{이름}님, 안녕하세요.

#{투어명} 투어 안내 페이지입니다.

아래 링크에서 일정표, 탑승안내, 객실배정 등
모든 정보를 확인하실 수 있습니다.

▶ #{url}

문의사항은 언제든지 연락주세요.
감사합니다.',
  'tour_document',
  true,
  '[{"type":"WL","name":"투어 안내 확인하기","linkMo":"#{url}","linkPc":"#{url}"}]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM message_templates 
  WHERE name = '종합 여정 안내' 
     OR kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i'
);

-- 4. 최종 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  is_active,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '✓ URL 포함'
    ELSE '✗ URL 없음'
  END as has_url
FROM message_templates 
WHERE use_case = 'tour_document'
   AND is_active = true;