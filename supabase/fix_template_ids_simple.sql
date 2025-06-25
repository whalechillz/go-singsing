-- 카카오 템플릿 ID에서 확장자 제거 (간단한 버전)
UPDATE message_templates
SET kakao_template_code = 
  CASE 
    WHEN name = '스탭용 객실배정' THEN '4b53-8193505914c9aVc'
    WHEN name = '스탭용 탑승안내' THEN '4b53-8193505914c9abc'
    WHEN name = '스탭용 티타임표' THEN '4b53-8193505914c9abc'
    WHEN name = '객실 배정' THEN 'bd31b696-b1a56b7f41c2dbfb'
    WHEN name = '탑승 안내' THEN 'a3d9fb06-b1a56b7f41c2dbfb'
    WHEN name = '종합 여정 안내' THEN 'ebce2a05-21b7-4901-b131-de4752f4ae9b'
    ELSE kakao_template_code
  END,
  updated_at = NOW()
WHERE use_case = 'tour_document';

-- 결과 확인
SELECT name, kakao_template_code, type
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
