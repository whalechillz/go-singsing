-- Add quote_data field to store schedule and participant information
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS quote_data JSONB;

-- Add comment for clarity
COMMENT ON COLUMN singsing_tours.quote_data IS 'Quote detailed data including schedules and participant info';