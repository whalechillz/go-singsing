-- 카카오 템플릿 ID 형식 수정
-- 잘못된 템플릿 ID 형식을 올바른 형식으로 수정

UPDATE message_templates
SET 
  kakao_template_code = CASE
    WHEN name = '종합 여정 안내' THEN 'ebce2a0521b749018131de4752f4ae9b'
    WHEN name = '일정표 안내' THEN 'd5bb3b5fc54c4141b2ba8e96e9bb4f8c'
    WHEN name = '탑승 안내' THEN 'a3d9fb06b1a56b7f41c2dbfb'
    WHEN name = '객실 배정' THEN 'bd31b696b1a56b7f41c2dbfb'
    WHEN name = '티타임표 안내' THEN 'eb51b696b1a56b7f41c2dbfb'
    WHEN name = '간편일정 안내' THEN 'd5bb3b5fc54c4141b2ba8e96e9bb4f8c'
    WHEN name = '스탭용 일정표' THEN '4b538193505914c9abc'
    WHEN name = '스탭용 탑승안내' THEN '4b538193505914c9abc'
    WHEN name = '스탭용 객실배정' THEN '4b538193505914c9abc'
    WHEN name = '스탭용 티타임표' THEN '4b538193505914c9abc'
    ELSE kakao_template_code
  END,
  updated_at = NOW()
WHERE use_case = 'tour_document';

-- 결과 확인
SELECT id, name, type, kakao_template_code, use_case
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
