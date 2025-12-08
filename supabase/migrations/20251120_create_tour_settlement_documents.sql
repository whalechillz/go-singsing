-- tour_settlement_documents 테이블 생성
CREATE TABLE IF NOT EXISTS public.tour_settlement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  category TEXT CHECK (category IN ('golf-course', 'bus', 'guide', 'expenses', 'tax-invoice', 'other')),
  vendor TEXT,
  amount NUMERIC,
  currency TEXT,
  paid_at DATE,
  ocr_status TEXT DEFAULT 'pending',
  ocr_data JSONB,
  ai_tags JSONB,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_settlement_documents_tour_id
  ON public.tour_settlement_documents(tour_id);

CREATE INDEX IF NOT EXISTS idx_tour_settlement_documents_category
  ON public.tour_settlement_documents(category);

CREATE INDEX IF NOT EXISTS idx_tour_settlement_documents_vendor
  ON public.tour_settlement_documents(vendor);

CREATE INDEX IF NOT EXISTS idx_tour_settlement_documents_ocr_text
  ON public.tour_settlement_documents USING GIN (to_tsvector('simple', coalesce((ocr_data->>'text')::text,'')));

