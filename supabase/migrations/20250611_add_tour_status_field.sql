-- Add status field to singsing_tours table to distinguish between quotes and confirmed tours
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('quote', 'confirmed', 'ongoing', 'completed', 'cancelled'));

-- Add comment for clarity
COMMENT ON COLUMN singsing_tours.status IS 'Tour status: quote = 견적, confirmed = 확정, ongoing = 진행중, completed = 완료, cancelled = 취소';

-- Update existing tours to have 'confirmed' status (already set as default)
UPDATE singsing_tours 
SET status = 'confirmed' 
WHERE status IS NULL;

-- Add quote-specific fields
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS quoted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS quoted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_expires_at DATE,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS quote_notes TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_singsing_tours_status ON singsing_tours(status);
CREATE INDEX IF NOT EXISTS idx_singsing_tours_quote_expires_at ON singsing_tours(quote_expires_at) WHERE status = 'quote';