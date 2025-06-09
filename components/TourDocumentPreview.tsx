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
  // DAY_INFO 관련 필드
  day_date?: string;
  title?: string;
  meal_breakfast?: boolean;
  meal_lunch?: boolean;
  meal_dinner?: boolean;
  menu_breakfast?: string;
  menu_lunch?: string;
  menu_dinner?: string;
  // 관계 데이터
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
  const [dayInfoItems, setDayInfoItems] = useState<JourneyItem[]>([]);
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

      // 여정 항목 - order_index가 0인 것(DAY_INFO)과 0보다 큰 것(일반 여정) 분리
      const { data: allItems } = await supabase
        .from('tour_journey_items')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_number')
        .order('order_index');

      if (allItems) {
        // DAY_INFO 항목 (order_index = 0)
        const dayInfos = allItems.filter(item => item.order_index === 0);
        setDayInfoItems(dayInfos);

        // 일반 여정 항목 (order_index > 0)
        const journeyItemsData = allItems.filter(item => item.order_index > 0);
        
        // 관계 데이터(spot) 별도 조회
        const itemsWithRelations = await Promise.all(journeyItemsData.map(async (item) => {
          let spot = null;
          
          if (item.spot_id) {
            const { data } = await supabase
              .from('tourist_attractions')
              .select('*')
              .eq('id', item.spot_id)
              .single();
            spot = data;
          }
          
          return { ...item, spot };
        }));
        
        setJourneyItems(itemsWithRelations);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromItem = (item: JourneyItem) => {
    if (item.spot) return item.spot.category;
    return 'others';
  };

  const getIconForItem = (item: JourneyItem) => {
    const category = getCategoryFromItem(item);
    const Icon = categoryConfig[category]?.icon || MoreHorizontal;
    
    // 정적 클래스 맵핑
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
            const dayInfo = dayInfoItems.find(item => item.day_number === day);

            return (
              <div key={day} className="border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Day {day} - {dayInfo?.day_date ? new Date(dayInfo.day_date).toLocaleDateString('ko-KR') : ''}
                  {dayInfo?.title && <span className="ml-2 text-base font-normal">({dayInfo.title})</span>}
                </h2>

                {/* 식사 정보 (DAY_INFO에서 가져옴) */}
                {dayInfo && (
                  <div className="mb-4 flex gap-3 text-sm">
                    {dayInfo.meal_breakfast && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                        조식: {dayInfo.menu_breakfast || 'O'}
                      </span>
                    )}
                    {dayInfo.meal_lunch && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                        중식: {dayInfo.menu_lunch || 'O'}
                      </span>
                    )}
                    {dayInfo.meal_dinner && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                        석식: {dayInfo.menu_dinner || 'O'}
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
                        <div className={`w-3 h-3 rounded-full ${
                          getCategoryFromItem(item) === 'boarding' ? 'bg-blue-500' :
                          getCategoryFromItem(item) === 'tourist_spot' ? 'bg-blue-500' :
                          getCategoryFromItem(item) === 'rest_area' ? 'bg-gray-500' :
                          getCategoryFromItem(item) === 'restaurant' ? 'bg-orange-500' :
                          getCategoryFromItem(item) === 'shopping' ? 'bg-purple-500' :
                          getCategoryFromItem(item) === 'activity' ? 'bg-green-500' :
                          getCategoryFromItem(item) === 'mart' ? 'bg-indigo-500' :
                          getCategoryFromItem(item) === 'golf_round' ? 'bg-emerald-500' :
                          getCategoryFromItem(item) === 'club_meal' ? 'bg-rose-500' :
                          'bg-slate-500'
                        }`}></div>
                        {index < dayItems.length - 1 && (
                          <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gray-300"></div>
                        )}
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          {getIconForItem(item)}
                          <h3 className="font-semibold">
                            {item.spot?.name || '알 수 없음'}
                          </h3>
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
                            {categoryConfig[getCategoryFromItem(item)]?.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {item.spot?.address || ''}
                        </p>

                        {/* 탑승지 추가 정보 */}
                        {item.spot?.category === 'boarding' && item.passenger_count && item.passenger_count > 0 && (
                          <p className="text-sm text-blue-600 mt-1">
                            <Users className="w-3 h-3 inline mr-1" />
                            {item.passenger_count}명 {item.boarding_type}
                          </p>
                        )}

                        {/* 탑승 안내 정보 */}
                        {item.spot?.category === 'boarding' && item.spot?.boarding_info && (
                          <p className="text-sm text-blue-600 mt-1">
                            {item.spot.boarding_info}
                          </p>
                        )}

                        {/* 식사 정보 */}
                        {item.meal_type && (
                          <p className="text-sm text-orange-600 mt-1">
                            <Utensils className="w-3 h-3 inline mr-1" />
                            {item.meal_type}: {item.meal_menu}
                          </p>
                        )}

                        {/* 비고 */}
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
                        Day {item.day_number} - {item.spot?.name}
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
