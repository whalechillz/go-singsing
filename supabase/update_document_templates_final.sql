-- 문서 발송용 템플릿만 정확한 ID로 업데이트
UPDATE message_templates
SET 
  kakao_template_code = CASE
    WHEN name = '객실 배정' THEN 'KA01TP250623022324499c3XI5BM93dg'
    WHEN name = '티타임표 안내' THEN 'KA01TP2506230228022582959FciJHXj'
    WHEN name = '탑승 안내' THEN 'KA01TP25062302175823804AxgWsNEoL'
    WHEN name = '종합 여정 안내' THEN 'KA01TP250623020608338KLK7e8Ic71i'
    WHEN name = '일정표 안내' THEN 'KA01TP250623021604072hm09slq14aM'
    WHEN name = '간편일정 안내' THEN 'KA01TP250623021604072hm09slq14aM'
    ELSE kakao_template_code
  END,
  type = 'alimtalk',
  updated_at = NOW()
WHERE use_case = 'tour_document'
AND name NOT LIKE '스탭용%';

-- 스탭용 템플릿은 일단 SMS로 설정
UPDATE message_templates
SET 
  type = 'sms',
  updated_at = NOW()
WHERE use_case = 'tour_document'
AND name LIKE '스탭용%';

-- 결과 확인
SELECT name, kakao_template_code, type, use_case
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
