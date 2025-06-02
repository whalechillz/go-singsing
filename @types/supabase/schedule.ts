// Schedule 관련 타입 정의

export interface ScheduleItem {
  time?: string;
  content: string;
  type?: 'meal' | 'activity' | 'transfer' | 'golf' | 'other';
}

export interface ScheduleEvent {
  event: string;
  schedule_items: ScheduleItem[];
}

export interface TourSchedule {
  id: string;
  tour_id: string | null;
  title: string;  // scheduleTitle이 아닌 title 사용
  description: string | null;
  meal_breakfast: boolean;
  meal_lunch: boolean;
  meal_dinner: boolean;
  date: string | null;
  schedule_date: string | null;
  day_number: number | null;
  schedule_items: ScheduleItem[] | null;  // scheduleEvents가 아닌 schedule_items 사용
  boarding_info: any | null;
  menu_breakfast?: string | null;
  menu_lunch?: string | null;
  menu_dinner?: string | null;
}

// tour_products의 schedule 필드 타입
export interface ProductSchedule {
  scheduleEvents?: ScheduleEvent[];  // 만약 이 구조를 사용한다면
  // 또는
  days?: Array<{
    day: number;
    title: string;
    events: ScheduleItem[];
  }>;
}
