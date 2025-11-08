# 월별 매출 기능 개발 계획

## 개요
올해 1월부터 현재까지의 월별 매출 통계를 표시하는 기능을 추가합니다.

## 목표
- 월별 매출 데이터 표시 (1월 ~ 현재 월)
- 총합 계산 및 표시
- 마진 계산 및 표시
- 시각적 차트/테이블로 데이터 표현

## 위치 선정

### 옵션 1: 대시보드에 추가 (권장)
**장점:**
- 대시보드에서 한눈에 전체 현황 파악 가능
- 다른 통계와 함께 볼 수 있어 컨텍스트 이해 용이
- 관리자가 가장 먼저 보는 페이지

**단점:**
- 대시보드가 다소 복잡해질 수 있음

**추천 위치:**
- 결제 통계 섹션 아래에 별도 섹션으로 추가
- 또는 별도 탭/섹션으로 분리

### 옵션 2: 결제 관리 페이지에 추가
**장점:**
- 결제 관련 모든 정보를 한 곳에서 확인 가능
- 상세한 결제 내역과 함께 볼 수 있음

**단점:**
- 결제 관리 페이지가 더 복잡해질 수 있음

**추천 위치:**
- 결제 현황 카드 섹션 아래에 별도 섹션으로 추가

### 옵션 3: 별도 페이지 생성
**장점:**
- 깔끔한 UI로 집중해서 볼 수 있음
- 더 많은 상세 정보 표시 가능

**단점:**
- 별도 페이지로 이동해야 함
- 접근성이 다소 떨어질 수 있음

## 최종 추천: 대시보드 + 결제 관리 페이지 (양쪽 모두)

### 대시보드
- **위치**: 결제 통계 섹션 아래
- **형태**: 간단한 차트 + 요약 테이블
- **목적**: 빠른 현황 파악

### 결제 관리 페이지
- **위치**: 결제 현황 카드 섹션 아래
- **형태**: 상세한 테이블 + 차트
- **목적**: 상세 분석 및 관리

## 데이터 구조

### 월별 매출 데이터
```typescript
interface MonthlyRevenue {
  month: string;              // "2025-01"
  monthLabel: string;         // "1월"
  totalRevenue: number;       // 총 수입
  totalCost: number;          // 총 비용 (투어 비용 등)
  margin: number;             // 마진 (총 수입 - 총 비용)
  marginRate: number;         // 마진률 (%)
  depositAmount: number;       // 계약금
  balanceAmount: number;       // 잔금
  fullPaymentAmount: number;  // 전액 입금
  refundedAmount: number;     // 환불 금액
  participantCount: number;   // 참가자 수
  tourCount: number;          // 투어 수
}
```

## UI 디자인

### 대시보드 버전 (간단)
```
[월별 매출 현황]
┌─────────────────────────────────────────┐
│ [차트: 월별 매출 추이]                  │
│ (Line Chart 또는 Bar Chart)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [요약 테이블]                           │
│ 월 | 총 수입 | 총 비용 | 마진 | 마진률  │
│ 1월 | 10,000,000 | 8,000,000 | 2,000,000 | 20% │
│ 2월 | 15,000,000 | 12,000,000 | 3,000,000 | 20% │
│ ...                                     │
│ 총합 | 150,000,000 | 120,000,000 | 30,000,000 | 20% │
└─────────────────────────────────────────┘
```

### 결제 관리 페이지 버전 (상세)
```
[월별 매출 상세]
┌─────────────────────────────────────────┐
│ [차트: 월별 매출 추이]                  │
│ (Line Chart 또는 Bar Chart)             │
│ - 총 수입                               │
│ - 총 비용                               │
│ - 마진                                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [상세 테이블]                           │
│ 월 | 총 수입 | 계약금 | 잔금 | 전액 | 환불 | 총 비용 | 마진 | 마진률 | 참가자 | 투어 │
│ 1월 | 10,000,000 | 3,000,000 | 5,000,000 | 2,000,000 | 0 | 8,000,000 | 2,000,000 | 20% | 50 | 5 │
│ ...                                     │
│ 총합 | 150,000,000 | ... | ... | ... | ... | 120,000,000 | 30,000,000 | 20% | 500 | 50 │
└─────────────────────────────────────────┘
```

## 데이터 가져오기 방법

### 1. 월별 결제 데이터 집계
```typescript
// 올해 1월부터 현재까지의 월별 결제 데이터
const startOfYear = new Date(new Date().getFullYear(), 0, 1);
const endOfMonth = new Date();

// 월별 결제 내역 가져오기
const { data: monthlyPayments } = await supabase
  .from('singsing_payments')
  .select('amount, payment_type, payment_status, payment_date')
  .gte('payment_date', startOfYear.toISOString())
  .lte('payment_date', endOfMonth.toISOString())
  .eq('payment_status', 'completed');

// 월별로 그룹화
const monthlyData = groupByMonth(monthlyPayments);
```

### 2. 월별 투어 비용 계산
```typescript
// 월별 투어 가져오기
const { data: monthlyTours } = await supabase
  .from('singsing_tours')
  .select('id, price, start_date')
  .gte('start_date', startOfYear.toISOString())
  .lte('start_date', endOfMonth.toISOString());

// 월별 투어 비용 계산
const monthlyCosts = calculateMonthlyCosts(monthlyTours);
```

### 3. 마진 계산
```typescript
const monthlyRevenue = monthlyData.map(month => ({
  ...month,
  totalCost: monthlyCosts[month.month] || 0,
  margin: month.totalRevenue - (monthlyCosts[month.month] || 0),
  marginRate: month.totalRevenue > 0 
    ? ((month.totalRevenue - (monthlyCosts[month.month] || 0)) / month.totalRevenue) * 100
    : 0
}));
```

## 구현 단계

### Phase 1: 데이터 가져오기 함수 구현
1. 월별 결제 데이터 집계 함수
2. 월별 투어 비용 계산 함수
3. 마진 계산 함수

### Phase 2: UI 컴포넌트 구현
1. 월별 매출 차트 컴포넌트 (recharts 사용)
2. 월별 매출 테이블 컴포넌트
3. 요약 카드 컴포넌트

### Phase 3: 대시보드 통합
1. 대시보드에 월별 매출 섹션 추가
2. 간단한 차트 + 요약 테이블 표시

### Phase 4: 결제 관리 페이지 통합
1. 결제 관리 페이지에 월별 매출 섹션 추가
2. 상세한 차트 + 상세 테이블 표시

## 기술 스택
- **차트 라이브러리**: recharts (이미 설치됨)
- **데이터베이스**: Supabase
- **UI 프레임워크**: React + Next.js + Tailwind CSS

## 예상 작업 시간
- 데이터 가져오기 함수: 2-3시간
- UI 컴포넌트 구현: 3-4시간
- 대시보드 통합: 1-2시간
- 결제 관리 페이지 통합: 1-2시간
- 테스트 및 디버깅: 2-3시간
- **총 예상 시간**: 9-14시간

## 우선순위
1. **High**: 데이터 가져오기 함수 구현
2. **High**: 대시보드에 간단한 버전 추가
3. **Medium**: 결제 관리 페이지에 상세 버전 추가
4. **Low**: 차트 커스터마이징 및 추가 기능

