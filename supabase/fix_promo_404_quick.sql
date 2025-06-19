-- 투어 홍보 페이지 404 에러 긴급 수정 SQL
-- 실행일: 2025-06-19

-- 1. 테이블 존재 여부 확인
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tour_promotion_pages'
    ) THEN
        RAISE NOTICE '❌ tour_promotion_pages 테이블이 없습니다. 마이그레이션을 먼저 실행하세요.';
    ELSE
        RAISE NOTICE '✅ tour_promotion_pages 테이블이 존재합니다.';
    END IF;
END $$;

-- 2. 현재 상태 확인
SELECT 
    t.id as tour_id,
    t.title as "투어명",
    COALESCE(p.slug, '없음') as "홍보페이지 슬러그",
    COALESCE(p.is_public::text, '없음') as "공개여부",
    CASE 
        WHEN p.id IS NULL THEN '❌ 홍보 페이지 없음'
        WHEN p.is_public = false THEN '⚠️ 비공개 상태'
        ELSE '✅ 정상'
    END as "상태"
FROM singsing_tours t
LEFT JOIN tour_promotion_pages p ON t.id = p.tour_id
WHERE t.created_at > CURRENT_DATE - INTERVAL '30 days'
ORDER BY t.created_at DESC
LIMIT 20;

-- 3. 누락된 홍보 페이지 생성 (tour_id를 slug로 사용)
INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
SELECT 
    id,
    id::text, -- tour_id를 slug로 사용
    true
FROM singsing_tours
WHERE NOT EXISTS (
    SELECT 1 FROM tour_promotion_pages WHERE tour_id = singsing_tours.id
)
ON CONFLICT (slug) DO NOTHING;

-- 4. 생성 결과 확인
SELECT 
    COUNT(*) as "생성된 홍보 페이지 수"
FROM tour_promotion_pages
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 minute';

-- 5. 특정 투어 확인 (예시 ID)
-- 실제 사용시 아래 ID를 실제 tour_id로 변경하세요
SELECT 
    t.id,
    t.title,
    p.slug,
    p.is_public,
    '/promo/' || p.slug as "홍보페이지 URL"
FROM singsing_tours t
JOIN tour_promotion_pages p ON t.id = p.tour_id
WHERE t.id = 'a0560b90-67a6-4d84-a29a-2b7548266c2b'
   OR t.title LIKE '%파인힐스%'
LIMIT 5;

-- 6. 모든 공개 홍보 페이지 URL 목록
SELECT 
    t.title as "투어명",
    '/promo/' || p.slug as "홍보페이지 URL",
    p.created_at as "생성일"
FROM tour_promotion_pages p
JOIN singsing_tours t ON p.tour_id = t.id
WHERE p.is_public = true
ORDER BY p.created_at DESC
LIMIT 10;
