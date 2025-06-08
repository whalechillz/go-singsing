"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  FileText, Calendar, MapPin, Clock, Users, 
  Bus, Utensils, Camera, Coffee, Navigation,
  ShoppingCart, Award, MoreHorizontal, Map as MapIcon
} from 'lucide-react';

interface TourDocumentPreviewProps {
  tourId: string;
}

interface JourneyItem {
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
  notes?: string;
  boarding_place?: any;
  spot?: any;
}

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

export default function TourDocumentPreview({ tourId }: TourDocumentPreviewProps) {
  const [tourInfo, setTourInfo] = useState<any>(null);
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'category' | 'map'>('timeline');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 투어 정보
      const { data: tourData } = await supabase
        .from('singsing_tours')
        .select(`
          *,
          tour_product:tour_product_id(*)
        `)
        .eq('id', tourId)
        .single();
      
      setTourInfo(tourData);

      // 여정 항목
      const { data: items } = await supabase
        .from('tour_journey_items')
        .select(`
          *,
          boarding_place:boarding_place_id(
            id, name, address, boarding_main, boarding_sub, parking_info
          ),
          spot:spot_id(
            id, name, category, sub_category, address, description, 
            main_image_url, recommended_duration, features, tags,
            parking_info, entrance_fee
          )
        `)
        .eq('tour_id', tourId)
        .order('day_number')
        .order('order_index');

      setJourneyItems(items || []);

      // 일정 정보 (식사 정보 등)
      const { data: scheduleData } = await supabase
        .from('singsing_schedules')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_number');
      
      setSchedules(scheduleData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromItem = (item: JourneyItem) => {
    if (item.boarding_place_id) return 'boarding';
    if (item.spot) return item.spot.category;
    return 'others';
  };

  const getIconForItem = (item: JourneyItem) => {
    const category = getCategoryFromItem(item);
    const Icon = categoryConfig[category]?.icon || MoreHorizontal;
    return <Icon className={`w-4 h-4 text-${categoryConfig[category]?.color || 'gray'}-500`} />;
  };

  // 일자별로 그룹화
  const groupedByDay = journeyItems.reduce((acc, item) => {
    if (!acc[item.day_number]) acc[item.day_number] = [];
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, JourneyItem[]>);

  const days = Object.keys(groupedByDay).map(Number).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold mb-2">일정표</h1>
        <p className="text-lg text-gray-600">
          {tourInfo?.tour_product?.name} - {tourInfo?.start_date}
        </p>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          <Navigation className="w-4 h-4" />
          타임라인
        </button>
        <button
          onClick={() => setViewMode('category')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            viewMode === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          카테고리
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
          disabled
        >
          <MapIcon className="w-4 h-4" />
          지도
        </button>
      </div>

      {/* 일자 선택 (카테고리 뷰에서만) */}
      {viewMode === 'category' && (
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setSelectedDay(null)}
            className={`px-4 py-2 rounded-lg ${
              selectedDay === null ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            전체
          </button>
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg ${
                selectedDay === day ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      )}

      {/* 타임라인 뷰 */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {days.map(day => {
            const dayItems = groupedByDay[day];
            const schedule = schedules.find(s => s.day_number === day);

            return (
              <div key={day} className="border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Day {day} - {schedule?.date ? new Date(schedule.date).toLocaleDateString('ko-KR') : ''}
                </h2>

                {/* 식사 정보 */}
                {schedule && (
                  <div className="mb-4 flex gap-3 text-sm">
                    {schedule.meal_breakfast && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                        조식: {schedule.menu_breakfast || 'O'}
                      </span>
                    )}
                    {schedule.meal_lunch && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                        중식: {schedule.menu_lunch || 'O'}
                      </span>
                    )}
                    {schedule.meal_dinner && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                        석식: {schedule.menu_dinner || 'O'}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {dayItems.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                      {/* 시간 */}
                      <div className="w-20 text-right text-sm">
                        {item.arrival_time && (
                          <div className="font-medium">{item.arrival_time}</div>
                        )}
                        {item.stay_duration && (
                          <div className="text-gray-500 text-xs">{item.stay_duration}</div>
                        )}
                      </div>

                      {/* 연결선 */}
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full bg-${categoryConfig[getCategoryFromItem(item)]?.color || 'gray'}-500`}></div>
                        {index < dayItems.length - 1 && (
                          <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gray-300"></div>
                        )}
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          {getIconForItem(item)}
                          <h3 className="font-semibold">
                            {item.boarding_place?.name || item.spot?.name || '알 수 없음'}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${categoryConfig[getCategoryFromItem(item)]?.color || 'gray'}-100 text-${categoryConfig[getCategoryFromItem(item)]?.color || 'gray'}-700`}>
                            {categoryConfig[getCategoryFromItem(item)]?.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {item.boarding_place?.address || item.spot?.address || ''}
                        </p>

                        {/* 추가 정보 */}
                        {item.passenger_count && item.passenger_count > 0 && (
                          <p className="text-sm text-blue-600 mt-1">
                            <Users className="w-3 h-3 inline mr-1" />
                            {item.passenger_count}명 {item.boarding_type}
                          </p>
                        )}

                        {item.meal_type && (
                          <p className="text-sm text-orange-600 mt-1">
                            <Utensils className="w-3 h-3 inline mr-1" />
                            {item.meal_type}: {item.meal_menu}
                          </p>
                        )}

                        {item.notes && (
                          <p className="text-sm text-gray-500 italic mt-1">{item.notes}</p>
                        )}

                        {/* 이동 정보 */}
                        {index < dayItems.length - 1 && (item.distance_from_prev || item.duration_from_prev) && (
                          <p className="text-xs text-gray-400 mt-2">
                            다음 장소까지: {item.duration_from_prev} • {item.distance_from_prev}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 카테고리 뷰 */}
      {viewMode === 'category' && (
        <div className="space-y-6">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const categoryItems = journeyItems.filter(item => 
              getCategoryFromItem(item) === key &&
              (selectedDay === null || item.day_number === selectedDay)
            );

            if (categoryItems.length === 0) return null;

            return (
              <div key={key} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  {React.createElement(config.icon, { className: 'w-5 h-5' })}
                  {config.label}
                  <span className="text-sm text-gray-500">({categoryItems.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryItems.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded p-3">
                      <div className="font-medium">
                        Day {item.day_number} - {item.boarding_place?.name || item.spot?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.arrival_time && `${item.arrival_time} 도착`}
                        {item.stay_duration && ` (${item.stay_duration})`}
                      </div>
                      {item.meal_type && (
                        <div className="text-sm text-orange-600">
                          {item.meal_type}: {item.meal_menu}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 지도 뷰 (미구현) */}
      {viewMode === 'map' && (
        <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">지도 뷰는 준비 중입니다</p>
        </div>
      )}

      {/* 하단 정보 */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
        <p>이 일정표는 변경될 수 있습니다.</p>
        <p className="mt-1">문의: {tourInfo?.contact_info || '070-0000-0000'}</p>
      </div>
    </div>
  );
}
