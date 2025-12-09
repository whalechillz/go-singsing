-- ================================================================
-- tour_settlements 테이블 생성
-- 실행일: 2025-11-08
-- 목적: 투어별 정산 요약 관리
-- ================================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 테이블 생성
CREATE TABLE IF NOT EXISTS tour_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  
  -- 매출
  contract_revenue INTEGER DEFAULT 0,    -- 계약 매출 (상품가 × 인원)
  total_paid_amount INTEGER DEFAULT 0,   -- 완납 금액 (입금 합계)
  refunded_amount INTEGER DEFAULT 0,     -- 환불 금액
  settlement_amount INTEGER DEFAULT 0,   -- 정산 금액 (완납 - 환불)
  
  -- 원가
  total_cost INTEGER DEFAULT 0,          -- 총 원가 (tour_expenses.total_cost 참조)
  
  -- 마진
  margin INTEGER DEFAULT 0,              -- 마진 (정산 금액 - 총 원가)
  margin_rate DECIMAL(5,2) DEFAULT 0,   -- 마진률 (%)
  
  -- 상태
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'completed', 'cancelled'
  settled_at TIMESTAMP,                  -- 정산 완료일
  settled_by UUID REFERENCES auth.users(id), -- 정산 처리자
  
  -- 메모
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tour_id)
);

-- 인덱스 생성
CREATE INDEX idx_tour_settlements_tour_id ON tour_settlements(tour_id);
CREATE INDEX idx_tour_settlements_status ON tour_settlements(status);
CREATE INDEX idx_tour_settlements_settled_at ON tour_settlements(settled_at);

-- 컬럼 설명 추가
COMMENT ON TABLE tour_settlements IS '투어별 정산 요약';
COMMENT ON COLUMN tour_settlements.id IS '정산 ID (Primary Key)';
COMMENT ON COLUMN tour_settlements.tour_id IS '투어 ID (Foreign Key)';
COMMENT ON COLUMN tour_settlements.contract_revenue IS '계약 매출 (상품가 × 인원)';
COMMENT ON COLUMN tour_settlements.total_paid_amount IS '완납 금액 (입금 합계)';
COMMENT ON COLUMN tour_settlements.refunded_amount IS '환불 금액';
COMMENT ON COLUMN tour_settlements.settlement_amount IS '정산 금액 (완납 - 환불)';
COMMENT ON COLUMN tour_settlements.total_cost IS '총 원가';
COMMENT ON COLUMN tour_settlements.margin IS '마진 (정산 금액 - 총 원가)';
COMMENT ON COLUMN tour_settlements.margin_rate IS '마진률 (%)';
COMMENT ON COLUMN tour_settlements.status IS '정산 상태 (pending, completed, cancelled)';
COMMENT ON COLUMN tour_settlements.settled_at IS '정산 완료일시';
COMMENT ON COLUMN tour_settlements.settled_by IS '정산 처리자 ID';
COMMENT ON COLUMN tour_settlements.notes IS '메모';
COMMENT ON COLUMN tour_settlements.created_at IS '생성일시';
COMMENT ON COLUMN tour_settlements.updated_at IS '수정일시';

-- 마진 자동 계산을 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION calculate_tour_settlement_margin()
RETURNS TRIGGER AS $$
BEGIN
  -- 정산 금액 계산
  NEW.settlement_amount := NEW.total_paid_amount - NEW.refunded_amount;
  
  -- 마진 계산
  NEW.margin := NEW.settlement_amount - NEW.total_cost;
  
  -- 마진률 계산
  IF NEW.settlement_amount > 0 THEN
    NEW.margin_rate := (NEW.margin::DECIMAL / NEW.settlement_amount::DECIMAL) * 100;
  ELSE
    NEW.margin_rate := 0;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_calculate_tour_settlement_margin ON tour_settlements;
CREATE TRIGGER trigger_calculate_tour_settlement_margin
  BEFORE INSERT OR UPDATE ON tour_settlements
  FOR EACH ROW
  EXECUTE FUNCTION calculate_tour_settlement_margin();

-- 완료 메시지
SELECT 'tour_settlements 테이블 생성 완료' as status;








