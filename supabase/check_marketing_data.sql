-- 마케팅 콘텐츠 데이터 확인 쿼리

-- 1. 전체 데이터 개수 확인
SELECT 
    '전체 데이터 확인' as section,
    tp.name as tour_product,
    COUNT(DISTINCT CASE WHEN mii.category = '포함사항' THEN mii.id END) as included_count,
    COUNT(DISTINCT msb.id) as benefits_count,
    COUNT(DISTINCT CASE WHEN mii.category = '불포함사항' THEN mii.id END) as excluded_count
FROM marketing_contents mc
JOIN tour_products tp ON mc.tour_product_id = tp.id
LEFT JOIN marketing_included_items mii ON mc.id = mii.marketing_content_id
LEFT JOIN marketing_special_benefits msb ON mc.id = msb.marketing_content_id
WHERE tp.name LIKE '%오션비치%'
GROUP BY tp.name;

-- 2. 포함사항 상세 확인
SELECT 
    '=== 포함사항 상세 ===' as section,
    icon,
    title,
    description,
    display_order
FROM marketing_included_items
WHERE category = '포함사항'
AND marketing_content_id IN (
    SELECT mc.id FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE tp.name LIKE '%오션비치%'
)
ORDER BY display_order;

-- 3. 특별혜택 상세 확인
SELECT 
    '=== 특별혜택 상세 ===' as section,
    benefit_type,
    title,
    description,
    badge_text,
    badge_color,
    display_order
FROM marketing_special_benefits
WHERE marketing_content_id IN (
    SELECT mc.id FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE tp.name LIKE '%오션비치%'
)
ORDER BY display_order;

-- 4. 불포함사항 상세 확인
SELECT 
    '=== 불포함사항 상세 ===' as section,
    title,
    description,
    display_order
FROM marketing_included_items
WHERE category = '불포함사항'
AND marketing_content_id IN (
    SELECT mc.id FROM marketing_contents mc
    JOIN tour_products tp ON mc.tour_product_id = tp.id
    WHERE tp.name LIKE '%오션비치%'
)
ORDER BY display_order;
