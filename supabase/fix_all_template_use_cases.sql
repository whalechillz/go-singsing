-- ============================================
-- 템플릿 용도 정리 및 수정
-- ============================================

-- 1. 현재 상태 백업
CREATE TEMP TABLE temp_template_backup AS 
SELECT * FROM message_templates;

-- 2. 모든 템플릿 현황 확인
SELECT 
  name,
  kakao_template_code,
  use_case,
  CASE 
    WHEN content LIKE '%#{url}%' THEN '문서 링크 포함'
    ELSE '단순 알림'
  END as template_type,
  is_active
FROM message_templates 
ORDER BY use_case, name;

-- 3. 투어 확정 템플릿을 알림용으로 변경
UPDATE message_templates
SET 
  use_case = 'tour_notification',  -- 또는 'tour_confirmation'
  updated_at = NOW()
WHERE (name = '투어 확정' 
   OR kakao_template_code = 'KA01TP250624073836331mMaPQvMYSgY')
  AND use_case = 'tour_document';  -- 현재 잘못 설정된 경우만

-- 4. 종합 여정 안내 템플릿 확인 (문서 발송용)
UPDATE message_templates
SET 
  kakao_template_code = 'KA01TP250623020608338KLK7e8Ic71i',
  kakao_template_name = '종합 여정 안내',
  use_case = 'tour_document',
  updated_at = NOW()
WHERE name = '종합 여정 안내';

-- 5. 다른 잘못 설정된 템플릿들 확인
-- 문서 링크가 없는데 tour_document로 설정된 템플릿들
UPDATE message_templates
SET 
  use_case = 'tour_notification',
  updated_at = NOW()
WHERE use_case = 'tour_document'
  AND content NOT LIKE '%#{url}%'
  AND name != '종합 여정 안내';

-- 6. 최종 결과 확인
SELECT 
  '문서 발송용 템플릿' as category,
  name,
  kakao_template_code,
  use_case
FROM message_templates 
WHERE use_case = 'tour_document'
  AND is_active = true

UNION ALL

SELECT 
  '알림용 템플릿' as category,
  name,
  kakao_template_code,
  use_case
FROM message_templates 
WHERE use_case IN ('tour_notification', 'tour_confirmation', 'general')
  AND is_active = true
ORDER BY category, name;

-- 7. 변경 사항 요약
SELECT 
  'Before' as status,
  use_case,
  COUNT(*) as count
FROM temp_template_backup
GROUP BY use_case

UNION ALL

SELECT 
  'After' as status,
  use_case,
  COUNT(*) as count
FROM message_templates
GROUP BY use_case
ORDER BY status, use_case;