-- 정확한 카카오 템플릿 ID로 수정
-- paste.txt에서 제공된 올바른 템플릿 ID 사용

UPDATE message_templates
SET 
  kakao_template_code = CASE
    -- 고객용 템플릿 (정확한 ID)
    WHEN name = '종합 여정 안내' THEN 'ebce2a05-21b7-4901-b131-de4752f4ae9b'
    WHEN name = '일정표 안내' THEN 'd5bb3b5-fc54c-4141-b2ba-8e96e9bb4f8c'
    WHEN name = '탑승 안내' THEN 'a3d9fb06-b1a56b7f41c2dbfb'
    WHEN name = '객실 배정' THEN 'bd31b696-b1a56b7f41c2dbfb'
    WHEN name = '티타임표 안내' THEN 'eb51b696-b1a56b7f41c2dbfb'
    WHEN name = '간편일정 안내' THEN 'd5bb3b5-fc54c-4141-b2ba-8e96e9bb4f8c'
    
    -- 스탭용 템플릿 (확장자 제거)
    WHEN name = '스탭용 객실배정' THEN '4b53-8193505914c9aVc'
    WHEN name = '스탭용 티타임표' THEN '4b53-8193505914c9abc'
    WHEN name = '스탭용 탑승안내' THEN '4b53-8193505914c9abc'
    WHEN name = '스탭용 일정표' THEN '4b53-8193505914c9abc'
    
    ELSE kakao_template_code
  END,
  updated_at = NOW()
WHERE use_case = 'tour_document';

-- 결과 확인
SELECT id, name, type, kakao_template_code, kakao_template_name, use_case
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;

-- 혹시 message_templates 테이블에 없는 경우를 대비한 전체 목록 확인
SELECT id, name, type, kakao_template_code, use_case
FROM message_templates
WHERE name IN (
  '종합 여정 안내', '일정표 안내', '탑승 안내', '객실 배정', '티타임표 안내',
  '간편일정 안내', '스탭용 일정표', '스탭용 탑승안내', '스탭용 객실배정', '스탭용 티타임표'
)
ORDER BY name;
