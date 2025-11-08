# 정산 시스템 최종 개발 계획서

## 개요
투어별 정산을 위한 완전한 원가 관리 시스템 구축

## 목표
- 투어별 원가(골프장, 버스, 가이드, 경비 등) 관리
- 정확한 마진 계산
- 월별/연간 정산 리포트
- 투어별 상세 정산서 생성

## 정산 구조 정의

### 1. 매출 구조
```
계약 매출 = 상품가 × 인원
완납 금액 = 입금 합계 (계약금 + 잔금 + 전액 입금)
환불 금액 = 환불 합계
정산 금액 = 완납 금액 - 환불 금액 (최종 매출)
```

### 2. 원가 구조
```
총 원가 = 골프장 원가 + 버스 비용 + 가이드 비용 + 경비 지출 + 기타 비용

골프장 원가:
  - 골프장별 그린피
  - 카트비
  - 캐디피
  - 골프장 식사비
  - 골프장 기타 비용

버스 비용:
  - 왕복 버스 비용
  - 버스 기사 비용
  - 톨게이트 비용
  - 주차비

가이드 비용:
  - 가이드 인건비
  - 가이드 식사비
  - 가이드 숙박비
  - 가이드 기타 비용

경비 지출:
  - 김밥/도시락
  - 생수/음료
  - 간식
  - 기타 경비

기타 비용:
  - 숙박비 (호텔)
  - 식사비 (식당)
  - 관광지 입장료
  - 보험료
  - 기타 운영비
```

### 3. 마진 계산
```
마진 = 정산 금액 - 총 원가
마진률 = (마진 / 정산 금액) × 100
```

## 데이터베이스 설계

### 1. `tour_expenses` 테이블 (투어별 원가)
```sql
CREATE TABLE tour_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  
  -- 골프장 정산
  golf_course_settlement JSONB DEFAULT '[]'::jsonb,
  /*
  [
    {
      "golf_course_name": "순천 파인힐스",
      "date": "2025-09-12",
      "items": [
        {
          "type": "green_fee",
          "description": "10홀아웃",
          "unit_price": 858000,
          "quantity": 8,
          "total": 6864000
        },
        {
          "type": "cart_fee",
          "description": "카트비",
          "unit_price": 50000,
          "quantity": 8,
          "total": 400000
        }
      ],
      "subtotal": 7264000,
      "deposit": 10000000,
      "difference": 2736000,
      "notes": "9/11 입금, 차액 발생"
    }
  ]
  */
  golf_course_total INTEGER DEFAULT 0, -- 골프장 총 비용
  
  -- 버스 비용
  bus_cost INTEGER DEFAULT 0,           -- 버스 비용
  bus_driver_cost INTEGER DEFAULT 0,    -- 기사 비용
  toll_fee INTEGER DEFAULT 0,           -- 톨게이트 비용
  parking_fee INTEGER DEFAULT 0,         -- 주차비
  bus_notes TEXT,                        -- 버스 비용 메모
  
  -- 가이드 비용
  guide_fee INTEGER DEFAULT 0,          -- 가이드 인건비
  guide_meal_cost INTEGER DEFAULT 0,     -- 가이드 식사비
  guide_accommodation_cost INTEGER DEFAULT 0, -- 가이드 숙박비
  guide_other_cost INTEGER DEFAULT 0,    -- 가이드 기타 비용
  guide_notes TEXT,                      -- 가이드 비용 메모
  
  -- 경비 지출
  meal_expenses JSONB DEFAULT '[]'::jsonb,
  /*
  [
    {
      "type": "gimbap",
      "description": "김밥",
      "unit_price": 3500,
      "quantity": 11,
      "total": 38500
    },
    {
      "type": "water",
      "description": "생수",
      "unit_price": 11500,
      "quantity": 2,
      "total": 23000
    }
  ]
  */
  meal_expenses_total INTEGER DEFAULT 0, -- 경비 지출 총합
  
  -- 기타 비용
  accommodation_cost INTEGER DEFAULT 0,   -- 숙박비
  restaurant_cost INTEGER DEFAULT 0,     -- 식당 비용
  attraction_fee INTEGER DEFAULT 0,      -- 관광지 입장료
  insurance_cost INTEGER DEFAULT 0,      -- 보험료
  other_expenses JSONB DEFAULT '[]'::jsonb, -- 기타 경비 상세
  other_expenses_total INTEGER DEFAULT 0, -- 기타 비용 총합
  
  -- 총 원가
  total_cost INTEGER DEFAULT 0,          -- 총 원가 (자동 계산)
  
  -- 메모
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tour_id)
);

-- 인덱스
CREATE INDEX idx_tour_expenses_tour_id ON tour_expenses(tour_id);
```

