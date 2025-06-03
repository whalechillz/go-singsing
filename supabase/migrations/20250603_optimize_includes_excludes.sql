-- ========================================
-- 투어 데이터베이스 최적화: 포함/불포함 구조 개선
-- 실행일: 2025-06-03
-- 목적: 포함/불포함 데이터를 JSONB로 구조화하고 중복 제거
-- ========================================

-- 1. tour_products 테이블 구조 개선
ALTER TABLE tour_products 
ADD COLUMN IF NOT EXISTS included_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS excluded_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS accommodation_info JSONB DEFAULT '{}'::jsonb;

-- 2. 기존 데이터를 새 구조로 마이그레이션
UPDATE tour_products 
SET 
  -- 포함사항 구조화
  included_items = jsonb_build_array(
    jsonb_build_object(
      'category', 'golf',
      'items', CASE 
        WHEN usage_round IS NOT NULL THEN 
          ARRAY[usage_round, '카트비', '캐디피']
        ELSE 
          ARRAY['18홀 그린피', '카트비', '캐디피']
      END
    ),
    jsonb_build_object(
      'category', 'accommodation',
      'items', CASE 
        WHEN usage_hotel IS NOT NULL THEN 
          ARRAY[usage_hotel]
        ELSE 
          ARRAY['2인 1실 숙박']
      END
    ),
    jsonb_build_object(
      'category', 'transport',
      'items', CASE 
        WHEN usage_bus IS NOT NULL THEN 
          ARRAY[usage_bus]
        ELSE 
          ARRAY['왕복 전용버스']
      END
    ),
    jsonb_build_object(
      'category', 'meal',
      'items', CASE 
        WHEN usage_meal IS NOT NULL THEN 
          ARRAY[usage_meal]
        ELSE 
          ARRAY['조식 포함']
      END
    )
  ),
  
  -- 불포함사항 기본값
  excluded_items = jsonb_build_array(
    jsonb_build_object(
      'category', 'personal',
      'items', ARRAY['개인 경비', '여행자 보험', '기타 개인 비용']
    ),
    jsonb_build_object(
      'category', 'golf',
      'items', ARRAY['개인 라커 이용료', '추가 라운드']
    )
  ),
  
  -- 숙소 정보 구조화
  accommodation_info = jsonb_build_object(
    'name', COALESCE(hotel, '미정'),
    'type', '호텔',
    'room_type', '2인 1실',
    'check_in', '14:00',
    'check_out', '11:00'
  )
WHERE included_items = '[]'::jsonb;

-- 3. 인덱스 추가 (JSONB 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_tour_products_included_items 
ON tour_products USING gin (included_items);

CREATE INDEX IF NOT EXISTS idx_tour_products_excluded_items 
ON tour_products USING gin (excluded_items);

-- 4. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ tour_products 테이블 최적화 완료';
  RAISE NOTICE '- included_items: 카테고리별 포함사항 구조화';
  RAISE NOTICE '- excluded_items: 카테고리별 불포함사항 구조화';
  RAISE NOTICE '- accommodation_info: 숙소 정보 구조화';
END $$;