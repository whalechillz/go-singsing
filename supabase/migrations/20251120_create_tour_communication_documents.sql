-- tour_communication_documents 테이블 생성
CREATE TABLE IF NOT EXISTS public.tour_communication_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  channel TEXT CHECK (channel IN ('kakao', 'nateon', 'booking', 'driver', 'guide', 'other')),
  topic TEXT,
  participants TEXT[],
  action_item TEXT,
  sentiment TEXT,
  ocr_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_communication_documents_tour_id
  ON public.tour_communication_documents(tour_id);

CREATE INDEX IF NOT EXISTS idx_tour_communication_documents_channel
  ON public.tour_communication_documents(channel);

CREATE INDEX IF NOT EXISTS idx_tour_communication_documents_topic
  ON public.tour_communication_documents(topic);

CREATE INDEX IF NOT EXISTS idx_tour_communication_documents_ocr_text
  ON public.tour_communication_documents USING GIN (to_tsvector('simple', coalesce(ocr_text,'')));

