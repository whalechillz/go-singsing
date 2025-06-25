-- 솔라피에서 확인한 정확한 카카오 템플릿 ID로 업데이트
UPDATE message_templates
SET 
  kakao_template_code = CASE
    -- 고객용 템플릿
    WHEN name = '견적서 안내' THEN 'KA01TP250623023703439tZVT9pcpghg'
    WHEN name = '계약금 요청' THEN 'KA01TP250623024435009U4GtJeklf33'
    WHEN name = '계약금 확인' THEN 'KA01TP250624040020593XEX8OeP40Xd'
    WHEN name = '잔금 요청' THEN 'KA01TP250623024934692DKpubmnVfjq'
    WHEN name = '결제 완료' THEN 'KA01TP250623025250514gnihV6I4g4H'
    WHEN name = '투어 확정' THEN 'KA01TP250624073836331mMaPQvMYSgY'
    WHEN name = '객실 배정' THEN 'KA01TP250623022324499c3XI5BM93dg'
    WHEN name = '티타임표 안내' THEN 'KA01TP2506230228022582959FciJHXj'
    WHEN name = '탑승 안내' THEN 'KA01TP25062302175823804AxgWsNEoL'
    WHEN name = '종합 여정 안내' THEN 'KA01TP250623020608338KLK7e8Ic71i'
    WHEN name = '일정표 안내' THEN 'KA01TP250623021604072hm09slq14aM'
    WHEN name = '간편일정 안내' THEN 'KA01TP250623021604072hm09slq14aM' -- 일정표와 동일
    ELSE kakao_template_code
  END,
  type = 'alimtalk',
  updated_at = NOW()
WHERE (
  use_case IN ('payment', 'tour_confirmation', 'tour_document')
  OR name IN ('견적서 안내', '계약금 요청', '계약금 확인', '잔금 요청', '결제 완료', 
              '투어 확정', '객실 배정', '티타임표 안내', '탑승 안내', 
              '종합 여정 안내', '일정표 안내', '간편일정 안내')
);

-- 결과 확인
SELECT name, kakao_template_code, kakao_template_name, type, use_case
FROM message_templates
WHERE kakao_template_code LIKE 'KA01TP%'
   OR use_case IN ('payment', 'tour_confirmation', 'tour_document')
ORDER BY 
  CASE 
    WHEN use_case = 'payment' THEN 1
    WHEN use_case = 'tour_confirmation' THEN 2
    WHEN use_case = 'tour_document' THEN 3
    ELSE 4
  END,
  name;
