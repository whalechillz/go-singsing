-- Add quote link management to public_document_links
ALTER TABLE public_document_links 
ADD COLUMN IF NOT EXISTS document_type VARCHAR(20) DEFAULT 'tour' CHECK (document_type IN ('tour', 'quote'));

-- Add view tracking
ALTER TABLE public_document_links
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMP;

-- Add comment for clarity
COMMENT ON COLUMN public_document_links.document_type IS 'Document type: tour = 투어 문서, quote = 견적서';
COMMENT ON COLUMN public_document_links.view_count IS 'Number of times the document has been viewed';
COMMENT ON COLUMN public_document_links.last_viewed_at IS 'Last time the document was viewed';
COMMENT ON COLUMN public_document_links.first_viewed_at IS 'First time the document was viewed';