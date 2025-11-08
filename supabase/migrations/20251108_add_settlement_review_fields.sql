-- ================================================================
-- tour_settlements 테이블에 검토 필드 추가
-- 실행일: 2025-11-08
-- 목적: 정산 계산 검증 및 직원 확인을 위한 필드 추가
-- ================================================================

-- 검토 관련 필드 추가
ALTER TABLE tour_settlements 
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false, -- 확인 필요 여부
ADD COLUMN IF NOT EXISTS review_notes TEXT, -- 검토 메모 (직원 확인 사항 기록)
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE, -- 검토 완료일시
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id), -- 검토자 ID
ADD COLUMN IF NOT EXISTS expected_margin INTEGER, -- 예상 마진 (이미지 정산서 기준 수익 값)
ADD COLUMN IF NOT EXISTS calculation_discrepancy INTEGER; -- 계산 차이 (실제 계산 마진 - 예상 마진)

-- 컬럼 설명 추가
COMMENT ON COLUMN tour_settlements.needs_review IS '확인 필요 여부 (계산 차이가 있을 때 true)';
COMMENT ON COLUMN tour_settlements.review_notes IS '검토 메모 (직원 확인 사항 기록)';
COMMENT ON COLUMN tour_settlements.reviewed_at IS '검토 완료일시';
COMMENT ON COLUMN tour_settlements.reviewed_by IS '검토자 ID';
COMMENT ON COLUMN tour_settlements.expected_margin IS '예상 마진 (이미지 정산서 기준 수익 값)';
COMMENT ON COLUMN tour_settlements.calculation_discrepancy IS '계산 차이 (실제 계산 마진 - 예상 마진)';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tour_settlements_needs_review ON tour_settlements(needs_review) WHERE needs_review = true;

-- 완료 메시지
SELECT 'tour_settlements 테이블 검토 필드 추가 완료' as status;

