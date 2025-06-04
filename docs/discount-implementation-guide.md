# PaymentManagerV3 할인 기능 추가 가이드

## 1. Import 추가
```typescript
// 상단 import 섹션에 추가
import DiscountSection from './DiscountSection';
import { Tag } from 'lucide-react'; // lucide-react import에 Tag 추가
```

## 2. handleSubmit 함수 수정
handleSubmit 함수에서 결제 금액 검증 부분을 수정해야 합니다:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 할인 금액이 상품 금액을 초과하는지 검증
  if (form.discount_amount > form.amount) {
    alert("할인 금액이 상품 금액을 초과할 수 없습니다.");
    return;
  }
  
  // 최종 금액 계산
  const finalAmount = form.amount - form.discount_amount;
  
  // 기존 검증 코드에서 form.amount를 finalAmount로 변경
  // 예: totalAfterPayment = totalPaid + finalAmount
```

## 3. handleSubmit에서 DB 저장 시 할인 정보 추가
새로운 결제 추가/수정 시 할인 정보를 포함:

```typescript
// 개별 결제 처리
const payload = {
  tour_id: form.tour_id,
  participant_id: form.participant_id,
  payer_id: form.payer_id || form.participant_id,
  payment_method: form.payment_method,
  amount: finalAmount, // 최종 금액을 amount로 저장
  is_group_payment: false,
  receipt_type: form.receipt_type,
  receipt_requested: form.receipt_requested,
  payment_type: form.payment_type,
  payment_status: form.payment_status,
  payment_date: form.payment_date,
  note: form.note,
  // 할인 정보 추가
  discount_amount: form.discount_amount,
  discount_type: form.discount_type,
  discount_name: form.discount_name,
  original_amount: form.amount, // 원래 금액
  final_amount: finalAmount // 최종 금액
};
```

## 4. 메모 필드 다음에 할인 UI 추가
결제 추가/수정 모달에서 메모 textarea 다음에 추가:

```typescript
{/* 메모 */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    메모
  </label>
  <textarea
    className="w-full border rounded-lg px-3 py-2"
    rows={3}
    value={form.note}
    onChange={(e) => setForm({ ...form, note: e.target.value })}
    placeholder="추가 메모사항"
  />
</div>

{/* 할인 정보 추가 */}
<DiscountSection form={form} setForm={setForm} />
```

## 5. 결제 목록에서 할인 정보 표시
금액 표시 부분을 수정:

```typescript
<td className="px-4 py-3">
  <div>
    {payment.discount_amount && payment.discount_amount > 0 ? (
      <div>
        <div className="text-sm text-gray-500 line-through">
          {(payment.original_amount || payment.amount).toLocaleString()}원
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${payment.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {payment.amount < 0 ? '-' : ''}{Math.abs(payment.final_amount || payment.amount).toLocaleString()}원
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Tag className="w-3 h-3" />
            -{payment.discount_amount.toLocaleString()}
          </span>
        </div>
      </div>
    ) : (
      <span className={`font-medium ${payment.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {payment.amount < 0 ? '-' : ''}{Math.abs(payment.amount).toLocaleString()}원
      </span>
    )}
  </div>
</td>
```

## 6. 통계 계산 시 최종 금액 사용
stats 계산 부분을 수정하여 final_amount를 사용:

```typescript
const stats = {
  total: filteredPaymentsForStats.length,
  totalAmount: filteredPaymentsForStats.filter(p => p.payment_status !== 'refunded' && p.amount > 0).reduce((sum, p) => sum + (p.final_amount || p.amount), 0),
  depositAmount: filteredPaymentsForStats.filter(p => p.payment_type === 'deposit' && p.payment_status !== 'refunded' && p.amount > 0).reduce((sum, p) => sum + (p.final_amount || p.amount), 0),
  balanceAmount: filteredPaymentsForStats.filter(p => p.payment_type === 'balance' && p.payment_status !== 'refunded' && p.amount > 0).reduce((sum, p) => sum + (p.final_amount || p.amount), 0),
  // ...
};
```

## 7. 편집 시 할인 정보 로드
수정 버튼 클릭 시 할인 정보도 form에 로드:

```typescript
setForm({
  // ... 기존 필드들
  // 할인 관련 필드
  discount_amount: payment.discount_amount || 0,
  discount_type: payment.discount_type || '',
  discount_name: payment.discount_name || '',
  original_amount: payment.original_amount || payment.amount,
  final_amount: payment.final_amount || payment.amount
});
```

## 구현 순서
1. DiscountSection import 추가
2. 메모 필드 다음에 `<DiscountSection form={form} setForm={setForm} />` 추가
3. handleSubmit 함수에서 할인 검증 및 최종 금액 계산 추가
4. DB 저장 시 할인 정보 포함
5. 결제 목록에서 할인 정보 표시
6. 통계 계산 시 final_amount 사용

이렇게 수정하면 할인 기능이 완성됩니다!