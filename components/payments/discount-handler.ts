// components/payments/discount-handler.ts
// 할인 관련 유틸리티 함수들

export const calculateFinalAmount = (originalAmount: number, discountAmount: number): number => {
  return Math.max(0, originalAmount - discountAmount);
};

export const getDiscountTypeName = (type: string): string => {
  switch (type) {
    case 'coupon': return '쿠폰';
    case 'event': return '이벤트';
    case 'vip': return 'VIP';
    case 'special': return '특별할인';
    case 'other': return '기타';
    default: return '';
  }
};

export const validateDiscount = (originalAmount: number, discountAmount: number): boolean => {
  if (discountAmount < 0) return false;
  if (discountAmount > originalAmount) return false;
  return true;
};

export const getDefaultDiscountName = (type: string): string => {
  switch (type) {
    case 'coupon': return '신규가입 쿠폰';
    case 'event': return '이벤트 할인';
    case 'vip': return 'VIP 할인';
    case 'special': return '특별 할인';
    default: return '';
  }
};