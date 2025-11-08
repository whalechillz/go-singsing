-- ================================================================
-- tour_expenses 테이블 구조 개선
-- 실행일: 2025-11-08
-- 목적: 가이드 비용, 버스 비용 상세, 경비 지출 구조화
-- ================================================================

-- 1. 기존 컬럼 확인 및 추가 컬럼 생성
-- 버스 비용 상세
ALTER TABLE tour_expenses 
ADD COLUMN IF NOT EXISTS bus_driver_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS toll_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parking_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bus_notes TEXT;

-- 가이드 비용
ALTER TABLE tour_expenses 
ADD COLUMN IF NOT EXISTS guide_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guide_meal_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guide_accommodation_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guide_other_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guide_notes TEXT;

-- 경비 지출 구조화 (기존 meal_cost, water_cost를 JSONB로 통합)
ALTER TABLE tour_expenses 
ADD COLUMN IF NOT EXISTS meal_expenses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meal_expenses_total INTEGER DEFAULT 0;

-- 기타 비용 상세
ALTER TABLE tour_expenses 
ADD COLUMN IF NOT EXISTS accommodation_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS restaurant_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attraction_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS insurance_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_expenses_total INTEGER DEFAULT 0;

-- 메모 필드 (기존 notes가 없을 경우)
ALTER TABLE tour_expenses 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. 컬럼 설명 추가
COMMENT ON TABLE tour_expenses IS '투어별 원가 상세 관리';
COMMENT ON COLUMN tour_expenses.id IS '원가 ID (Primary Key)';
COMMENT ON COLUMN tour_expenses.tour_id IS '투어 ID (Foreign Key)';
COMMENT ON COLUMN tour_expenses.golf_course_settlement IS '골프장 정산 상세 (JSONB)';
COMMENT ON COLUMN tour_expenses.golf_course_total IS '골프장 총 비용';
COMMENT ON COLUMN tour_expenses.bus_cost IS '버스 비용';
COMMENT ON COLUMN tour_expenses.bus_driver_cost IS '버스 기사 비용';
COMMENT ON COLUMN tour_expenses.toll_fee IS '톨게이트 비용';
COMMENT ON COLUMN tour_expenses.parking_fee IS '주차비';
COMMENT ON COLUMN tour_expenses.bus_notes IS '버스 비용 메모';
COMMENT ON COLUMN tour_expenses.guide_fee IS '가이드 인건비';
COMMENT ON COLUMN tour_expenses.guide_meal_cost IS '가이드 식사비';
COMMENT ON COLUMN tour_expenses.guide_accommodation_cost IS '가이드 숙박비';
COMMENT ON COLUMN tour_expenses.guide_other_cost IS '가이드 기타 비용';
COMMENT ON COLUMN tour_expenses.guide_notes IS '가이드 비용 메모';
COMMENT ON COLUMN tour_expenses.meal_expenses IS '경비 지출 상세 (JSONB)';
COMMENT ON COLUMN tour_expenses.meal_expenses_total IS '경비 지출 총합';
COMMENT ON COLUMN tour_expenses.accommodation_cost IS '숙박비';
COMMENT ON COLUMN tour_expenses.restaurant_cost IS '식당 비용';
COMMENT ON COLUMN tour_expenses.attraction_fee IS '관광지 입장료';
COMMENT ON COLUMN tour_expenses.insurance_cost IS '보험료';
COMMENT ON COLUMN tour_expenses.other_expenses IS '기타 경비 상세 (JSONB)';
COMMENT ON COLUMN tour_expenses.other_expenses_total IS '기타 비용 총합';
COMMENT ON COLUMN tour_expenses.total_cost IS '총 원가 (자동 계산)';
COMMENT ON COLUMN tour_expenses.notes IS '메모';
COMMENT ON COLUMN tour_expenses.created_at IS '생성일시';
COMMENT ON COLUMN tour_expenses.updated_at IS '수정일시';

-- 3. 기존 meal_cost, water_cost 데이터를 meal_expenses JSONB로 마이그레이션
-- (데이터가 있는 경우에만 실행)
DO $$
DECLARE
  expense_record RECORD;
  meal_array JSONB := '[]'::jsonb;
BEGIN
  FOR expense_record IN 
    SELECT id, meal_cost, water_cost 
    FROM tour_expenses 
    WHERE (meal_cost > 0 OR water_cost > 0) 
      AND (meal_expenses IS NULL OR meal_expenses = '[]'::jsonb)
  LOOP
    meal_array := '[]'::jsonb;
    
    IF expense_record.meal_cost > 0 THEN
      meal_array := meal_array || jsonb_build_object(
        'type', 'meal',
        'description', '식사비',
        'unit_price', expense_record.meal_cost,
        'quantity', 1,
        'total', expense_record.meal_cost
      );
    END IF;
    
    IF expense_record.water_cost > 0 THEN
      meal_array := meal_array || jsonb_build_object(
        'type', 'water',
        'description', '생수',
        'unit_price', expense_record.water_cost,
        'quantity', 1,
        'total', expense_record.water_cost
      );
    END IF;
    
    UPDATE tour_expenses 
    SET meal_expenses = meal_array,
        meal_expenses_total = COALESCE(expense_record.meal_cost, 0) + COALESCE(expense_record.water_cost, 0)
    WHERE id = expense_record.id;
  END LOOP;
END $$;

-- 4. 총 원가 자동 계산을 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION calculate_tour_expenses_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_cost := 
    COALESCE(NEW.golf_course_total, 0) +
    COALESCE(NEW.bus_cost, 0) +
    COALESCE(NEW.bus_driver_cost, 0) +
    COALESCE(NEW.toll_fee, 0) +
    COALESCE(NEW.parking_fee, 0) +
    COALESCE(NEW.guide_fee, 0) +
    COALESCE(NEW.guide_meal_cost, 0) +
    COALESCE(NEW.guide_accommodation_cost, 0) +
    COALESCE(NEW.guide_other_cost, 0) +
    COALESCE(NEW.meal_expenses_total, 0) +
    COALESCE(NEW.accommodation_cost, 0) +
    COALESCE(NEW.restaurant_cost, 0) +
    COALESCE(NEW.attraction_fee, 0) +
    COALESCE(NEW.insurance_cost, 0) +
    COALESCE(NEW.other_expenses_total, 0);
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 생성
DROP TRIGGER IF EXISTS trigger_calculate_tour_expenses_total ON tour_expenses;
CREATE TRIGGER trigger_calculate_tour_expenses_total
  BEFORE INSERT OR UPDATE ON tour_expenses
  FOR EACH ROW
  EXECUTE FUNCTION calculate_tour_expenses_total();

-- 6. 인덱스 확인 및 생성
CREATE INDEX IF NOT EXISTS idx_tour_expenses_tour_id ON tour_expenses(tour_id);

-- 완료 메시지
SELECT 'tour_expenses 테이블 구조 개선 완료' as status;

