-- 고객 정보 확장 필드 추가
-- 2025-12-08

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS position VARCHAR(50),           -- 직급 (총무, 회장, 방장)
ADD COLUMN IF NOT EXISTS activity_platform VARCHAR(50),  -- 활동 플랫폼 (밴드, 당근마켓, 모임(오프라인), 카카오톡, 기타)
ADD COLUMN IF NOT EXISTS referral_source VARCHAR(50),    -- 유입경로 (네이버블로그, 홈페이지, 네이버검색, 구글검색, 지인추천, 페이스북 광고, 인스타그램 광고, 카카오톡 채널, 기타)
ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMP,      -- 최근 연락 일시
ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT false, -- 수신거부 여부
ADD COLUMN IF NOT EXISTS unsubscribed_reason TEXT;       -- 수신거부 사유

-- 인덱스 추가 (필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_customers_position ON customers(position);
CREATE INDEX IF NOT EXISTS idx_customers_activity_platform ON customers(activity_platform);
CREATE INDEX IF NOT EXISTS idx_customers_referral_source ON customers(referral_source);
CREATE INDEX IF NOT EXISTS idx_customers_last_contact_at ON customers(last_contact_at);
CREATE INDEX IF NOT EXISTS idx_customers_unsubscribed ON customers(unsubscribed);

-- 코멘트 추가
COMMENT ON COLUMN customers.position IS '직급: 총무, 회장, 방장';
COMMENT ON COLUMN customers.activity_platform IS '활동 플랫폼: 밴드, 당근마켓, 모임(오프라인), 카카오톡, 기타';
COMMENT ON COLUMN customers.referral_source IS '유입경로: 네이버블로그, 홈페이지, 네이버검색, 구글검색, 지인추천, 페이스북 광고, 인스타그램 광고, 카카오톡 채널, 기타';
COMMENT ON COLUMN customers.last_contact_at IS '최근 연락 일시';
COMMENT ON COLUMN customers.unsubscribed IS '수신거부 여부';
COMMENT ON COLUMN customers.unsubscribed_reason IS '수신거부 사유';
