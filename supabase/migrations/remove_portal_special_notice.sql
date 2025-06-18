-- 포털 설정에서 특별공지사항 필드 제거
-- 주의: 이 마이그레이션을 실행하기 전에 데이터 백업 권장

-- 1. 기존 특별공지사항을 투어의 special_notices로 이동 (필요시)
UPDATE singsing_tours t
SET special_notices = 
  CASE 
    WHEN t.special_notices IS NULL OR jsonb_array_length(t.special_notices) = 0
    THEN jsonb_build_array(
      jsonb_build_object(
        'id', '999',
        'content', ps.special_notice,
        'priority', 999,
        'type', 'general',
        'created_at', now()::text
      )
    )
    ELSE t.special_notices
  END
FROM portal_settings ps
WHERE ps.special_notice IS NOT NULL 
  AND ps.special_notice != ''
  AND ps.tour_id = t.id;

-- 2. portal_settings 테이블에서 special_notice 컬럼 제거
ALTER TABLE portal_settings 
DROP COLUMN IF EXISTS special_notice;
