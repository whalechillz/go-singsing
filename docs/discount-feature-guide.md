# 결제 할인 기능 추가 가이드

## 1. DB 마이그레이션
먼저 Supabase 대시보드에서 다음 SQL을 실행하세요:

```sql
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
```

## 2. PaymentManagerV3.tsx 수정 사항

### 2.1. Import 추가
```tsx
import { calculateFinalAmount, getDiscountTypeName, validateDiscount, getDefaultDiscountName } from './discount-handler';
```

### 2.2. Payment 인터페이스에 할인 필드 추가
```tsx
interface Payment {
  // ... 기존 필드들
  // 할인 관련 필드
  discount_amount?: number;
  discount_type?: string;
  discount_name?: string;
  original_amount?: number;
  final_amount?: number;
}
```

### 2.3. Form state에 할인 필드 추가
```tsx
const [form, setForm] = useState({
  // ... 기존 필드들
  // 할인 관련 필드
  discount_amount: 0,
  discount_type: "",
  discount_name: "",
  original_amount: 0,
  final_amount: 0
});
```

### 2.4. handleSubmit 함수 수정
개별 결제와 그룹 결제 모두에서 할인 정보를 저장하도록 수정

### 2.5. 결제 모달에 할인 UI 추가
메모 입력 필드 다음에 `discount-ui-template.tsx` 파일의 내용을 추가

### 2.6. 결제 목록 테이블 수정
금액 표시 부분에서 할인 정보를 표시하도록 수정

## 3. 주요 기능

### 할인 유형
- 쿠폰
- 이벤트
- VIP
- 특별할인
- 기타

### 빠른 할인 버튼
- 1만원
- 3만원
- 5만원
- 10만원

### 자동 계산
- 최종 결제 금액 = 상품 금액 - 할인 금액
- 할인 금액이 상품 금액보다 클 수 없음

### 표시 개선
- 할인이 적용된 경우 원래 금액을 취소선으로 표시
- 할인 금액을 빨간색 태그로 표시
- 최종 금액을 강조하여 표시

## 4. 사용 방법

1. 결제 추가/수정 모달에서 할인 유형 선택
2. 할인명 입력 (자동 입력됨)
3. 할인 금액 입력 (빠른 버튼 또는 직접 입력)
4. 최종 금액 확인 후 저장

## 5. 주의사항

- 할인 금액은 상품 금액을 초과할 수 없습니다
- 기존 결제 데이터는 영향받지 않습니다 (original_amount = amount로 설정됨)
- 환불 처리 시 할인 정보도 함께 고려됩니다