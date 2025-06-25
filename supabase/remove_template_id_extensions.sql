-- 카카오 템플릿 ID에서 확장자 제거 (.tsll, .is11 등)
UPDATE message_templates
SET 
  kakao_template_code = CASE
    -- 확장자가 있는 경우 제거
    WHEN kakao_template_code LIKE '%.tsll' THEN REPLACE(kakao_template_code, '.tsll', '')
    WHEN kakao_template_code LIKE '%.ts11' THEN REPLACE(kakao_template_code, '.ts11', '')
    WHEN kakao_template_code LIKE '%.isll' THEN REPLACE(kakao_template_code, '.isll', '')
    WHEN kakao_template_code LIKE '%.is11' THEN REPLACE(kakao_template_code, '.is11', '')
    WHEN kakao_template_code LIKE '%.is1l' THEN REPLACE(kakao_template_code, '.is1l', '')
    ELSE kakao_template_code
  END,
  updated_at = NOW()
WHERE use_case = 'tour_document'
AND kakao_template_code LIKE '%.%';

-- 결과 확인
SELECT id, name, type, kakao_template_code, use_case
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
