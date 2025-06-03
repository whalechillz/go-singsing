-- Add visit_date column to singsing_tour_boarding_times table
ALTER TABLE singsing_tour_boarding_times 
ADD COLUMN IF NOT EXISTS visit_date DATE;

-- Update existing records to use tour start_date as default
UPDATE singsing_tour_boarding_times bt
SET visit_date = t.start_date::date
FROM singsing_tours t
WHERE bt.tour_id = t.id
AND bt.visit_date IS NULL;
