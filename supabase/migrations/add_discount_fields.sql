-- singsing_payments 테이블에 할인 관련 필드 추가
ALTER TABLE singsing_payments
ADD COLUMN IF NOT EXISTS discount_amount INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(50), -- 'coupon', 'event', 'vip' 등
ADD COLUMN IF NOT EXISTS discount_name VARCHAR(100), -- '신규가입 쿠폰', 'VIP 할인' 등
ADD COLUMN IF NOT EXISTS original_amount INT, -- 할인 전 원래 금액
ADD COLUMN IF NOT EXISTS final_amount INT; -- 할인 후 최종 금액

-- 기존 데이터 업데이트 (final_amount = amount로 설정)
UPDATE singsing_payments 
SET final_amount = amount,
    original_amount = amount
WHERE final_amount IS NULL;