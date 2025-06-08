import React from "react";
import { 
  MapPin, Clock, Bus, Coffee, Utensils, 
  Camera, ShoppingCart, MoreHorizontal, Award, Navigation
} from 'lucide-react';

type Tour = {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  schedule_notice?: string;
};

type Schedule = {
  id: string;
  date: string;
  title: string;
  description?: string;
  meal_breakfast?: boolean;
  meal_lunch?: boolean;
  meal_dinner?: boolean;
  tee_time?: string;
  course?: string;
  menu_breakfast?: string;
  menu_lunch?: string;
  menu_dinner?: string;
};

type JourneyItem = {
  id?: string;
  tour_id: string;
  day_number: number;
  order_index: number;
  boarding_place_id?: string;
  spot_id?: string;
  arrival_time?: string;
  departure_time?: string;
  stay_duration?: string;
  distance_from_prev?: string;
  duration_from_prev?: string;
  passenger_count?: number;
  boarding_type?: string;
  meal_type?: string;
  meal_menu?: string;
  golf_info?: any;
  notes?: string;
  display_options?: any;
  boarding_place?: any;
  spot?: any;
};

type Props = {
  tour: Tour;
  schedules: Schedule[];
  journeyItems?: JourneyItem[];
};

// 카테고리 설정
const categoryConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string;
}> = {
  'boarding': { label: '탑승지', icon: Bus, color: 'blue' },
  'tourist_spot': { label: '관광명소', icon: Camera, color: 'blue' },
  'rest_area': { label: '휴게소', icon: Coffee, color: 'gray' },
  'restaurant': { label: '맛집', icon: Utensils, color: 'orange' },
  'shopping': { label: '쇼핑', icon: ShoppingCart, color: 'purple' },
  'activity': { label: '액티비티', icon: Navigation, color: 'green' },
  'mart': { label: '마트', icon: ShoppingCart, color: 'indigo' },
  'golf_round': { label: '골프 라운드', icon: Award, color: 'emerald' },
  'club_meal': { label: '클럽식', icon: Utensils, color: 'rose' },
  'others': { label: '기타', icon: MoreHorizontal, color: 'slate' }
};

const getCategoryFromItem = (item: JourneyItem) => {
  if (item.boarding_place_id) return 'boarding';
  if (item.spot) return item.spot.category;
  return 'others';
};

const getIconForItem = (item: JourneyItem) => {
  const category = getCategoryFromItem(item);
  const Icon = categoryConfig[category]?.icon || MoreHorizontal;
  
  const colorClasses: Record<string, string> = {
    'blue': 'text-blue-500',
    'gray': 'text-gray-500',
    'orange': 'text-orange-500',
    'purple': 'text-purple-500',
    'green': 'text-green-500',
    'indigo': 'text-indigo-500',
    'emerald': 'text-emerald-500',
    'rose': 'text-rose-500',
    'slate': 'text-slate-500'
  };
  
  const colorClass = colorClasses[categoryConfig[category]?.color || 'gray'] || 'text-gray-500';
  return <Icon className={`w-4 h-4 ${colorClass}`} />;
};

