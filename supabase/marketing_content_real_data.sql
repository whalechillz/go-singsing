-- 마케팅 콘텐츠 실제 데이터 적용 쿼리
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 샘플 데이터 삭제 (있다면)
DELETE FROM marketing_special_benefits WHERE marketing_content_id IN (
    SELECT id FROM marketing_contents WHERE content_type = 'tour_product'
);
DELETE FROM marketing_included_items WHERE marketing_content_id IN (
    SELECT id FROM marketing_contents WHERE content_type = 'tour_product'
);
DELETE FROM marketing_contents WHERE content_type = 'tour_product';

-- 2. 오션비치 투어 상품에 대한 마케팅 콘텐츠 생성
INSERT INTO marketing_contents (id, tour_product_id, content_type, is_active)
SELECT 
    gen_random_uuid(),
    tp.id,
    'tour_product',
    true
FROM tour_products tp
WHERE tp.name LIKE '%오션비치%'
ON CONFLICT DO NOTHING;

-- 3. 포함사항 데이터 입력
WITH mc AS (
    SELECT mc.id 
    FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE mc.content_type = 'tour_product' 
    AND tp.name LIKE '%오션비치%'
    LIMIT 1
)
INSERT INTO marketing_included_items (marketing_content_id, category, icon, title, description, display_order, is_highlight)
SELECT 
    mc.id,
    '포함사항',
    icon,
    title,
    description,
    display_order,
    is_highlight
FROM mc, (VALUES
    ('transport', '리무진 버스', '28인승 최고급 차량', 0, false),
    ('green_fee', '그린피 및 카트비', '18홀 × 3일', 1, true),
    ('accommodation', '호텔 2박', '2인 1실 기준', 2, false),
    ('meal', '식사 제공', '조식 2회, 중식 3회, 석식 2회 (골프텔 또는 5성급 호텔)', 3, false),
    ('caddie', '전문 기사', '경험 많은 전문 기사 (가이드 포함 가능)', 4, false)
) AS items(icon, title, description, display_order, is_highlight);

-- 4. 특별혜택 데이터 입력
WITH mc AS (
    SELECT mc.id 
    FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE mc.content_type = 'tour_product' 
    AND tp.name LIKE '%오션비치%'
    LIMIT 1
)
INSERT INTO marketing_special_benefits (marketing_content_id, benefit_type, title, description, value, badge_text, badge_color, display_order)
SELECT 
    mc.id,
    benefit_type,
    title,
    description,
    value,
    badge_text,
    badge_color,
    display_order
FROM mc, (VALUES
    ('gift', '지역 맛집 투어', '엄선된 맛집 방문 (선택사항)', NULL, '옵션', 'blue', 0),
    ('exclusive', '그룹 사진 촬영', '기사 또는 가이드가 촬영 서비스 제공', NULL, '무료', 'green', 1),
    ('gift', '생수 제공', '버스 내 생수 상시 제공', NULL, '기본제공', 'purple', 2),
    ('gift', '와인 제공', '저녁 식사 시 와인 제공', NULL, '특별제공', 'red', 3)
) AS benefits(benefit_type, title, description, value, badge_text, badge_color, display_order);

-- 5. 불포함사항 데이터 입력
WITH mc AS (
    SELECT mc.id 
    FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE mc.content_type = 'tour_product' 
    AND tp.name LIKE '%오션비치%'
    LIMIT 1
)
INSERT INTO marketing_included_items (marketing_content_id, category, icon, title, description, display_order)
SELECT 
    mc.id,
    '불포함사항',
    NULL,
    title,
    description,
    display_order
FROM mc, (VALUES
    ('캐디피', '별도', 0),
    ('맛집투어 식사비용', '외부 맛집 이용시 차량 제공, 식사비용은 개인 부담', 1),
    ('개인 경비', '기타 개인 비용', 2)
) AS items(title, description, display_order);

-- 6. 추가 아이콘 등록 (없다면)
INSERT INTO marketing_icons (icon_key, icon_name, category) VALUES
('green_fee', '그린피', 'activity'),
('wine', '와인', 'food')
ON CONFLICT (icon_key) DO NOTHING;

-- 7. 다른 투어 상품들을 위한 기본 템플릿 생성 (선택사항)
-- 아래는 다른 골프장 투어 상품에도 비슷한 구조를 적용하는 예시입니다

/*
-- 라비에벨 투어 상품 마케팅 콘텐츠
INSERT INTO marketing_contents (id, tour_product_id, content_type, is_active)
SELECT 
    gen_random_uuid(),
    tp.id,
    'tour_product',
    true
FROM tour_products tp
WHERE tp.name LIKE '%라비에벨%'
ON CONFLICT DO NOTHING;

-- 포함사항 복사 (오션비치 것을 기반으로)
WITH source_mc AS (
    SELECT mc.id 
    FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE mc.content_type = 'tour_product' 
    AND tp.name LIKE '%오션비치%'
    LIMIT 1
),
target_mc AS (
    SELECT mc.id 
    FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE mc.content_type = 'tour_product' 
    AND tp.name LIKE '%라비에벨%'
    LIMIT 1
)
INSERT INTO marketing_included_items (marketing_content_id, category, icon, title, description, display_order, is_highlight)
SELECT 
    target_mc.id,
    category,
    icon,
    title,
    description,
    display_order,
    is_highlight
FROM marketing_included_items, target_mc
WHERE marketing_content_id = (SELECT id FROM source_mc);
*/

-- 실행 결과 확인
SELECT 
    mc.id,
    tp.name as tour_product_name,
    COUNT(DISTINCT mii.id) as included_items_count,
    COUNT(DISTINCT msb.id) as special_benefits_count
FROM marketing_contents mc
JOIN tour_products tp ON mc.tour_product_id = tp.id
LEFT JOIN marketing_included_items mii ON mc.id = mii.marketing_content_id
LEFT JOIN marketing_special_benefits msb ON mc.id = msb.marketing_content_id
WHERE mc.content_type = 'tour_product'
GROUP BY mc.id, tp.name;

-- 입력된 데이터 미리보기
SELECT '=== 포함사항 ===' as section;
SELECT icon, title, description 
FROM marketing_included_items 
WHERE category = '포함사항' 
AND marketing_content_id IN (
    SELECT mc.id FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE tp.name LIKE '%오션비치%'
)
ORDER BY display_order;

SELECT '=== 특별혜택 ===' as section;
SELECT benefit_type, title, description, badge_text, badge_color 
FROM marketing_special_benefits 
WHERE marketing_content_id IN (
    SELECT mc.id FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE tp.name LIKE '%오션비치%'
)
ORDER BY display_order;

SELECT '=== 불포함사항 ===' as section;
SELECT title, description 
FROM marketing_included_items 
WHERE category = '불포함사항' 
AND marketing_content_id IN (
    SELECT mc.id FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE tp.name LIKE '%오션비치%'
)
ORDER BY display_order;