### 2. `tour_settlements` 테이블 (투어별 정산 요약)
```sql
CREATE TABLE tour_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  
  -- 매출
  contract_revenue INTEGER DEFAULT 0,    -- 계약 매출 (상품가 × 인원)
  total_paid_amount INTEGER DEFAULT 0,   -- 완납 금액 (입금 합계)
  refunded_amount INTEGER DEFAULT 0,     -- 환불 금액
  settlement_amount INTEGER DEFAULT 0,   -- 정산 금액 (완납 - 환불)
  
  -- 원가
  total_cost INTEGER DEFAULT 0,          -- 총 원가
  
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

-- 인덱스
CREATE INDEX idx_tour_settlements_tour_id ON tour_settlements(tour_id);
CREATE INDEX idx_tour_settlements_status ON tour_settlements(status);
CREATE INDEX idx_tour_settlements_settled_at ON tour_settlements(settled_at);
```

## UI 설계

### 1. 투어별 정산 관리 페이지
**경로**: `/admin/tours/[tourId]/settlement`

**기능**:
- 원가 입력 (골프장, 버스, 가이드, 경비 등)
- 정산 요약 표시
- 정산서 생성 및 다운로드
- 정산 완료 처리

**UI 구성**:
```
[투어 정산 관리]
├── 매출 요약
│   ├── 계약 매출: 14,040,000원
│   ├── 완납 금액: 14,040,000원
│   ├── 환불 금액: 880,000원
│   └── 정산 금액: 13,160,000원
│
├── 원가 입력
│   ├── 골프장 정산
│   │   ├── 골프장별 비용 입력
│   │   └── 입금/차액 관리
│   ├── 버스 비용
│   │   ├── 버스 비용
│   │   ├── 기사 비용
│   │   ├── 톨게이트
│   │   └── 주차비
│   ├── 가이드 비용
│   │   ├── 가이드 인건비
│   │   ├── 식사비
│   │   ├── 숙박비
│   │   └── 기타 비용
│   ├── 경비 지출
│   │   ├── 김밥/도시락
│   │   ├── 생수/음료
│   │   ├── 간식
│   │   └── 기타 경비
│   └── 기타 비용
│       ├── 숙박비
│       ├── 식당 비용
│       ├── 관광지 입장료
│       └── 보험료
│
├── 정산 요약
│   ├── 총 원가: 12,189,500원
│   ├── 마진: 970,500원
│   └── 마진률: 7.4%
│
└── 정산서 생성
    ├── 정산서 미리보기
    └── PDF 다운로드
```

### 2. 월별 정산 리포트 개선
**위치**: 대시보드 및 결제 관리 페이지

**개선 사항**:
- 총 수입 → 정산 금액으로 변경
- 총 비용 → 실제 원가 (골프장 + 버스 + 가이드 + 경비)
- 마진 및 마진률 정확한 계산

## 데이터 계산 로직

### 1. 투어별 정산 계산
```typescript
interface TourSettlement {
  // 매출
  contractRevenue: number;      // 상품가 × 인원
  totalPaidAmount: number;      // 입금 합계
  refundedAmount: number;       // 환불 합계
  settlementAmount: number;     // 정산 금액 = 완납 - 환불
  
  // 원가
  golfCourseCost: number;       // 골프장 원가
  busCost: number;              // 버스 비용
  guideCost: number;            // 가이드 비용
  mealExpenses: number;         // 경비 지출
  otherCosts: number;           // 기타 비용
  totalCost: number;            // 총 원가
  
  // 마진
  margin: number;               // 마진 = 정산 금액 - 총 원가
  marginRate: number;           // 마진률 = (마진 / 정산 금액) × 100
}
```

### 2. 월별 정산 집계
```typescript
interface MonthlySettlement {
  month: string;
  monthLabel: string;
  
  // 매출
  contractRevenue: number;      // 계약 매출 합계
  totalPaidAmount: number;      // 완납 금액 합계
  refundedAmount: number;       // 환불 금액 합계
  settlementAmount: number;    // 정산 금액 합계
  
  // 원가
  golfCourseCost: number;      // 골프장 원가 합계
  busCost: number;              // 버스 비용 합계
  guideCost: number;            // 가이드 비용 합계
  mealExpenses: number;         // 경비 지출 합계
  otherCosts: number;           // 기타 비용 합계
  totalCost: number;            // 총 원가 합계
  
  // 마진
  margin: number;               // 마진 합계
  marginRate: number;           // 평균 마진률
  
  // 통계
  tourCount: number;            // 투어 수
  participantCount: number;    // 참가자 수
}
```

## 구현 단계

### Phase 1: 데이터베이스 설계 및 마이그레이션 ✅ (완료)
- [x] `tour_expenses` 테이블 구조 개선
- [x] `tour_settlements` 테이블 생성
- [x] 인덱스 및 제약조건 설정
- [x] 컬럼 설명 추가
- [x] 자동 계산 트리거 생성
- [ ] 기존 데이터 마이그레이션 (선택사항)

