-- 문서 발송용 템플릿들의 카카오 템플릿 코드 설정
-- 먼저 현재 tour_document 템플릿들을 확인
SELECT id, name, type, kakao_template_code, use_case
FROM message_templates
WHERE use_case = 'tour_document';

-- 문서 발송용 템플릿들에 카카오 템플릿 코드 추가
UPDATE message_templates
SET 
  kakao_template_code = CASE
    WHEN name = '종합 여정 안내' THEN 'ebce2a05-21b7-4901-b131-de4752f4ae9b'
    WHEN name = '일정표 안내' THEN 'd5bb3b5-fc54c-4141-b2ba-8e96e9bb4f8c'
    WHEN name = '탑승 안내' THEN 'a3d9fb06-b1a56b7f41c2dbfb.tsll'
    WHEN name = '객실 배정' THEN 'bd3lb696-b1a56b7f41c2dbfb.tsll'
    WHEN name = '티타임표 안내' THEN 'ebslb696-b1a56b7f41c2dbfb.ts11'
    WHEN name = '간편일정 안내' THEN 'd5bb3b5-fc54c-4141-b2ba-8e96e9bb4f8c' -- 일정표와 동일
    WHEN name = '스탭용 일정표' THEN 'b53-8193505914c9abc.is1l'
    WHEN name = '스탭용 탑승안내' THEN '4b53-8193505914c9abc.isll'
    WHEN name = '스탭용 객실배정' THEN '4b53-8193505914c9aVc.isll'
    WHEN name = '스탭용 티타임표' THEN '4b53-8193505914c9abc.is11'
    ELSE kakao_template_code
  END,
  type = 'alimtalk',
  updated_at = NOW()
WHERE use_case = 'tour_document';

-- 만약 tour_document 템플릿이 없다면 새로 추가
INSERT INTO message_templates (
  name, type, kakao_template_code, kakao_template_name, 
  title, content, use_case, is_active
) VALUES 
  (
    '종합 여정 안내',
    'alimtalk',
    'ebce2a05-21b7-4901-b131-de4752f4ae9b',
    '싱싱골프_종합여정안내',
    '[싱싱골프] 종합 여정 안내',
    '#{이름}님, 안녕하세요.\n싱싱골프입니다.\n\n#{투어명} 종합 여정 안내를 보내드립니다.\n\n▶ 여정 확인: #{url}\n\n자세한 일정과 준비사항을 확인해주세요.\n\n감사합니다.',
    'tour_document',
    true
  ),
  (
    '일정표 안내',
    'alimtalk',
    'd5bb3b5-fc54c-4141-b2ba-8e96e9bb4f8c',
    '싱싱골프_일정표안내',
    '[싱싱골프] 일정표 안내',
    '#{이름}님, 안녕하세요.\n싱싱골프입니다.\n\n#{투어명} 일정표를 안내드립니다.\n\n▶ 일정표 확인: #{url}\n\n즐거운 여행 되시길 바랍니다.\n\n감사합니다.',
    'tour_document',
    true
  ),
  (
    '탑승 안내',
    'alimtalk',
    'a3d9fb06-b1a56b7f41c2dbfb.tsll',
    '싱싱골프_탑승안내',
    '[싱싱골프] 탑승 안내',
    '#{이름}님, 안녕하세요.\n싱싱골프입니다.\n\n#{투어명} 탑승 안내를 보내드립니다.\n\n▶ 탑승 정보: #{url}\n\n탑승 장소와 시간을 꼭 확인해주세요.\n\n감사합니다.',
    'tour_document',
    true
  ),
  (
    '객실 배정',
    'alimtalk',
    'bd3lb696-b1a56b7f41c2dbfb.tsll',
    '싱싱골프_객실배정안내',
    '[싱싱골프] 객실 배정 안내',
    '#{이름}님, 안녕하세요.\n싱싱골프입니다.\n\n#{투어명} 객실 배정을 안내드립니다.\n\n▶ 객실 정보: #{url}\n\n룸메이트와 객실 번호를 확인해주세요.\n\n감사합니다.',
    'tour_document',
    true
  ),
  (
    '티타임표 안내',
    'alimtalk',
    'ebslb696-b1a56b7f41c2dbfb.ts11',
    '싱싱골프_티타임표안내',
    '[싱싱골프] 티타임표 안내',
    '#{이름}님, 안녕하세요.\n싱싱골프입니다.\n\n#{투어명} 티타임표를 안내드립니다.\n\n▶ 티타임표 확인: #{url}\n\n조편성과 티타임을 확인해주세요.\n\n감사합니다.',
    'tour_document',
    true
  )
ON CONFLICT (name) 
DO UPDATE SET
  kakao_template_code = EXCLUDED.kakao_template_code,
  kakao_template_name = EXCLUDED.kakao_template_name,
  type = EXCLUDED.type,
  use_case = EXCLUDED.use_case,
  updated_at = NOW();

-- 버튼 정보도 추가 (문서 링크용)
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
AND (buttons IS NULL OR buttons = '[]'::jsonb);

-- 결과 확인
SELECT id, name, type, kakao_template_code, kakao_template_name, use_case, buttons
FROM message_templates
WHERE use_case = 'tour_document'
ORDER BY name;
