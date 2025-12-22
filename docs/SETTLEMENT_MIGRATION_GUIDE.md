# 정산 시스템 마이그레이션 실행 가이드

## 개요
투어별 정산을 위한 원가 관리 시스템 구축을 위한 데이터베이스 마이그레이션

## 실행 순서

### 1단계: `tour_expenses` 테이블 구조 개선

**파일**: `supabase/migrations/20251108_update_tour_expenses.sql`

**실행 방법**:
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (MASLABS go-singsing)
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New Query** 클릭
5. 아래 파일 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭

**추가되는 컬럼**:
- 버스 비용 상세: `bus_driver_cost`, `toll_fee`, `parking_fee`, `bus_notes`
- 가이드 비용: `guide_fee`, `guide_meal_cost`, `guide_accommodation_cost`, `guide_other_cost`, `guide_notes`
- 경비 지출 구조화: `meal_expenses` (JSONB), `meal_expenses_total`
- 기타 비용 상세: `accommodation_cost`, `restaurant_cost`, `attraction_fee`, `insurance_cost`, `other_expenses_total`
- 메모: `notes`

**자동 기능**:
- 총 원가 자동 계산 트리거 (`calculate_tour_expenses_total`)
- 기존 `meal_cost`, `water_cost` 데이터를 `meal_expenses` JSONB로 자동 마이그레이션

**실행 후 확인**:
```sql
-- 새 컬럼이 추가되었는지 확인
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'tour_expenses'
  AND column_name IN (
    'bus_driver_cost', 'toll_fee', 'parking_fee', 'bus_notes',
    'guide_fee', 'guide_meal_cost', 'guide_accommodation_cost', 
    'guide_other_cost', 'guide_notes',
    'meal_expenses', 'meal_expenses_total',
    'accommodation_cost', 'restaurant_cost', 'attraction_fee', 
    'insurance_cost', 'other_expenses_total', 'notes'
  );
```

### 2단계: `tour_settlements` 테이블 생성

**파일**: `supabase/migrations/20251108_create_tour_settlements.sql`

**실행 방법**:
1. SQL Editor에서 **New Query** 클릭
2. 아래 파일 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭

**생성되는 테이블**:
- `tour_settlements`: 투어별 정산 요약 테이블
  - 매출: `contract_revenue`, `total_paid_amount`, `refunded_amount`, `settlement_amount`
  - 원가: `total_cost`
  - 마진: `margin`, `margin_rate`
  - 상태: `status`, `settled_at`, `settled_by`
  - 메모: `notes`

**자동 기능**:
- 마진 자동 계산 트리거 (`calculate_tour_settlement_margin`)
  - 정산 금액 = 완납 금액 - 환불 금액
  - 마진 = 정산 금액 - 총 원가
  - 마진률 = (마진 / 정산 금액) × 100

**실행 후 확인**:
```sql
-- 테이블이 생성되었는지 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'tour_settlements';

-- 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'tour_settlements'
ORDER BY ordinal_position;
```

## 주의사항

### 1. 데이터 백업
- 마이그레이션 실행 전 `tour_expenses` 테이블 데이터 백업 권장
- Supabase Dashboard > Database > Backups에서 백업 가능

### 2. 트리거 함수
- `calculate_tour_expenses_total`: `tour_expenses` 테이블의 `total_cost` 자동 계산
- `calculate_tour_settlement_margin`: `tour_settlements` 테이블의 마진 자동 계산
- 두 함수 모두 `CREATE OR REPLACE`로 안전하게 실행됨

### 3. 기존 데이터 마이그레이션
- `meal_cost`, `water_cost` 데이터가 있는 경우 자동으로 `meal_expenses` JSONB로 변환
- 기존 데이터는 유지되며, 새로운 구조로 변환됨

### 4. 인덱스
- `tour_expenses.tour_id` 인덱스 확인 및 생성
- `tour_settlements.tour_id`, `status`, `settled_at` 인덱스 생성

## 실행 후 확인 사항

### 1. 컬럼 추가 확인
```sql
-- tour_expenses 테이블 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tour_expenses'
ORDER BY ordinal_position;
```

### 2. 테이블 생성 확인
```sql
-- tour_settlements 테이블 확인
SELECT * FROM tour_settlements LIMIT 0;
```

### 3. 트리거 함수 확인
```sql
-- 트리거 함수 확인
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'calculate_tour_expenses_total',
    'calculate_tour_settlement_margin'
  );
```

### 4. 트리거 확인
```sql
-- 트리거 확인
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'trigger_calculate_tour_expenses_total',
    'trigger_calculate_tour_settlement_margin'
  );
```

## 문제 해결

### 오류 발생 시
1. **컬럼이 이미 존재하는 경우**: `IF NOT EXISTS` 구문으로 안전하게 처리됨
2. **트리거가 이미 존재하는 경우**: `DROP TRIGGER IF EXISTS`로 안전하게 처리됨
3. **함수가 이미 존재하는 경우**: `CREATE OR REPLACE`로 안전하게 처리됨

### 롤백 방법
마이그레이션 실행 후 문제가 발생한 경우:
1. Supabase Dashboard > Database > Backups에서 백업 복원
2. 또는 수동으로 롤백 SQL 실행

## 다음 단계

마이그레이션 완료 후:
1. 투어별 정산 관리 UI 개발 (`/admin/tours/[tourId]/settlement`)
2. 월별 정산 리포트 개선
3. 정산서 생성 기능 개발

자세한 내용은 `docs/SETTLEMENT_SYSTEM_PLAN.md` 참조









