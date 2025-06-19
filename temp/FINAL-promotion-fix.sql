-- 🚨 홍보 페이지 시스템 긴급 수정 SQL (완전판)
-- Supabase Dashboard > SQL Editor에서 전체 복사해서 실행하세요
-- 실행 전에 기존 테이블이 있는지 확인하고, 없는 것만 생성합니다

-- =============================================
-- 0. public_document_links 테이블 확인 및 생성
-- =============================================
CREATE TABLE IF NOT EXISTS public_document_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    access_token VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_public_document_links_tour_id ON public_document_links(tour_id);
CREATE INDEX IF NOT EXISTS idx_public_document_links_access_token ON public_document_links(access_token);
CREATE INDEX IF NOT EXISTS idx_public_document_links_is_active ON public_document_links(is_active);

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tour_id)  -- tour_id에 대한 유니크 제약 추가
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
ALTER TABLE public_document_links ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Public can view published promotion pages" ON tour_promotion_pages;
CREATE POLICY "Public can view published promotion pages" ON tour_promotion_pages
  FOR SELECT
  USING (is_public = true AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

DROP POLICY IF EXISTS "Public can view attractions" ON tourist_attractions;
CREATE POLICY "Public can view attractions" ON tourist_attractions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view tour attraction options" ON tour_attraction_options;
CREATE POLICY "Public can view tour attraction options" ON tour_attraction_options
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view active document links" ON public_document_links;
CREATE POLICY "Public can view active document links" ON public_document_links
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

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

DROP TRIGGER IF EXISTS update_public_document_links_updated_at ON public_document_links;
CREATE TRIGGER update_public_document_links_updated_at
  BEFORE UPDATE ON public_document_links
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
  v_promo_exists BOOLEAN;
BEGIN
  -- 투어 존재 여부 확인
  SELECT EXISTS(SELECT 1 FROM singsing_tours WHERE id = v_tour_id) INTO v_tour_exists;
  
  IF v_tour_exists THEN
    -- 투어 제목 가져오기
    SELECT title INTO v_tour_title FROM singsing_tours WHERE id = v_tour_id;
    
    -- 이미 홍보 페이지가 있는지 확인
    SELECT EXISTS(SELECT 1 FROM tour_promotion_pages WHERE tour_id = v_tour_id) INTO v_promo_exists;
    
    IF NOT v_promo_exists THEN
      -- slug 생성
      v_slug := lower(regexp_replace(v_tour_title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
      v_slug := regexp_replace(v_slug, '-+', '-', 'g');  -- 연속된 하이픈 제거
      v_slug := trim(both '-' from v_slug);  -- 앞뒤 하이픈 제거
      v_slug := v_slug || '-' || substring(v_tour_id::text, 1, 8);
      
      -- 홍보 페이지 생성
      INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
      VALUES (v_tour_id, v_slug, true);
      
      RAISE NOTICE '✅ 홍보 페이지 생성 완료: Tour ID: %, Slug: %', v_tour_id, v_slug;
    ELSE
      -- 이미 있으면 공개 상태로 업데이트
      UPDATE tour_promotion_pages 
      SET is_public = true, updated_at = CURRENT_TIMESTAMP
      WHERE tour_id = v_tour_id;
      
      RAISE NOTICE '✅ 홍보 페이지 업데이트 완료 (공개 상태로 변경)';
    END IF;
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
  trim(both '-' from 
    regexp_replace(
      regexp_replace(
        lower(t.title), 
        '[^a-zA-Z0-9가-힣]+', 
        '-', 
        'g'
      ),
      '-+',
      '-',
      'g'
    )
  ) || '-' || substring(t.id::text, 1, 8),
  true
FROM singsing_tours t
WHERE NOT EXISTS (
  SELECT 1 FROM tour_promotion_pages p WHERE p.tour_id = t.id
);

-- =============================================
-- 9. 결과 확인 쿼리
-- =============================================
-- 특정 투어의 홍보 페이지 확인
SELECT 
  t.id,
  t.title,
  t.tour_period,
  p.id as promo_id,
  p.slug,
  p.is_public,
  p.created_at as promo_created_at,
  CASE 
    WHEN p.id IS NOT NULL AND p.is_public = true THEN '✅ 공개 중'
    WHEN p.id IS NOT NULL AND p.is_public = false THEN '⏸️ 비공개'
    ELSE '❌ 홍보 페이지 없음'
  END as status,
  'https://go.singsinggolf.kr/promo/' || COALESCE(p.slug, t.id::text) as promotion_url
FROM singsing_tours t
LEFT JOIN tour_promotion_pages p ON t.id = p.tour_id
WHERE t.id = 'a0560b90-67a6-4d84-a29a-2b7548266c2b';

-- 전체 통계
SELECT 
  'Total Tours' as metric,
  COUNT(*) as count
FROM singsing_tours
UNION ALL
SELECT 
  'Tours with Promotion Pages' as metric,
  COUNT(*) as count
FROM tour_promotion_pages
UNION ALL
SELECT 
  'Public Promotion Pages' as metric,
  COUNT(*) as count
FROM tour_promotion_pages
WHERE is_public = true;

-- 최근 생성된 홍보 페이지 5개
SELECT 
  t.title,
  p.slug,
  p.is_public,
  p.created_at,
  'https://go.singsinggolf.kr/promo/' || p.slug as url
FROM tour_promotion_pages p
JOIN singsing_tours t ON p.tour_id = t.id
ORDER BY p.created_at DESC
LIMIT 5;
