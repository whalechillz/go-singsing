// RefundModal.tsx 수정 사항
// 환불 시 할인이 적용된 경우 final_amount를 기준으로 계산하도록 수정

/* 찾을 코드:
case REFUND_TYPES.FULL_CANCELLATION:
  baseAmount = payment.amount;
  refundRate = 0.8; // 기본 80%
  break;

수정할 코드:
case REFUND_TYPES.FULL_CANCELLATION:
  // 할인이 적용된 경우 최종 금액 기준으로 환불
  baseAmount = payment.final_amount || payment.amount;
  refundRate = 0.8; // 기본 80%
  break;
*/

/* 찾을 코드:
note: `${participant.name}님 ${refundTypeText} 환불 | 환불계좌: ${refundAccount} | 사유: ${refundReasonText} | 환불률: ${Math.round((refundAmount / payment.amount) * 100)}%`

수정할 코드:
note: `${participant.name}님 ${refundTypeText} 환불 | 환불계좌: ${refundAccount} | 사유: ${refundReasonText} | 환불률: ${Math.round((refundAmount / (payment.final_amount || payment.amount)) * 100)}%`
*/