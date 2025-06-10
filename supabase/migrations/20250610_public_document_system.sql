-- ================================================================
-- 공개 문서 URL 시스템
-- 2025-06-10
-- ================================================================

-- 공개 문서 링크 테이블
CREATE TABLE IF NOT EXISTS public_document_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'customer_schedule', 'customer_boarding', etc.
  access_token UUID DEFAULT uuid_generate_v4(), -- 고유 접근 토큰
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP, -- 만료일 (선택사항)
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE UNIQUE INDEX idx_public_doc_token ON public_document_links(access_token);
CREATE INDEX idx_public_doc_tour ON public_document_links(tour_id);

-- 샘플 문서 테이블 (홍보용)
CREATE TABLE IF NOT EXISTS sample_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL, -- HTML 내용
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 문서 조회 기록
CREATE TABLE IF NOT EXISTS document_view_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_link_id UUID REFERENCES public_document_links(id),
  viewer_ip VARCHAR(45),
  user_agent TEXT,
  viewed_at TIMESTAMP DEFAULT NOW()
);
