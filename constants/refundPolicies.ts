// 환불 정책 설정
export const REFUND_POLICIES = {
  // 홀아웃 환불 - 정액 방식 (순천 파인힐스 기준)
  holeOut: {
    7: { 
      greenFee: 55000, 
      cartFee: 16000, 
      total: 71000,
      description: "7홀 아웃 (그린피 55,000원 + 카트비 16,000원)"
    },
    8: { 
      greenFee: 50000, 
      cartFee: 14000, 
      total: 64000,
      description: "8홀 아웃 (그린피 50,000원 + 카트비 14,000원)"
    },
    9: { 
      greenFee: 45000, 
      cartFee: 12500, 
      total: 57500,
      description: "9홀 아웃 (그린피 45,000원 + 카트비 12,500원)"
    },
    10: { 
      greenFee: 40000, 
      cartFee: 11000, 
      total: 51000,
      description: "10홀 아웃 (그린피 40,000원 + 카트비 11,000원)"
    },
    11: { 
      greenFee: 35000, 
      cartFee: 9500, 
      total: 44500,
      description: "11홀 아웃 (그린피 35,000원 + 카트비 9,500원)"
    },
    12: { 
      greenFee: 30000, 
      cartFee: 8000, 
      total: 38000,
      description: "12홀 아웃 (그린피 30,000원 + 카트비 8,000원)"
    },
    13: { 
      greenFee: 25000, 
      cartFee: 6500, 
      total: 31500,
      description: "13홀 아웃 (그린피 25,000원 + 카트비 6,500원)"
    },
    14: { 
      greenFee: 20000, 
      cartFee: 5000, 
      total: 25000,
      description: "14홀 아웃 (그린피 20,000원 + 카트비 5,000원)"
    },
    15: { 
      greenFee: 15000, 
      cartFee: 3500, 
      total: 18500,
      description: "15홀 아웃 (그린피 15,000원 + 카트비 3,500원)"
    },
    16: { 
      greenFee: 10000, 
      cartFee: 2000, 
      total: 12000,
      description: "16홀 아웃 (그린피 10,000원 + 카트비 2,000원)"
    },
    17: { 
      greenFee: 5000, 
      cartFee: 1000, 
      total: 6000,
      description: "17홀 아웃 (그린피 5,000원 + 카트비 1,000원)"
    },
    18: { 
      greenFee: 0, 
      cartFee: 0, 
      total: 0,
      description: "18홀 완주 (환불 없음)"
    }
  },
  
  // 홀아웃 환불 비율 방식 (기존 방식 - 선택적 사용)
  holeOutPercentage: {
    9: { rate: 0.5, description: "9홀 플레이 (50% 환불)" },
    12: { rate: 0.3, description: "12홀 플레이 (30% 환불)" },
    15: { rate: 0.2, description: "15홀 플레이 (20% 환불)" },
    18: { rate: 0, description: "18홀 완주 (환불 없음)" }
  },
  
  // 일별 취소 환불 비율
  dailyCancellation: {
    weather: { rate: 1.0, description: "기상 악화 (100% 환불)" },
    course_condition: { rate: 1.0, description: "코스 컨디션 (100% 환불)" },
    customer_request: { rate: 0.8, description: "고객 요청 (80% 환불)" },
    no_show: { rate: 0, description: "노쇼 (환불 없음)" }
  },
  
  // 사전 취소 통보 기간별 환불
  advanceNotice: {
    7: { rate: 1.0, description: "7일 전 취소 (100% 환불)" },
    5: { rate: 0.9, description: "5일 전 취소 (90% 환불)" },
    3: { rate: 0.7, description: "3일 전 취소 (70% 환불)" },
    1: { rate: 0.5, description: "1일 전 취소 (50% 환불)" },
    0: { rate: 0, description: "당일 취소 (환불 없음)" }
  },
  
  // 서비스별 환불 가능 여부
  serviceRefundable: {
    green_fee: true,
    cart_fee: true,
    meal: false,       // 식사는 환불 불가
    accommodation: false, // 숙박은 환불 불가
    lessons: true,     // 레슨은 환불 가능
    spa: true         // 스파는 환불 가능
  },
  
  // 환불 불가 항목
  nonRefundableItems: [
    "식사비",
    "숙박비", 
    "여행자보험",
    "항공료",
    "관광비"
  ]
};

// 환불 타입
export const REFUND_TYPES = {
  HOLE_OUT: 'hole_out',
  DAILY_CANCELLATION: 'daily_cancellation',
  FULL_CANCELLATION: 'full_cancellation',
  PARTIAL_SERVICE: 'partial_service',
  OTHER: 'other'
} as const;

// 환불 사유
export const REFUND_REASONS = {
  WEATHER: 'weather',
  COURSE_CONDITION: 'course_condition',
  CUSTOMER_REQUEST: 'customer_request',
  NO_SHOW: 'no_show',
  OTHER: 'other'
} as const;

// 환불 계산 함수
export function calculateRefund(
  originalAmount: number,
  refundType: keyof typeof REFUND_TYPES,
  details: any
): number {
  switch (refundType) {
    case 'HOLE_OUT':
      const holesPlayed = details.holesPlayed || 9;
      // 정액 방식
      if (!details.usePercentageMode) {
        const policy = REFUND_POLICIES.holeOut[holesPlayed as keyof typeof REFUND_POLICIES.holeOut];
        return policy?.total || 0;
      }
      // 비율 방식
      else {
        const percentagePolicy = REFUND_POLICIES.holeOutPercentage[holesPlayed as keyof typeof REFUND_POLICIES.holeOutPercentage];
        return originalAmount * (percentagePolicy?.rate || 0);
      }
      
    case 'DAILY_CANCELLATION':
      const reason = details.reason || 'other';
      const policy2 = REFUND_POLICIES.dailyCancellation[reason as keyof typeof REFUND_POLICIES.dailyCancellation];
      const daysRefunded = details.daysRefunded || 1;
      const dailyAmount = originalAmount / (details.totalDays || 1);
      return dailyAmount * daysRefunded * (policy2?.rate || 0);
      
    default:
      return 0;
  }
}