const TourScheduleInfo: React.FC<Props> = ({ tour, schedules, journeyItems = [] }) => {
  // 일정별로 여정 아이템 그룹핑
  const journeyItemsByDay = journeyItems.reduce((acc, item) => {
    if (!acc[item.day_number]) {
      acc[item.day_number] = [];
    }
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, JourneyItem[]>);

  return (
    <div className="mb-8">
      <div className="space-y-6">
        {schedules.map((schedule, idx) => {
          const dayNumber = schedule.title?.match(/Day\s*(\d+)/i)?.[1] || (idx + 1);
          const dayJourneyItems = journeyItemsByDay[Number(dayNumber)] || [];
          
          return (
            <div key={schedule.id || idx} className="day-schedule bg-white border border-gray-200 rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-blue-800 font-bold text-lg">{schedule.date} {schedule.title}</div>
                {schedule.tee_time && <div className="text-sm text-blue-600 font-semibold">티오프: {schedule.tee_time}</div>}
              </div>
              
              {/* 여정 아이템 표시 */}
              {dayJourneyItems.length > 0 ? (
                <div className="space-y-2">
                  {dayJourneyItems.map((item, itemIdx) => (
                    <div key={item.id || itemIdx} className="flex items-start gap-3 py-2 border-b last:border-b-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                        {item.order_index}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getIconForItem(item)}
                          <span className="font-medium">
                            {item.boarding_place?.name || item.spot?.name || '알 수 없음'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            getCategoryFromItem(item) === 'boarding' ? 'bg-blue-100 text-blue-700' :
                            getCategoryFromItem(item) === 'tourist_spot' ? 'bg-blue-100 text-blue-700' :
                            getCategoryFromItem(item) === 'rest_area' ? 'bg-gray-100 text-gray-700' :
                            getCategoryFromItem(item) === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                            getCategoryFromItem(item) === 'shopping' ? 'bg-purple-100 text-purple-700' :
                            getCategoryFromItem(item) === 'activity' ? 'bg-green-100 text-green-700' :
                            getCategoryFromItem(item) === 'mart' ? 'bg-indigo-100 text-indigo-700' :
                            getCategoryFromItem(item) === 'golf_round' ? 'bg-emerald-100 text-emerald-700' :
                            getCategoryFromItem(item) === 'club_meal' ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {categoryConfig[getCategoryFromItem(item)]?.label || '기타'}
                          </span>
                        </div>
                        
                        {(item.boarding_place?.address || item.spot?.address) && (
                          <div className="text-xs text-gray-600 mb-1">
                            {item.boarding_place?.address || item.spot?.address}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {item.arrival_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.arrival_time} 도착
                            </span>
                          )}
                          {item.departure_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.departure_time} 출발
                            </span>
                          )}
                          {item.stay_duration && (
                            <span className="text-gray-500">
                              체류: {item.stay_duration}
                            </span>
                          )}
                          {item.meal_type && item.meal_menu && (
                            <span className="text-orange-600">
                              {item.meal_type}: {item.meal_menu}
                            </span>
                          )}
                        </div>
                        
                        {/* 골프 정보 표시 */}
                        {item.golf_info && (item.golf_info.golf_club || item.golf_info.tee_time || item.golf_info.course_info) && (
                          <div className="mt-2 bg-emerald-50 rounded p-2 text-xs">
                            <div className="font-semibold text-emerald-800 mb-1">골프 라운드 정보</div>
                            {item.golf_info.golf_club && (
                              <div className="text-emerald-700">골프장: {item.golf_info.golf_club}</div>
                            )}
                            {item.golf_info.tee_time && (
                              <div className="text-emerald-700">티타임: {item.golf_info.tee_time}</div>
                            )}
                            {item.golf_info.course_info && (
                              <div className="text-emerald-700">코스: {item.golf_info.course_info}</div>
                            )}
                          </div>
                        )}
                        
                        {item.notes && (
                          <div className="text-xs text-gray-500 italic mt-1">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 여정 아이템이 없을 때 기존 일정 표시 (호환성 유지)
                schedule.description && (
                  <div className="mb-2 text-gray-800 text-sm">
                    {schedule.description.split(/\r?\n/).map((line, i) => (
                      <li key={i} className="list-none mb-0.5">{line}</li>
                    ))}
                  </div>
                )
              )}
              
              {/* 식사 정보 */}
              <div className="flex gap-4 mt-3">
                <div className="bg-blue-50 rounded px-3 py-1 text-xs font-semibold text-blue-800">
                  조식: {schedule.meal_breakfast ? 'O' : 'X'}
                </div>
                <div className="bg-blue-50 rounded px-3 py-1 text-xs font-semibold text-blue-800">
                  중식: {schedule.meal_lunch ? 'O' : 'X'}
                </div>
                <div className="bg-blue-50 rounded px-3 py-1 text-xs font-semibold text-blue-800">
                  석식: {schedule.meal_dinner ? 'O' : 'X'}
                </div>
              </div>
              
              {(schedule.menu_breakfast || schedule.menu_lunch || schedule.menu_dinner) && (
                <div className="mt-2 bg-gray-50 rounded p-3 text-xs">
                  <div className="font-bold text-blue-700 mb-1">식사 메뉴</div>
                  <div className="flex flex-col gap-1">
                    {schedule.menu_breakfast && <div><span className="font-semibold">조식:</span> {schedule.menu_breakfast}</div>}
                    {schedule.menu_lunch && <div><span className="font-semibold">중식:</span> {schedule.menu_lunch}</div>}
                    {schedule.menu_dinner && <div><span className="font-semibold">석식:</span> {schedule.menu_dinner}</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 일정표 하단 안내문구(투어 전체) */}
      {tour.schedule_notice && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-200 p-4 text-gray-700 text-sm rounded">
          {tour.schedule_notice}
        </div>
      )}
    </div>
  );
};

export default TourScheduleInfo;