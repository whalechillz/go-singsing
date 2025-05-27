// 메모 관련 타입 정의
export interface Memo {
  id: string;
  participant_id: string;
  tour_id: string;
  category: 'urgent' | 'payment' | 'boarding' | 'request' | 'general';
  content: string;
  status: 'pending' | 'resolved' | 'follow_up';
  priority: 0 | 1 | 2; // 0:보통, 1:중요, 2:긴급
  created_by?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // 관계 데이터
  participant?: {
    name: string;
    phone?: string;
  };
  tour?: {
    title: string;
    start_date: string;
  };
}

export interface MemoTemplate {
  id: string;
  category: string;
  title: string;
  content_template: string;
  usage_count: number;
  created_at: string;
}

// 카테고리별 아이콘 및 색상
export const MEMO_CATEGORIES = {
  urgent: { 
    label: '긴급', 
    icon: '🚨', 
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  payment: { 
    label: '결제', 
    icon: '💳', 
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  boarding: { 
    label: '탑승', 
    icon: '🚗', 
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  request: { 
    label: '요청', 
    icon: '📝', 
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  general: { 
    label: '일반', 
    icon: '📌', 
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  }
} as const;

// 상태별 설정
export const MEMO_STATUS = {
  pending: { label: '대기중', color: 'orange' },
  resolved: { label: '완료', color: 'green' },
  follow_up: { label: '후속조치', color: 'blue' }
} as const;

// 우선순위별 설정
export const MEMO_PRIORITY = {
  0: { label: '보통', color: 'gray' },
  1: { label: '중요', color: 'yellow' },
  2: { label: '긴급', color: 'red' }
} as const;
