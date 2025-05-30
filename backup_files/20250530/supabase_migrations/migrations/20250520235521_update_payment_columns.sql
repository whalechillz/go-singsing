-- 이미 존재하는 컬럼들을 확인했으므로, 필요한 경우에만 추가
-- singsing_participants 테이블에 결제 관련 컬럼 추가 (존재하지 않는 경우에만)
ALTER TABLE singsing_participants 
ADD COLUMN IF NOT EXISTS is_paying_for_group BOOLEAN DEFAULT FALSE;

-- 결제 상태 추가 컬럼 (향후 확장용)
ALTER TABLE singsing_payments
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'deposit' CHECK (payment_type IN ('deposit', 'balance', 'full')),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'cancelled', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_payments_tour_id ON singsing_payments(tour_id);
CREATE INDEX IF NOT EXISTS idx_payments_participant_id ON singsing_payments(participant_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON singsing_payments(payer_id);