### Phase 2: 투어별 정산 관리 UI
- [ ] 정산 관리 페이지 생성 (`/admin/tours/[tourId]/settlement`)
- [ ] 원가 입력 폼 구현
  - [ ] 골프장 정산 입력
  - [ ] 버스 비용 입력
  - [ ] 가이드 비용 입력
  - [ ] 경비 지출 입력
  - [ ] 기타 비용 입력
- [ ] 정산 요약 표시
- [ ] 정산서 생성 기능

### Phase 3: 정산 계산 로직
- [ ] 투어별 정산 계산 함수
- [ ] 월별 정산 집계 함수
- [ ] 마진 및 마진률 계산

### Phase 4: 월별 정산 리포트 개선
- [ ] 대시보드 월별 매출 리포트 개선
  - [ ] 정산 금액 기준으로 변경
  - [ ] 실제 원가 기준으로 변경
  - [ ] 원가 상세 항목 표시
- [ ] 결제 관리 페이지 월별 매출 리포트 개선
  - [ ] 정산 금액 기준으로 변경
  - [ ] 실제 원가 기준으로 변경
  - [ ] 원가 상세 항목 표시

### Phase 5: 정산서 생성
- [ ] 정산서 템플릿 디자인
- [ ] PDF 생성 기능
- [ ] 정산서 다운로드 기능

### Phase 6: 통계 및 리포트
- [ ] 투어별 정산 통계
- [ ] 월별 정산 통계
- [ ] 연간 정산 통계
- [ ] 원가 분석 리포트

## 기술 스택
- **데이터베이스**: PostgreSQL (Supabase)
- **UI 프레임워크**: React + Next.js + Tailwind CSS
- **PDF 생성**: react-pdf 또는 jsPDF
- **차트**: recharts (기존 사용 중)

## 예상 작업 시간
- Phase 1: 데이터베이스 설계 및 마이그레이션 - 2-3시간
- Phase 2: 투어별 정산 관리 UI - 6-8시간
- Phase 3: 정산 계산 로직 - 3-4시간
- Phase 4: 월별 정산 리포트 개선 - 4-5시간
- Phase 5: 정산서 생성 - 3-4시간
- Phase 6: 통계 및 리포트 - 3-4시간
- **총 예상 시간**: 21-28시간

## 우선순위
1. **High**: Phase 1 (데이터베이스 설계)
2. **High**: Phase 2 (투어별 정산 관리 UI)
3. **High**: Phase 3 (정산 계산 로직)
4. **Medium**: Phase 4 (월별 정산 리포트 개선)
5. **Medium**: Phase 5 (정산서 생성)
6. **Low**: Phase 6 (통계 및 리포트)

## 데이터 마이그레이션 전략

### 기존 데이터 처리
1. **기존 투어 원가 데이터**: 엑셀 또는 수동 입력 데이터를 `tour_expenses` 테이블로 마이그레이션
2. **기존 정산 데이터**: 수동으로 입력하거나, 기존 결제 데이터를 기반으로 자동 계산

### 마이그레이션 스크립트
```sql
-- 기존 투어에 대한 기본 정산 데이터 생성
INSERT INTO tour_settlements (tour_id, contract_revenue, total_paid_amount, refunded_amount, settlement_amount)
SELECT 
  t.id,
  t.price * COUNT(DISTINCT p.id) as contract_revenue,
  COALESCE(SUM(CASE WHEN pay.payment_status = 'completed' THEN pay.amount ELSE 0 END), 0) as total_paid_amount,
  COALESCE(SUM(CASE WHEN pay.payment_status = 'refunded' THEN ABS(pay.amount) ELSE 0 END), 0) as refunded_amount,
  COALESCE(SUM(CASE WHEN pay.payment_status = 'completed' THEN pay.amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN pay.payment_status = 'refunded' THEN ABS(pay.amount) ELSE 0 END), 0) as settlement_amount
FROM singsing_tours t
LEFT JOIN singsing_participants p ON p.tour_id = t.id
LEFT JOIN singsing_payments pay ON pay.tour_id = t.id
GROUP BY t.id;
```

## 테스트 계획

### 단위 테스트
- 정산 계산 로직 테스트
- 원가 집계 로직 테스트
- 마진 계산 테스트

### 통합 테스트
- 투어별 정산 입력 및 계산 테스트
- 월별 정산 집계 테스트
- 정산서 생성 테스트

### E2E 테스트
- 정산 관리 페이지 전체 플로우 테스트
- 월별 정산 리포트 표시 테스트

## 향후 개선 사항
1. **자동 원가 계산**: 골프장별 기본 비용 템플릿 활용
2. **원가 예측**: 과거 데이터 기반 원가 예측
3. **마진 최적화**: 마진률 분석 및 개선 제안
4. **정산 알림**: 정산 완료 시 알림 기능
5. **정산 승인 워크플로우**: 정산 승인 프로세스

## 참고 자료
- 엑셀 정산서 구조 분석
- 기존 정산 프로세스 문서
- 골프장별 비용 정보

