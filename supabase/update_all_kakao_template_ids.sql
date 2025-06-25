-- 카카오 알림톡 템플릿 ID 전체 업데이트 (고객용 + 스탭용)

-- ===== 고객용 템플릿 =====

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

-- ===== 스탭용 템플릿 =====

-- 12. 스탭용 객실배정 (D-3)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623022522304SmN6trd7FLO'
WHERE name = '스탭용 객실배정';

-- 없으면 추가
INSERT INTO message_templates (name, type, title, content, kakao_template_code, is_active, use_case)
SELECT 
    '스탭용 객실배정',
    'kakao_alimtalk',
    '[싱싱골프] #{투어명} 스탭용 객실배정',
    '[싱싱골프] #{투어명} 스탭용 객실배정

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭 객실 정보를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
    'KA01TP250623022522304SmN6trd7FLO',
    true,
    'tour_document'
WHERE NOT EXISTS (
    SELECT 1 FROM message_templates WHERE name = '스탭용 객실배정'
);

-- 13. 스탭용 티타임표 (D-3)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623022959808eMBb4Zp8Yte'
WHERE name = '스탭용 티타임표';

-- 없으면 추가
INSERT INTO message_templates (name, type, title, content, kakao_template_code, is_active, use_case)
SELECT 
    '스탭용 티타임표',
    'kakao_alimtalk',
    '[싱싱골프] #{투어명} 스탭용 티타임표',
    '[싱싱골프] #{투어명} 스탭용 티타임표

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭 티타임을 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
    'KA01TP250623022959808eMBb4Zp8Yte',
    true,
    'tour_document'
WHERE NOT EXISTS (
    SELECT 1 FROM message_templates WHERE name = '스탭용 티타임표'
);

-- 14. 스탭용 탑승안내 (D-3)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623022041726SFyBsfDU6fx'
WHERE name = '스탭용 탑승안내';

-- 없으면 추가
INSERT INTO message_templates (name, type, title, content, kakao_template_code, is_active, use_case)
SELECT 
    '스탭용 탑승안내',
    'kakao_alimtalk',
    '[싱싱골프] #{투어명} 스탭용 탑승안내',
    '[싱싱골프] #{투어명} 스탭용 탑승안내

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭 탑승 정보를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
    'KA01TP250623022041726SFyBsfDU6fx',
    true,
    'tour_document'
WHERE NOT EXISTS (
    SELECT 1 FROM message_templates WHERE name = '스탭용 탑승안내'
);

-- 15. 스탭용 일정표 안내 (D-3, D-DAY 공통)
UPDATE message_templates 
SET kakao_template_code = 'KA01TP250623021425335ZsJHNMYobYH'
WHERE name IN ('스탭용 일정표', '스탭용 일정표 안내');

-- 없으면 추가
INSERT INTO message_templates (name, type, title, content, kakao_template_code, is_active, use_case)
SELECT 
    '스탭용 일정표',
    'kakao_alimtalk',
    '[싱싱골프] #{투어명} 스탭용 일정표',
    '[싱싱골프] #{투어명} 스탭용 일정표

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭용 일정표를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
    'KA01TP250623021425335ZsJHNMYobYH',
    true,
    'tour_document'
WHERE NOT EXISTS (
    SELECT 1 FROM message_templates WHERE name IN ('스탭용 일정표', '스탭용 일정표 안내')
);

-- ===== 확인용 쿼리 =====
SELECT 
    name, 
    kakao_template_code,
    CASE 
        WHEN name LIKE '스탭용%' THEN '스탭용'
        ELSE '고객용'
    END as template_type
FROM message_templates 
WHERE kakao_template_code IS NOT NULL
ORDER BY 
    CASE 
        WHEN name LIKE '스탭용%' THEN 2
        ELSE 1
    END,
    name;
