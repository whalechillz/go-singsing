-- 마케팅 콘텐츠 기본 데이터 삽입
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. 투어 상품에 대한 기본 마케팅 콘텐츠 생성 (예시)
DO $$
DECLARE
  v_tour_product_id UUID;
  v_marketing_content_id UUID;
BEGIN
  -- 첫 번째 투어 상품 가져오기
  SELECT id INTO v_tour_product_id
  FROM tour_products
  LIMIT 1;
  
  IF v_tour_product_id IS NOT NULL THEN
    -- 마케팅 콘텐츠 생성
    INSERT INTO marketing_contents (tour_product_id, content_type, is_active)
    VALUES (v_tour_product_id, 'tour_product', true)
    RETURNING id INTO v_marketing_content_id;
    
    -- 포함사항 추가
    INSERT INTO marketing_included_items (marketing_content_id, category, icon, title, description, display_order, is_highlight) VALUES
    (v_marketing_content_id, '포함사항', 'transport', '리무진 버스 (45인승 최고급 차량)', '전문 기사와 함께하는 안전하고 편안한 이동', 1, false),
    (v_marketing_content_id, '포함사항', 'green_fee', '그린피 및 카트비 (18홀 × 3일)', '전 일정 그린피 및 카트비 포함', 2, true),
    (v_marketing_content_id, '포함사항', 'accommodation', '호텔 2박 (2인 1실 기준)', '골프장 인근 특급 호텔', 3, false),
    (v_marketing_content_id, '포함사항', 'meal', '조식 2회 (호텔 조식)', '호텔에서 제공하는 조식 뷔페', 4, false),
    (v_marketing_content_id, '포함사항', 'meal', '전문 기사가이드 (경험 많은 전문가)', '현지 정보에 밝은 전문 가이드', 5, false);
    
    -- 특별혜택 추가
    INSERT INTO marketing_special_benefits (marketing_content_id, benefit_type, title, description, value, badge_text, badge_color, display_order) VALUES
    (v_marketing_content_id, 'special', '지역 맛집 투어', '엄선된 맛집에서의 점심 제공', '엄선된 맛집', '특별제공', 'red', 1),
    (v_marketing_content_id, 'special', '그룹 사진 촬영 서비스', '전문 작가의 그룹 사진 촬영', '전문 촬영', '무료', 'green', 2),
    (v_marketing_content_id, 'special', '물 및 간식 제공', '버스 내 상시 제공', '상시 제공', '무료', 'blue', 3);
    
    -- 불포함사항 추가
    INSERT INTO marketing_included_items (marketing_content_id, category, icon, title, description, display_order, is_highlight) VALUES
    (v_marketing_content_id, '불포함사항', 'money', '캐디피 (약 15만원)', '개인 부담', 1, false),
    (v_marketing_content_id, '불포함사항', 'meal', '중식 및 석식', '개인 취향에 따라 자유롭게', 2, false),
    (v_marketing_content_id, '불포함사항', 'money', '개인 경비', '기타 개인 비용', 3, false),
    (v_marketing_content_id, '불포함사항', 'warning', '여행자 보험', '개별 가입 필요', 4, false);
    
    RAISE NOTICE '✅ 투어 상품 마케팅 콘텐츠 생성 완료';
  END IF;
END $$;

-- 2. 결과 확인
SELECT 
  mc.id,
  mc.content_type,
  tp.name as tour_product_name,
  COUNT(DISTINCT mii.id) as item_count,
  COUNT(DISTINCT msb.id) as benefit_count
FROM marketing_contents mc
LEFT JOIN tour_products tp ON mc.tour_product_id = tp.id
LEFT JOIN marketing_included_items mii ON mc.id = mii.marketing_content_id
LEFT JOIN marketing_special_benefits msb ON mc.id = msb.marketing_content_id
WHERE mc.content_type = 'tour_product'
GROUP BY mc.id, mc.content_type, tp.name;