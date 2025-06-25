-- 문서 발송용 템플릿들의 카카오 템플릿 코드 설정
-- 먼저 현재 tour_document 템플릿들을 확인
SELECT id, name, type, kakao_template_code, use_case
FROM message_templates
WHERE use_case = 'tour_document';

-- 문서 발송용 템플릿들에 카카오 템플릿 코드 추가/업데이트
UPDATE message_templates
SET 
  kakao_template_code = CASE
    WHEN name = '종합 여정 안내' THEN 'ebce2a05-21b7-4901-b131-de4752f4ae9b'
    WHEN name = '일정표 안내' THEN 'd5bb3b5-fc54c-4141-b2ba-8e96e9bb4f8c'
    WHEN name = '탑승 안내' THEN 'a3d9fb06-b1a56b7f41c2dbfb.tsll'
    WHEN name = '객실 배정' THEN 'bd3lb696-b1a56b7f41c2dbfb.tsll'
    WHEN name = '티타임표 안내' THEN 'ebslb696-b1a56b7f41c2dbfb.ts11'
    WHEN name = '간편일정 안내' THEN 'd5bb3b5-fc54c-4141-b2ba-8e96e9bb4f8c' -- 일정표와 동일
    WHEN name = '스탭용 일정표' THEN '4b53-8193505914c9abc.is1l'
    WHEN name = '스탭용 탑승안내' THEN '4b53-8193505914c9abc.isll'
    WHEN name = '스탭용 객실배정' THEN '4b53-8193505914c9aVc.isll'
    WHEN name = '스탭용 티타임표' THEN '4b53-8193505914c9abc.is11'
    ELSE kakao_template_code
  END,
  kakao_template_name = CASE
    WHEN name = '종합 여정 안내' THEN '싱싱골프_종합여정안내'
    WHEN name = '일정표 안내' THEN '싱싱골프_일정표안내'
    WHEN name = '탑승 안내' THEN '싱싱골프_탑승안내'
    WHEN name = '객실 배정' THEN '싱싱골프_객실배정안내'
    WHEN name = '티타임표 안내' THEN '싱싱골프_티타임표안내'
    WHEN name = '간편일정 안내' THEN '싱싱골프_일정표안내'
    WHEN name = '스탭용 일정표' THEN '싱싱골프_스탭용일정표'
    WHEN name = '스탭용 탑승안내' THEN '싱싱골프_스탭용탑승안내'
    WHEN name = '스탭용 객실배정' THEN '싱싱골프_스탭용객실배정'
    WHEN name = '스탭용 티타임표' THEN '싱싱골프_스탭용티타임표'
    ELSE kakao_template_name
  END,
  type = 'alimtalk',
  updated_at = NOW()
WHERE use_case = 'tour_document';

-- 버튼 정보도 추가 (문서 링크용) - 기존 버튼이 없는 경우만
UPDATE message_templates
SET buttons = '[
  {
    "ordering": 1,
    "type": "WL",
    "name": "자세히 보기",
    "linkMo": "#{url}",
    "linkPc": "#{url}"
  }
]'::jsonb
WHERE use_case = 'tour_document' 
AND (buttons IS NULL OR buttons = '[]'::jsonb OR buttons = 'null'::jsonb);

-- 결과 확인
SELECT id, name, type, kakao_template_code, kakao_template_name, use_case, 
       buttons->0->>'name' as button_name,
       buttons->0->>'linkMo' as button_link
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
