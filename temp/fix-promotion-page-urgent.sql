-- 🚨 긴급 수정: 홍보 페이지 테이블 생성 및 데이터 초기화
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. tour_promotion_pages 테이블 생성
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

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tour_promotion_pages_tour_id ON tour_promotion_pages(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_promotion_pages_slug ON tour_promotion_pages(slug);
CREATE INDEX IF NOT EXISTS idx_tour_promotion_pages_is_public ON tour_promotion_pages(is_public);

-- 3. RLS 활성화
ALTER TABLE tour_promotion_pages ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- 모든 사용자가 공개된 홍보 페이지를 볼 수 있도록 허용
CREATE POLICY "Public can view published promotion pages" ON tour_promotion_pages
  FOR SELECT
  USING (is_public = true AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

-- 5. 트리거 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tour_promotion_pages_updated_at
  BEFORE UPDATE ON tour_promotion_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 특정 투어에 대한 홍보 페이지 즉시 생성
-- a0560b90-67a6-4d84-a29a-2b7548266c2b 투어 확인 및 홍보 페이지 생성
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
    
    -- slug 생성 (제목에서 특수문자 제거하고 소문자로 변환)
    v_slug := lower(regexp_replace(v_tour_title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
    v_slug := v_slug || '-' || substring(v_tour_id::text, 1, 8);
    
    -- 홍보 페이지가 없으면 생성
    INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
    VALUES (v_tour_id, v_slug, true)
    ON CONFLICT (tour_id) DO UPDATE
    SET slug = EXCLUDED.slug,
        updated_at = CURRENT_TIMESTAMP;
    
    RAISE NOTICE '✅ 홍보 페이지 생성 완료: Tour ID: %, Slug: %', v_tour_id, v_slug;
  ELSE
    RAISE NOTICE '❌ 투어가 존재하지 않습니다: %', v_tour_id;
  END IF;
END $$;

-- 7. 모든 기존 투어에 대해 홍보 페이지 자동 생성
INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
SELECT 
  t.id,
  lower(regexp_replace(t.title, '[^a-zA-Z0-9가-힣]+', '-', 'g')) || '-' || substring(t.id::text, 1, 8),
  true
FROM singsing_tours t
WHERE NOT EXISTS (
  SELECT 1 FROM tour_promotion_pages p WHERE p.tour_id = t.id
);

-- 8. 결과 확인
SELECT 
  t.id,
  t.title,
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
