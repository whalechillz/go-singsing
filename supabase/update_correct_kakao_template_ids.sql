-- 카카오 알림톡 템플릿 ID 업데이트 (실제 솔라피 템플릿 ID)

-- 1. 견적서 안내 (D-50)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623023703439tZVT9pcpghg'
WHERE name = '견적서 안내';

-- 2. 계약금 요청 (D-50)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623024435009U4GtJeklf33'
WHERE name = '계약금 요청';

-- 3. 계약금 확인 (D-45)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250624040020593XEX8OeP40Xd'
WHERE name = '계약금 확인';

-- 4. 잔금 요청 (D-37)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623024934692DKpubmnVfjq'
WHERE name = '잔금 요청';

-- 5. 결제 완료 (D-30)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623025250514gnihV6I4g4H'
WHERE name = '결제 완료';

-- 6. 투어 확정 (D-30)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250624073836331mMaPQvMYSgY'
WHERE name = '투어 확정';

-- 7. 객실 배정 (D-25)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623022324499c3XI5BM93dg'
WHERE name = '객실 배정';

-- 8. 티타임표 (D-20)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP2506230228022582959FciJHXj'
WHERE name = '티타임표 안내';

-- 9. 탑승 안내 (D-7)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP25062302175823804AxgWsNEoL'
WHERE name = '탑승 안내';

-- 10. 종합여정 안내 (D-3)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i'
WHERE name = '종합 여정 안내';

-- 11. 일정표 안내 (D-DAY)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623021604072hm09slq14aM'
WHERE name = '일정표 안내';

-- 확인용 쿼리
SELECT name, kakao_template_code 
FROM message_templates 
WHERE kakao_template_code IS NOT NULL
ORDER BY name;
