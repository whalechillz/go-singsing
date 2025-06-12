export interface TourData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  tour_product_id: string;
  tour_period?: string;
  show_staff_info?: boolean;
  show_footer_message?: boolean;
  show_company_phones?: boolean;
  show_golf_phones?: boolean;
  company_phone?: string;
  company_mobile?: string;
  golf_reservation_phone?: string;
  golf_reservation_mobile?: string;
  footer_message?: string;
  special_notices?: any[];
  reservation_notices?: any[];
  other_notices?: string;
  schedules?: Schedule[];
  staff?: Staff[];
  singsing_tour_staff?: Staff[];
  
  // 문서별 전화번호 표시 설정
  phone_display_settings?: {
    customer_schedule?: {
      show_company_phone?: boolean;
      show_driver_phone?: boolean;
      show_guide_phone?: boolean;
      show_golf_phone?: boolean;
    };
    customer_boarding?: {
      show_company_phone?: boolean;
      show_driver_phone?: boolean;
      show_guide_phone?: boolean;
    };
    staff_boarding?: {
      show_company_phone?: boolean;
      show_driver_phone?: boolean;
      show_guide_phone?: boolean;
      show_manager_phone?: boolean;
    };
    room_assignment?: {
      show_company_phone?: boolean;
      show_driver_phone?: boolean;
      show_guide_phone?: boolean;
    };
    room_assignment_staff?: {
      show_company_phone?: boolean;
      show_driver_phone?: boolean;
      show_guide_phone?: boolean;
      show_manager_phone?: boolean;
    };
    tee_time?: {
      show_company_phone?: boolean;
      show_golf_phone?: boolean;
    };
    simplified?: {
      show_company_phone?: boolean;
    };
  };
}

export interface Schedule {
  id: string;
  tour_id: string;
  date: string;
  day_number: number;
  title: string;
  meal_breakfast: boolean;
  meal_lunch: boolean;
  meal_dinner: boolean;
  menu_breakfast: string;
  menu_lunch: string;
  menu_dinner: string;
  schedule_items: ScheduleItem[];
  description?: string;
}

export interface ScheduleItem {
  time: string;
  content: string;
  attraction_data?: any;
  display_options?: {
    show_image?: boolean;
  };
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  room_number?: string;
  display_order?: number;
}

export interface ProductData {
  id: string;
  name: string;
  golf_course?: string;
  hotel?: string;
  courses?: string[];
  included_items?: string;
  excluded_items?: string;
  general_notices?: any[];
  usage_round?: string;
  usage_hotel?: string;
  usage_meal?: string;
  usage_bus?: string;
  usage_tour?: string;
  usage_locker?: string;
}

export interface BoardingPlace {
  id: string;
  tour_id: string;
  departure_time?: string;
  arrival_time?: string;
  order_no: number;
  boarding_place?: {
    id: string;
    name: string;
    address?: string;
    description?: string;
    map_url?: string;
    boarding_main?: string;
    boarding_sub?: string;
    parking_main?: string;
    parking_map_url?: string;
    parking_info?: string;
    district?: string;
  } | null;
  is_waypoint: boolean;
}

export interface Waypoint {
  id: string;
  tour_id: string;
  waypoint_name: string;
  waypoint_time?: string;
  waypoint_duration?: number;
  waypoint_description?: string;
  visit_date?: string;
  order_no: number;
  is_waypoint: boolean;
  attraction_data?: any;
}

export interface JourneyItem {
  id: string;
  tour_id: string;
  day_number: number;
  order_index: number;
  spot_id?: string;
  spot?: any;
  arrival_time?: string;
  departure_time?: string;
  stay_duration?: number;
  meal_type?: string;
  meal_menu?: string;
  boarding_type?: string;
  notes?: string;
  day_date?: string;
  meal_breakfast?: boolean;
  meal_lunch?: boolean;
  meal_dinner?: boolean;
  menu_breakfast?: string;
  menu_lunch?: string;
  menu_dinner?: string;
  display_options?: {
    show_image?: boolean;
  };
}

export const DOCUMENT_TYPES = [
  { id: 'customer_schedule', label: '일정표', icon: '📋' },
  { id: 'staff_schedule', label: '일정표 (스탭용)', icon: '📋' },
  { id: 'customer_boarding', label: '탑승안내 (고객용)', icon: '🚌' },
  { id: 'staff_boarding', label: '탑승안내 (스탭용)', icon: '👥' },
  { id: 'room_assignment', label: '객실배정 (고객용)', icon: '🏨' },
  { id: 'room_assignment_staff', label: '객실배정 (스탭용)', icon: '🏨' },
  { id: 'customer_timetable', label: '티타임표 (고객용)', icon: '⛳' },
  { id: 'staff_timetable', label: '티타임표 (스탭용)', icon: '⛳' },
  { id: 'simplified', label: '간편일정', icon: '📄' }
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number]['id'];
