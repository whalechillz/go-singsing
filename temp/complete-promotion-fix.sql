-- 🚨 홍보 페이지 시스템 전체 테이블 생성 SQL
-- Supabase Dashboard > SQL Editor에서 전체 복사해서 실행하세요

-- =============================================
-- 1. tourist_attractions 테이블 (관광지 정보)
-- =============================================
CREATE TABLE IF NOT EXISTS tourist_attractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_name ON tourist_attractions(name);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_category ON tourist_attractions(category);

-- =============================================
-- 2. tour_promotion_pages 테이블 (홍보 페이지)
-- =============================================
CREATE TABLE IF NOT EXISTS tour_promotion_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE,
  is_public BOOLEAN DEFAULT true,
  valid_until DATE,
  main_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tour_promotion_pages_tour_id ON tour_promotion_pages(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_promotion_pages_slug ON tour_promotion_pages(slug);
CREATE INDEX IF NOT EXISTS idx_tour_promotion_pages_is_public ON tour_promotion_pages(is_public);

-- =============================================
-- 3. tour_attraction_options 테이블 (투어별 관광지 옵션)
-- =============================================
CREATE TABLE IF NOT EXISTS tour_attraction_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES tourist_attractions(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES singsing_schedules(id) ON DELETE SET NULL,
  is_included BOOLEAN DEFAULT false,
  is_optional BOOLEAN DEFAULT false,
  additional_cost INTEGER DEFAULT 0,
  order_no INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tour_id, attraction_id, schedule_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tour_attraction_options_tour_id ON tour_attraction_options(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_attraction_options_attraction_id ON tour_attraction_options(attraction_id);
CREATE INDEX IF NOT EXISTS idx_tour_attraction_options_schedule_id ON tour_attraction_options(schedule_id);

-- =============================================
-- 4. RLS (Row Level Security) 설정
-- =============================================
ALTER TABLE tourist_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_promotion_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_attraction_options ENABLE ROW LEVEL SECURITY;

-- 홍보 페이지 공개 정책
CREATE POLICY IF NOT EXISTS "Public can view published promotion pages" ON tour_promotion_pages
  FOR SELECT
  USING (is_public = true AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

-- 관광지 정보 공개 정책
CREATE POLICY IF NOT EXISTS "Public can view attractions" ON tourist_attractions
  FOR SELECT
  USING (true);

-- 투어 관광지 옵션 공개 정책
CREATE POLICY IF NOT EXISTS "Public can view tour attraction options" ON tour_attraction_options
  FOR SELECT
  USING (true);

-- =============================================
-- 5. 트리거 함수 생성
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
DROP TRIGGER IF EXISTS update_tourist_attractions_updated_at ON tourist_attractions;
CREATE TRIGGER update_tourist_attractions_updated_at
  BEFORE UPDATE ON tourist_attractions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_promotion_pages_updated_at ON tour_promotion_pages;
CREATE TRIGGER update_tour_promotion_pages_updated_at
  BEFORE UPDATE ON tour_promotion_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_attraction_options_updated_at ON tour_attraction_options;
CREATE TRIGGER update_tour_attraction_options_updated_at
  BEFORE UPDATE ON tour_attraction_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. 기본 관광지 데이터 추가
-- =============================================
INSERT INTO tourist_attractions (name, description, category, location) VALUES
  ('제주 성산일출봉', '유네스코 세계자연유산으로 지정된 제주의 대표 명소', '자연경관', '제주도'),
  ('제주 카멜리아힐', '동양 최대 규모의 동백 수목원', '관광지', '제주도'),
  ('경주 불국사', '신라 불교문화의 정수를 보여주는 사찰', '문화재', '경상북도 경주시'),
  ('부산 해운대', '대한민국 대표 해수욕장', '자연경관', '부산광역시')
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. 특정 투어 홍보 페이지 즉시 생성
-- =============================================
DO $$
DECLARE
  v_tour_id UUID := 'a0560b90-67a6-4d84-a29a-2b7548266c2b';
  v_tour_exists BOOLEAN;
  v_tour_title TEXT;
  v_slug TEXT;
BEGIN
  -- 투어 존재 여부 확인
  SELECT EXISTS(SELECT 1 FROM singsing_tours WHERE id = v_tour_id) INTO v_tour_exists;
  
  IF v_tour_exists THEN
    -- 투어 제목 가져오기
    SELECT title INTO v_tour_title FROM singsing_tours WHERE id = v_tour_id;
    
    -- slug 생성
    v_slug := lower(regexp_replace(v_tour_title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
    v_slug := v_slug || '-' || substring(v_tour_id::text, 1, 8);
    
    -- 홍보 페이지 생성
    INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
    VALUES (v_tour_id, v_slug, true)
    ON CONFLICT (tour_id) DO UPDATE
    SET slug = EXCLUDED.slug,
        is_public = true,
        updated_at = CURRENT_TIMESTAMP;
    
    RAISE NOTICE '✅ 홍보 페이지 생성/업데이트 완료: Tour ID: %, Slug: %', v_tour_id, v_slug;
  ELSE
    RAISE NOTICE '❌ 투어가 존재하지 않습니다: %', v_tour_id;
  END IF;
END $$;

-- =============================================
-- 8. 모든 기존 투어에 홍보 페이지 자동 생성
-- =============================================
INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
SELECT 
  t.id,
  lower(regexp_replace(t.title, '[^a-zA-Z0-9가-힣]+', '-', 'g')) || '-' || substring(t.id::text, 1, 8),
  true
FROM singsing_tours t
WHERE NOT EXISTS (
  SELECT 1 FROM tour_promotion_pages p WHERE p.tour_id = t.id
)
ON CONFLICT (tour_id) DO UPDATE
SET is_public = true,
    updated_at = CURRENT_TIMESTAMP;

-- =============================================
-- 9. 결과 확인 쿼리
-- =============================================
SELECT 
  t.id,
  t.title,
  t.tour_period,
  p.slug,
  p.is_public,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ 홍보 페이지 있음'
    ELSE '❌ 홍보 페이지 없음'
  END as status,
  'https://go.singsinggolf.kr/promo/' || COALESCE(p.slug, t.id::text) as promotion_url
FROM singsing_tours t
LEFT JOIN tour_promotion_pages p ON t.id = p.tour_id
WHERE t.id = 'a0560b90-67a6-4d84-a29a-2b7548266c2b'
ORDER BY t.created_at DESC;

-- 전체 홍보 페이지 수 확인
SELECT 
  COUNT(*) as total_tours,
  COUNT(p.id) as promotion_pages_count,
  COUNT(*) - COUNT(p.id) as missing_pages
FROM singsing_tours t
LEFT JOIN tour_promotion_pages p ON t.id = p.tour_id;
