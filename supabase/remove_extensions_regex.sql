-- 카카오 템플릿 ID에서 모든 확장자 제거
UPDATE message_templates
SET 
  kakao_template_code = 
    REGEXP_REPLACE(kakao_template_code, '\.(tsll|ts11|isll|is11|is1l)$', ''),
  updated_at = NOW()
WHERE use_case = 'tour_document'
AND kakao_template_code ~ '\.(tsll|ts11|isll|is11|is1l)$';

-- 결과 확인
SELECT name, kakao_template_code, type
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
