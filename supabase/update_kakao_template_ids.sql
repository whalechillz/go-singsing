-- 카카오 알림톡 템플릿 ID 업데이트

-- 1. 계약금 요청 템플릿 ID 업데이트
UPDATE message_templates 
SET kakao_template_code = 'KA01TP25062302252304SmN6trd7FLO'
WHERE name = '계약금 요청';

-- 2. 계약금 확인 템플릿 ID 업데이트  
UPDATE message_templates 
SET kakao_template_code = 'KA01TP25062302703703439tZVT9pcpghg'
WHERE name = '계약금 확인';

-- 3. 잔금 요청 템플릿 ID 업데이트
UPDATE message_templates 
SET kakao_template_code = 'KA01TP25062302060833KLK7e8ic71i'
WHERE name = '잔금 요청';

-- 4. 결제 완료 템플릿 ID 업데이트
UPDATE message_templates 
SET kakao_template_code = 'KA01TP25062302142533ZsJHNMYobYH'
WHERE name = '결제 완료';

-- 확인용 쿼리
SELECT name, kakao_template_code, content 
FROM message_templates 
WHERE name IN ('계약금 요청', '계약금 확인', '잔금 요청', '결제 완료');
