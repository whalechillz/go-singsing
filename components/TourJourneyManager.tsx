"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  MapPin, Clock, Navigation, Coffee, Utensils, 
  Camera, Plus, Filter, Map as MapIcon, List, 
  Bus, Users, ChevronUp, ChevronDown, Edit2, 
  Trash2, Save, X, Award, ShoppingCart, MoreHorizontal,
  Calendar, Grip, Check, Route
} from 'lucide-react';

interface TourJourneyManagerProps {
  tourId: string;
}

interface JourneyItem {
  id?: string;
  tour_id: string;
  day_number: number;
  order_index: number;
  // type?: string;  // 'DAY_INFO' | 'BOARDING' | 'WAYPOINT' | 'MEAL' | 'SPOT' | 'ARRIVAL' 등
  boarding_place_id?: string;
  spot_id?: string;
  arrival_time?: string;
  departure_time?: string;
  start_time?: string;
  end_time?: string;
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
  waypoint_name?: string;
  is_tourist?: boolean;
  description?: string;
  day_date?: string;
  title?: string;
  meal_breakfast?: boolean;
  meal_lunch?: boolean;
  meal_dinner?: boolean;
  menu_breakfast?: string;
  menu_lunch?: string;
  menu_dinner?: string;
  // 관계 데이터
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

export default function TourJourneyManager({ tourId }: TourJourneyManagerProps) {
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([]);
  const [boardingPlaces, setBoardingPlaces] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [maxDays, setMaxDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<JourneyItem | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'category' | 'map'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tourInfo, setTourInfo] = useState<any>(null);
  
  // 폼 데이터
  const [formData, setFormData] = useState<JourneyItem>({
    tour_id: tourId,
    day_number: selectedDay,
    order_index: 0,
    boarding_place_id: undefined,
    spot_id: undefined,
    arrival_time: '',
    departure_time: '',
    stay_duration: '',
    distance_from_prev: '',
    duration_from_prev: '',
    passenger_count: 0,
    boarding_type: '',
    meal_type: '',
    meal_menu: '',
    golf_info: {},
    notes: '',
    display_options: { show_image: true }
  });

  useEffect(() => {
    // Vercel 디버깅
    console.log('[TourJourneyManager] useEffect triggered:', {
      tourId: tourId,
      selectedDay: selectedDay,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    });
    
    if (tourId) {
      // 투어 정보 먼저 가져오기
      const loadTourInfo = async () => {
        const { data: tour } = await supabase
          .from('singsing_tours')
          .select('*')
          .eq('id', tourId)
          .single();
        
        if (tour) {
          setTourInfo(tour);
        }
      };
      
      loadTourInfo().then(() => {
        fetchData();
      });
    }
  }, [tourId, selectedDay]);

  // DAY_INFO의 식사 정보 업데이트 함수
  const updateDayInfoMeals = async (dayNumber: number, mealType: string, menu: string) => {
    try {
      // 현재 DAY_INFO 가져오기
      const { data: dayInfo } = await supabase
        .from('tour_journey_items')
        .select('*')
        .eq('tour_id', tourId)
        .eq('day_number', dayNumber)
        .eq('order_index', 0)  // DAY_INFO는 항상 order_index가 0
        .single();
      
      if (dayInfo) {
        let updateData: any = {};
        
        if (mealType === '조식') {
          updateData.meal_breakfast = true;
          updateData.menu_breakfast = menu;
        } else if (mealType === '중식') {
          updateData.meal_lunch = true;
          updateData.menu_lunch = menu;
        } else if (mealType === '석식') {
          updateData.meal_dinner = true;
          updateData.menu_dinner = menu;
        }
        
        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from('tour_journey_items')
            .update(updateData)
            .eq('id', dayInfo.id);
          
          if (error) {
            console.error('Error updating DAY_INFO meals:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in updateDayInfoMeals:', error);
    }
  };

  // DAY_INFO 아이템 생성/업데이트 함수
  const ensureDayInfo = async (dayNumber: number) => {
    try {
      // 날짜 계산
      if (!tourInfo) return;
      
      const startDate = new Date(tourInfo.start_date);
      const dayDate = new Date(startDate.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000);
      
      // 기존 DAY_INFO 확인
      const { data: existingDayInfo } = await supabase
        .from('tour_journey_items')
        .select('*')
        .eq('tour_id', tourId)
        .eq('day_number', dayNumber)
        .eq('order_index', 0)  // DAY_INFO는 항상 order_index가 0
        .single();
      
      if (!existingDayInfo) {
        // DAY_INFO 생성
        const { error } = await supabase
          .from('tour_journey_items')
          .insert({
            tour_id: tourId,
            day_number: dayNumber,
            order_index: 0,
            // type: 'DAY_INFO',
            day_date: dayDate.toISOString().split('T')[0],
            title: `Day ${dayNumber} 일정`,
            meal_breakfast: false,
            meal_lunch: false,
            meal_dinner: false,
            menu_breakfast: '',
            menu_lunch: '',
            menu_dinner: ''
          });
        
        if (error) {
          console.error('Error creating DAY_INFO:', error);
        }
      }
    } catch (error) {
      console.error('Error in ensureDayInfo:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('TourJourneyManager - fetchData called with tourId:', tourId);
      
      // 디버깅: tourId 확인
      if (!tourId) {
        console.error('TourJourneyManager: tourId is missing!');
        return;
      }

      // 투어 정보 가져오기
      if (!tourInfo) {
        const { data: tour } = await supabase
          .from('singsing_tours')
          .select('*')
          .eq('id', tourId)
          .single();
        
        if (tour) {
          setTourInfo(tour);
        }
      }

      // DAY_INFO 확인 및 생성
      await ensureDayInfo(selectedDay);

      // 여정 아이템 조회 (DAY_INFO 제외)
      const { data: items, error: itemsError } = await supabase
        .from('tour_journey_items')
        .select('*')
        .eq('tour_id', tourId)
        .eq('day_number', selectedDay)
        .gt('order_index', 0)  // order_index가 0보다 큰 것만 (DAY_INFO 제외)
        .order('order_index');

      console.log('Journey items query result:', { tourId, selectedDay, items, error: itemsError });
      
      if (itemsError) throw itemsError;
      
      // 관계 데이터 별도 조회
      const itemsWithRelations = await Promise.all((items || []).map(async (item) => {
        let boarding_place = null;
        let spot = null;
        
        if (item.boarding_place_id) {
          const { data } = await supabase
            .from('singsing_boarding_places')
            .select('*')
            .eq('id', item.boarding_place_id)
            .single();
          boarding_place = data;
        }
        
        if (item.spot_id) {
          const { data } = await supabase
            .from('tourist_attractions')
            .select('*')
            .eq('id', item.spot_id)
            .single();
          spot = data;
        }
        
        return { ...item, boarding_place, spot };
      }));
      
      setJourneyItems(itemsWithRelations);

      // 최대 일수 확인
      const { data: maxDayData } = await supabase
        .from('tour_journey_items')
        .select('day_number')
        .eq('tour_id', tourId)
        .order('day_number', { ascending: false })
        .limit(1);

      if (maxDayData && maxDayData.length > 0) {
        setMaxDays(maxDayData[0].day_number);
      } else {
        // 일정에서 최대 일수 가져오기
        const { data: scheduleData } = await supabase
          .from('singsing_schedules')
          .select('day_number')
          .eq('tour_id', tourId)
          .order('day_number', { ascending: false })
          .limit(1);
        
        if (scheduleData && scheduleData.length > 0) {
          setMaxDays(scheduleData[0].day_number);
        }
      }

      // 탑승지 목록
      const { data: places } = await supabase
        .from('singsing_boarding_places')
        .select('*')
        .order('name');
      console.log('Boarding places:', places);
      setBoardingPlaces(places || []);

      // 스팟 목록
      const { data: spotData } = await supabase
        .from('tourist_attractions')
        .select('*')
        .eq('is_active', true)
        .order('name');
      console.log('Tourist spots:', spotData);
      setSpots(spotData || []);

    } catch (error) {
      console.error('Error fetching journey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // order_index 자동 설정 (DAY_INFO는 0이므로 1부터 시작)
      let orderIndex = formData.order_index;
      if (!editingItem && orderIndex === 0) {
        const maxOrder = Math.max(...journeyItems.map(item => item.order_index || 1), 0);
        orderIndex = maxOrder + 1;
      }

      // type 결정 - 주석 처리
      // let itemType = 'WAYPOINT';
      // if (formData.boarding_place_id) {
      //   itemType = 'BOARDING';
      // } else if (formData.spot_id) {
      //   const selectedSpot = spots.find(s => s.id === formData.spot_id);
      //   if (selectedSpot?.category === 'tourist_spot' || selectedSpot?.category === 'activity') {
      //     itemType = 'SPOT';
      //   } else if (selectedSpot?.category === 'restaurant' || selectedSpot?.category === 'club_meal') {
      //     itemType = 'MEAL';
      //   }
      // }

      const dataToSubmit = {
        ...formData,
        tour_id: tourId,
        day_number: selectedDay,
        order_index: orderIndex,
        // type: itemType,
        boarding_place_id: formData.boarding_place_id === undefined ? null : (formData.boarding_place_id || null),
        spot_id: formData.spot_id === undefined ? null : (formData.spot_id || null),
        // 시간 필드 매핑
        start_time: formData.arrival_time && formData.arrival_time !== '--:--' ? formData.arrival_time : null,
        end_time: formData.departure_time && formData.departure_time !== '--:--' ? formData.departure_time : null,
        arrival_time: formData.arrival_time && formData.arrival_time !== '--:--' ? formData.arrival_time : null,
        departure_time: formData.departure_time && formData.departure_time !== '--:--' ? formData.departure_time : null,
        // 숫자 필드 처리
        passenger_count: formData.passenger_count || null
      };

      if (editingItem?.id) {
        // update 시에도 관계 데이터 제거
        const { boarding_place, spot, ...updateData } = dataToSubmit as any;
        
        const { error } = await supabase
          .from('tour_journey_items')
          .update(updateData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tour_journey_items')
          .insert(dataToSubmit);
        
        if (error) throw error;
      }
      
      // 식사 정보가 있으면 DAY_INFO 업데이트
      if (formData.meal_type) {
        await updateDayInfoMeals(selectedDay, formData.meal_type, formData.meal_menu || '');
      }

      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving journey item:', error);
      alert(`저장에 실패했습니다.\n\n에러 메시지: ${error.message || error}\n\n자세한 내용은 브라우저 콘솔을 확인해주세요.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      // DAY_INFO 삭제 방지
      const item = journeyItems.find(item => item.id === id);
      if (item && item.order_index === 0) {
        alert('DAY_INFO는 삭제할 수 없습니다.');
        return;
      }
      
      const { error } = await supabase
        .from('tour_journey_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting journey item:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleEdit = (item: JourneyItem) => {
    setEditingItem(item);
    
    // 폼 데이터 설정 시 유형에 따라 처리
    let editFormData: any = {
      tour_id: item.tour_id,
      day_number: item.day_number,
      order_index: item.order_index,
      arrival_time: item.arrival_time || '',
      departure_time: item.departure_time || '',
      stay_duration: item.stay_duration || '',
      distance_from_prev: item.distance_from_prev || '',
      duration_from_prev: item.duration_from_prev || '',
      passenger_count: item.passenger_count || 0,
      boarding_type: item.boarding_type || '',
      meal_type: item.meal_type || '',
      meal_menu: item.meal_menu || '',
      golf_info: item.golf_info || {},
      notes: item.notes || '',
      display_options: item.display_options || { show_image: true }
    };
    
    // 탑승지와 스팟 중 하나만 설정
    if (item.boarding_place_id) {
      editFormData.boarding_place_id = item.boarding_place_id;
      editFormData.spot_id = undefined;
    } else if (item.spot_id) {
      editFormData.spot_id = item.spot_id;
      editFormData.boarding_place_id = undefined;
    } else {
      editFormData.boarding_place_id = undefined;
      editFormData.spot_id = undefined;
    }
    
    setFormData(editFormData);
    setShowForm(true);
  };

  const updateOrder = async (itemId: string, direction: 'up' | 'down') => {
    console.log('updateOrder called:', { itemId, direction });
    
    try {
      const currentIndex = journeyItems.findIndex(item => item.id === itemId);
      console.log('Current index:', currentIndex);
      
      if (currentIndex === -1) {
        console.error('Item not found');
        return;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      console.log('Target index:', targetIndex);
      
      if (targetIndex < 0 || targetIndex >= journeyItems.length) {
        console.log('Target index out of bounds');
        return;
      }

      // 전체 아이템을 순서대로 재정렬
      const reorderedItems = [...journeyItems];
      const [movedItem] = reorderedItems.splice(currentIndex, 1);
      reorderedItems.splice(targetIndex, 0, movedItem);

      // 새로운 order_index 할당
      const updates = reorderedItems.map((item, index) => ({
        id: item.id!,
        order_index: index + 1
      }));

      console.log('Updates to apply:', updates);

      // 1. 먼저 모든 아이템을 임시 order_index로 변경 (기존 값 + 1000)
      console.log('Step 1: Moving all items to temporary order_index...');
      for (const item of journeyItems) {
        const tempOrderIndex = (item.order_index || 0) + 1000;
        console.log(`Temporarily moving item ${item.id} to order_index ${tempOrderIndex}`);
        
        const { error } = await supabase
          .from('tour_journey_items')
          .update({ order_index: tempOrderIndex })
          .eq('id', item.id);
          
        if (error) {
          console.error('Temp update error:', error);
          throw error;
        }
      }

      // 2. 그 다음 최종 order_index로 업데이트
      console.log('Step 2: Updating to final order_index values...');
      for (const update of updates) {
        console.log(`Final update for item ${update.id}: order_index = ${update.order_index}`);
        
        const { error } = await supabase
          .from('tour_journey_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
          
        if (error) {
          console.error('Final update error:', error);
          throw error;
        }
      }
      
      console.log('Order update complete, fetching data...');
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('순서 변경에 실패했습니다.\n\n' + (error as any).message);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      tour_id: tourId,
      day_number: selectedDay,
      order_index: 0,
      boarding_place_id: undefined,
      spot_id: undefined,
      arrival_time: '',
      departure_time: '',
      stay_duration: '',
      distance_from_prev: '',
      duration_from_prev: '',
      passenger_count: 0,
      boarding_type: '',
      meal_type: '',
      meal_menu: '',
      golf_info: {},
      notes: '',
      display_options: { show_image: true }
    });
  };

  const getCategoryFromItem = (item: JourneyItem) => {
    if (item.boarding_place_id) return 'boarding';
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

  // 필터링된 아이템
  const filteredItems = selectedCategory === 'all' 
    ? journeyItems 
    : journeyItems.filter(item => getCategoryFromItem(item) === selectedCategory);

  // 타임라인 뷰
  const TimelineView = () => (
    <div className="space-y-4">
      {filteredItems.map((item, index) => (
        <div key={item.id} className="relative">
          {/* 연결선 */}
          {index < filteredItems.length - 1 && (
            <div className="absolute left-10 top-20 w-0.5 h-24 bg-gray-300">
              {item.duration_from_prev && item.distance_from_prev && (
                <div className="absolute -left-16 top-1/2 text-xs text-gray-500 bg-white px-1 whitespace-nowrap">
                  {item.duration_from_prev} • {item.distance_from_prev}
                </div>
              )}
            </div>
          )}
          
          {/* 장소 카드 */}
          <div className="flex gap-4 bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            {/* 순서 번호 */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              getCategoryFromItem(item) === 'boarding' ? 'bg-blue-100' :
              getCategoryFromItem(item) === 'tourist_spot' ? 'bg-blue-100' :
              getCategoryFromItem(item) === 'rest_area' ? 'bg-gray-100' :
              getCategoryFromItem(item) === 'restaurant' ? 'bg-orange-100' :
              getCategoryFromItem(item) === 'shopping' ? 'bg-purple-100' :
              getCategoryFromItem(item) === 'activity' ? 'bg-green-100' :
              getCategoryFromItem(item) === 'mart' ? 'bg-indigo-100' :
              getCategoryFromItem(item) === 'golf_round' ? 'bg-emerald-100' :
              getCategoryFromItem(item) === 'club_meal' ? 'bg-rose-100' :
              'bg-slate-100'
            }`}>
              <span className={`font-bold ${
                getCategoryFromItem(item) === 'boarding' ? 'text-blue-600' :
                getCategoryFromItem(item) === 'tourist_spot' ? 'text-blue-600' :
                getCategoryFromItem(item) === 'rest_area' ? 'text-gray-600' :
                getCategoryFromItem(item) === 'restaurant' ? 'text-orange-600' :
                getCategoryFromItem(item) === 'shopping' ? 'text-purple-600' :
                getCategoryFromItem(item) === 'activity' ? 'text-green-600' :
                getCategoryFromItem(item) === 'mart' ? 'text-indigo-600' :
                getCategoryFromItem(item) === 'golf_round' ? 'text-emerald-600' :
                getCategoryFromItem(item) === 'club_meal' ? 'text-rose-600' :
                'text-slate-600'
              }`}>
                {item.order_index}
              </span>
            </div>
            
            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {getIconForItem(item)}
                <h3 className="font-semibold text-lg">
                  {item.boarding_place?.name || item.spot?.name || '알 수 없음'}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
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
                {/* 세부 카테고리 표시 */}
                {item.spot?.sub_category && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                    {item.spot.sub_category}
                  </span>
                )}
                {item.passenger_count && item.passenger_count > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {item.passenger_count}명
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {item.boarding_place?.address || item.spot?.address || ''}
              </p>
              
              <div className="flex items-center gap-4 text-sm flex-wrap">
                {item.arrival_time && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-4 h-4" />
                    {item.arrival_time} 도착
                  </span>
                )}
                {item.departure_time && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-4 h-4" />
                    {item.departure_time} 출발
                  </span>
                )}
                {item.stay_duration && (
                  <span className="text-gray-500">
                    체류: {item.stay_duration}
                  </span>
                )}
                {item.meal_type && (
                  <span className="text-orange-600">
                    {item.meal_type}: {item.meal_menu}
                  </span>
                )}
                {item.notes && (
                  <span className="text-gray-500 italic">
                    {item.notes}
                  </span>
                )}
              </div>
              
              {/* 탑승지 정보 */}
              {item.boarding_place && item.boarding_place.boarding_main && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <div className="font-medium text-blue-900">탑승 안내</div>
                  <div className="text-blue-700">{item.boarding_place.boarding_main}</div>
                  {item.boarding_place.boarding_sub && (
                    <div className="text-blue-600">{item.boarding_place.boarding_sub}</div>
                  )}
                </div>
              )}
              
              {/* 골프 라운드 정보 */}
              {item.golf_info && (item.golf_info.golf_club || item.golf_info.tee_time || item.golf_info.course_info) && (
                <div className="mt-2 p-2 bg-emerald-50 rounded text-sm">
                  <div className="font-medium text-emerald-900">골프 라운드</div>
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
              
              {/* 스팟 추가 정보 */}
              {item.spot && (
                <>
                  {item.spot.description && (
                    <p className="mt-2 text-sm text-gray-600">{item.spot.description}</p>
                  )}
                  {item.spot.features && item.spot.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.spot.features.map((feature: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => updateOrder(item.id!, 'up')}
                  className={`p-2 rounded-lg transition-all ${
                    index === 0 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-white hover:bg-blue-50 hover:text-blue-600 text-gray-600 border border-gray-200'
                  }`}
                  disabled={index === 0}
                  title="위로 이동"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => updateOrder(item.id!, 'down')}
                  className={`p-2 rounded-lg transition-all ${
                    index === filteredItems.length - 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-white hover:bg-blue-50 hover:text-blue-600 text-gray-600 border border-gray-200'
                  }`}
                  disabled={index === filteredItems.length - 1}
                  title="아래로 이동"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => handleEdit(item)}
                className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                title="편집"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => handleDelete(item.id!)}
                className="p-2 bg-white hover:bg-red-50 rounded-lg border border-gray-200 transition-all"
                title="삭제"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* 기존 등록된 장소 추가 섹션 */}
      <div className="mt-8 space-y-6">
        {/* 탑승지 섹션 */}
        <div>
          <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
            <Bus className="w-4 h-4 text-blue-500" />
            등록된 탑승지 추가
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {boardingPlaces.map(place => {
              const isAdded = journeyItems.some(item => item.boarding_place_id === place.id);
              
              return (
                <div key={place.id} 
                     className={`bg-white rounded-lg shadow-sm overflow-hidden border ${isAdded ? 'border-gray-300 opacity-50' : 'border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer'} transition-all`}
                     onClick={async () => {
                       if (isAdded) {
                         alert('이미 추가된 탑승지입니다.');
                         return;
                       }
                       
                       const maxOrder = Math.max(...journeyItems.map(item => item.order_index || 0), 0);
                       const newJourneyItem = {
                         tour_id: tourId,
                         day_number: selectedDay,
                         order_index: maxOrder + 1,
                         // type: 'BOARDING',
                         boarding_place_id: place.id,
                         spot_id: null,
                         start_time: null,
                         end_time: null,
                         arrival_time: null,
                         departure_time: null,
                         stay_duration: null,
                         distance_from_prev: null,
                         duration_from_prev: null,
                         passenger_count: null,
                         boarding_type: null,
                         meal_type: null,
                         meal_menu: null,
                         golf_info: null,
                         notes: null,
                         display_options: { show_image: true }
                       };
                       
                       try {
                         const { error } = await supabase
                           .from('tour_journey_items')
                           .insert(newJourneyItem);
                           
                         if (error) throw error;
                         fetchData();
                       } catch (error) {
                         console.error('Error adding boarding place:', error);
                         alert('탑승지 추가에 실패했습니다.');
                       }
                     }}>
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm leading-tight">{place.name}</h4>
                      {isAdded && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{place.address}</p>
                    {place.boarding_main && (
                      <p className="text-xs text-blue-600 line-clamp-1">{place.boarding_main}</p>
                    )}
                    {!isAdded && (
                      <div className="pt-1">
                        <span className="text-xs text-gray-500">클릭하여 추가</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 스팟 섹션 */}
        <div>
          <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            등록된 스팟 추가
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {spots.map(spot => {
              const isAdded = journeyItems.some(item => item.spot_id === spot.id);
              
              return (
                <div key={spot.id} 
                     className={`bg-white rounded-lg shadow-sm overflow-hidden border ${isAdded ? 'border-gray-300 opacity-50' : 'border-gray-200 hover:border-green-400 hover:shadow-md cursor-pointer'} transition-all`}
                     onClick={async () => {
                       if (isAdded) {
                         alert('이미 추가된 스팟입니다.');
                         return;
                       }
                       
                       const maxOrder = Math.max(...journeyItems.map(item => item.order_index || 0), 0);
                       // type 결정 - 주석 처리
                       // let itemType = 'WAYPOINT';
                       // if (spot.category === 'tourist_spot' || spot.category === 'activity') {
                       //   itemType = 'SPOT';
                       // } else if (spot.category === 'restaurant' || spot.category === 'club_meal') {
                       //   itemType = 'MEAL';
                       // }
                       
                       const newJourneyItem = {
                         tour_id: tourId,
                         day_number: selectedDay,
                         order_index: maxOrder + 1,
                         // type: itemType,
                         boarding_place_id: null,
                         spot_id: spot.id,
                         start_time: null,
                         end_time: null,
                         arrival_time: null,
                         departure_time: null,
                         stay_duration: null,
                         distance_from_prev: null,
                         duration_from_prev: null,
                         passenger_count: null,
                         boarding_type: null,
                         meal_type: null,
                         meal_menu: null,
                         golf_info: null,
                         notes: null,
                         display_options: { show_image: true }
                       };
                       
                       try {
                         const { error } = await supabase
                           .from('tour_journey_items')
                           .insert(newJourneyItem);
                           
                         if (error) throw error;
                         fetchData();
                       } catch (error) {
                         console.error('Error adding spot:', error);
                         alert('스팟 추가에 실패했습니다.');
                       }
                     }}>
                  {/* 이미지 영역 */}
                  {spot.image_url && (
                    <div className="h-24 bg-gray-200 overflow-hidden">
                      <img 
                        src={spot.image_url} 
                        alt={spot.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm leading-tight">{spot.name}</h4>
                      {isAdded && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        spot.category === 'boarding' ? 'bg-blue-100 text-blue-700' :
                        spot.category === 'tourist_spot' ? 'bg-blue-100 text-blue-700' :
                        spot.category === 'rest_area' ? 'bg-gray-100 text-gray-700' :
                        spot.category === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                        spot.category === 'shopping' ? 'bg-purple-100 text-purple-700' :
                        spot.category === 'activity' ? 'bg-green-100 text-green-700' :
                        spot.category === 'mart' ? 'bg-indigo-100 text-indigo-700' :
                        spot.category === 'golf_round' ? 'bg-emerald-100 text-emerald-700' :
                        spot.category === 'club_meal' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {React.createElement(categoryConfig[spot.category]?.icon || MoreHorizontal, { className: 'w-3 h-3' })}
                        <span>{categoryConfig[spot.category]?.label}</span>
                      </span>
                      {spot.sub_category && (
                        <span className="text-xs text-gray-500">
                          {spot.sub_category}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">{spot.address}</p>
                    
                    {spot.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{spot.description}</p>
                    )}
                    
                    {spot.features && spot.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {spot.features.slice(0, 3).map((feature: string, idx: number) => (
                          <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {feature}
                          </span>
                        ))}
                        {spot.features.length > 3 && (
                          <span className="text-xs text-gray-400">+{spot.features.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    {!isAdded && (
                      <div className="pt-1">
                        <span className="text-xs text-gray-500">클릭하여 추가</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // 카테고리 뷰
  const CategoryView = () => {
    const groupedItems = filteredItems.reduce((acc, item) => {
      const category = getCategoryFromItem(item);
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, JourneyItem[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              {categoryConfig[category]?.icon && React.createElement(categoryConfig[category].icon, { className: 'w-5 h-5' })}
              {categoryConfig[category]?.label || category}
              <span className="text-sm text-gray-500">({items.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">
                        {item.boarding_place?.name || item.spot?.name || '알 수 없음'}
                      </h4>
                      {item.spot?.sub_category && (
                        <span className="text-xs text-gray-500">{item.spot.sub_category}</span>
                      )}
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      순서: {item.order_index}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.boarding_place?.address || item.spot?.address || ''}
                  </p>
                  {item.arrival_time && (
                    <p className="text-sm">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {item.arrival_time} {item.departure_time && `- ${item.departure_time}`}
                    </p>
                  )}
                  <div className="flex gap-1 mt-3">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id!)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 데이터가 없을 때 안내 메시지
  if (!loading && journeyItems.length === 0) {
    return (
      <div className="space-y-6">
        {/* 일자 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">여정 관리</h2>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              장소 추가
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {Array.from({ length: maxDays }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Day {day}
              </button>
            ))}
            <button
              onClick={async () => {
                const newDayNumber = maxDays + 1;
                setMaxDays(newDayNumber);
                setSelectedDay(newDayNumber);
                if (tourInfo) {
                  await ensureDayInfo(newDayNumber);
                }
              }}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 빈 상태 메시지 */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            아직 등록된 여정이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            아래에서 탑승지나 스팟을 클릭하여 Day {selectedDay}의 여정을 구성해보세요.
          </p>
          
          {/* 디버깅 정보 */}
          <div className="text-xs text-gray-400 mt-4">
            <p>탑승지: {boardingPlaces.length}개 로드됨</p>
            <p>스팟: {spots.length}개 로드됨</p>
          </div>
          
          {/* 기존 등록된 장소 추가 섹션 */}
          <div className="mt-8 space-y-6 text-left">
            {/* 탑승지 섹션 */}
            {boardingPlaces.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-blue-500" />
                  등록된 탑승지 추가
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {boardingPlaces.map(place => {
                    const isAdded = journeyItems.some(item => item.boarding_place_id === place.id);
                    
                    return (
                      <div key={place.id} 
                           className={`bg-white rounded-lg shadow-sm overflow-hidden border ${
                             isAdded ? 'border-gray-300 opacity-50' : 'border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                           } transition-all`}
                           onClick={async () => {
                             if (isAdded) {
                               alert('이미 추가된 탑승지입니다.');
                               return;
                             }
                             
                             const maxOrder = Math.max(...journeyItems.map(item => item.order_index || 0), 0);
                             const newJourneyItem = {
                               tour_id: tourId,
                               day_number: selectedDay,
                               order_index: maxOrder + 1,
                               boarding_place_id: place.id,
                               spot_id: null,
                               start_time: null,
                               end_time: null,
                               arrival_time: null,
                               departure_time: null,
                               stay_duration: null,
                               distance_from_prev: null,
                               duration_from_prev: null,
                               passenger_count: null,
                               boarding_type: null,
                               meal_type: null,
                               meal_menu: null,
                               golf_info: null,
                               notes: null,
                               display_options: { show_image: true }
                             };
                             
                             try {
                               const { error } = await supabase
                                 .from('tour_journey_items')
                                 .insert(newJourneyItem);
                                 
                               if (error) throw error;
                               fetchData();
                             } catch (error) {
                               console.error('Error adding boarding place:', error);
                               alert('탑승지 추가에 실패했습니다.');
                             }
                           }}>
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm leading-tight">{place.name}</h4>
                            {isAdded && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{place.address}</p>
                          {place.boarding_main && (
                            <p className="text-xs text-blue-600 line-clamp-1">{place.boarding_main}</p>
                          )}
                          {!isAdded && (
                            <div className="pt-1">
                              <span className="text-xs text-gray-500">클릭하여 추가</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 스팟 섹션 */}
            {spots.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  등록된 스팟 추가
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {spots.map(spot => {
                    const isAdded = journeyItems.some(item => item.spot_id === spot.id);
                    
                    return (
                      <div key={spot.id} 
                           className={`bg-white rounded-lg shadow-sm overflow-hidden border ${
                             isAdded ? 'border-gray-300 opacity-50' : 'border-gray-200 hover:border-green-400 hover:shadow-md cursor-pointer'
                           } transition-all`}
                           onClick={async () => {
                             if (isAdded) {
                               alert('이미 추가된 스팟입니다.');
                               return;
                             }
                             
                             const maxOrder = Math.max(...journeyItems.map(item => item.order_index || 0), 0);
                             // type 결정 부분 제거
                             
                             const newJourneyItem = {
                               tour_id: tourId,
                               day_number: selectedDay,
                               order_index: maxOrder + 1,
                               boarding_place_id: null,
                               spot_id: spot.id,
                               start_time: null,
                               end_time: null,
                               arrival_time: null,
                               departure_time: null,
                               stay_duration: null,
                               distance_from_prev: null,
                               duration_from_prev: null,
                               passenger_count: null,
                               boarding_type: null,
                               meal_type: null,
                               meal_menu: null,
                               golf_info: null,
                               notes: null,
                               display_options: { show_image: true }
                             };
                             
                             try {
                               const { error } = await supabase
                                 .from('tour_journey_items')
                                 .insert(newJourneyItem);
                                 
                               if (error) throw error;
                               fetchData();
                             } catch (error) {
                               console.error('Error adding spot:', error);
                               alert('스팟 추가에 실패했습니다.');
                             }
                           }}>
                        {spot.image_url && (
                          <div className="h-24 bg-gray-200 overflow-hidden">
                            <img 
                              src={spot.image_url} 
                              alt={spot.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm leading-tight">{spot.name}</h4>
                            {isAdded && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                              spot.category === 'boarding' ? 'bg-blue-100 text-blue-700' :
                              spot.category === 'tourist_spot' ? 'bg-blue-100 text-blue-700' :
                              spot.category === 'rest_area' ? 'bg-gray-100 text-gray-700' :
                              spot.category === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                              spot.category === 'shopping' ? 'bg-purple-100 text-purple-700' :
                              spot.category === 'activity' ? 'bg-green-100 text-green-700' :
                              spot.category === 'mart' ? 'bg-indigo-100 text-indigo-700' :
                              spot.category === 'golf_round' ? 'bg-emerald-100 text-emerald-700' :
                              spot.category === 'club_meal' ? 'bg-rose-100 text-rose-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {React.createElement(categoryConfig[spot.category]?.icon || MoreHorizontal, { className: 'w-3 h-3' })}
                              <span>{categoryConfig[spot.category]?.label}</span>
                            </span>
                            {spot.sub_category && (
                              <span className="text-xs text-gray-500">
                                {spot.sub_category}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 line-clamp-2">{spot.address}</p>
                          
                          {!isAdded && (
                            <div className="pt-1">
                              <span className="text-xs text-gray-500">클릭하여 추가</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {boardingPlaces.length === 0 && spots.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  데이터를 불러오는 중입니다...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  계속 표시되지 않으면 페이지를 새로고침해주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 - IntegratedScheduleManager에서 한 번만 표시하므로 여기서는 표시하지 않음 */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Route className="w-5 h-5" />
          일정 관리
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          투어의 전체 여정을 관리합니다. 날짜별 정보, 탑승지, 경유지, 관광지 등을 설정할 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">여정 관리</h2>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            장소 추가
          </button>
        </div>

        {/* 일자 선택 */}
        <div className="flex gap-2 mb-4">
          {Array.from({ length: maxDays }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDay === day
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Day {day}
            </button>
          ))}
          <button
            onClick={async () => {
              const newDayNumber = maxDays + 1;
              setMaxDays(newDayNumber);
              setSelectedDay(newDayNumber);
              // tourInfo가 있을 때만 DAY_INFO 생성
              if (tourInfo) {
                await ensureDayInfo(newDayNumber);
              }
            }}
            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 뷰 모드 및 필터 */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
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
              <List className="w-4 h-4" />
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

          {viewMode !== 'map' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">전체</option>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 입력/수정 폼 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? '장소 수정' : 'Day ' + selectedDay + ' 새 장소 추가'}
            </h3>
            <button onClick={() => { setShowForm(false); resetForm(); }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 장소 선택 */}
            <div>
              <label className="block text-sm font-medium mb-1">장소 유형</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, boarding_place_id: '', spot_id: undefined });
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    formData.boarding_place_id !== undefined && formData.spot_id === undefined ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  탑승지
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, boarding_place_id: undefined, spot_id: '' });
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    formData.spot_id !== undefined && formData.boarding_place_id === undefined ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  스팟
                </button>
              </div>

              {/* 탑승지 선택 */}
              {formData.boarding_place_id !== undefined && formData.spot_id === undefined && (
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.boarding_place_id || ''}
                  onChange={(e) => setFormData({ ...formData, boarding_place_id: e.target.value })}
                  required
                >
                  <option value="">탑승지 선택</option>
                  {boardingPlaces.map(place => (
                    <option key={place.id} value={place.id}>
                      {place.name} - {place.address}
                    </option>
                  ))}
                </select>
              )}

              {/* 스팟 선택 */}
              {formData.spot_id !== undefined && formData.boarding_place_id === undefined && (
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.spot_id || ''}
                  onChange={(e) => {
                    const selectedSpotId = e.target.value;
                    setFormData({ ...formData, spot_id: selectedSpotId });
                    
                    // 선택한 스팟의 세부 카테고리가 식사 관련인 경우 meal_type 자동 설정
                    const selectedSpot = spots.find(s => s.id === selectedSpotId);
                    if (selectedSpot?.sub_category) {
                      const mealTypes = ['조식', '중식', '석식', '간식'];
                      if (mealTypes.includes(selectedSpot.sub_category)) {
                        setFormData(prev => ({ ...prev, spot_id: selectedSpotId, meal_type: selectedSpot.sub_category }));
                      }
                    }
                  }}
                  required
                >
                  <option value="">스팟 선택</option>
                  {spots.map(spot => (
                    <option key={spot.id} value={spot.id}>
                      [{categoryConfig[spot.category]?.label}] {spot.name}
                      {spot.sub_category && ` - ${spot.sub_category}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 시간 정보 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">도착 시간</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.arrival_time || ''}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  placeholder="00:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">출발 시간</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.departure_time || ''}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  placeholder="00:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">체류 시간</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.stay_duration || ''}
                  onChange={(e) => setFormData({ ...formData, stay_duration: e.target.value })}
                  placeholder="예: 30분, 1시간"
                />
              </div>
            </div>

            {/* 거리/소요시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">이전 장소에서 거리</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.distance_from_prev || ''}
                  onChange={(e) => setFormData({ ...formData, distance_from_prev: e.target.value })}
                  placeholder="예: 50km"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">소요 시간</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.duration_from_prev || ''}
                  onChange={(e) => setFormData({ ...formData, duration_from_prev: e.target.value })}
                  placeholder="예: 1시간 30분"
                />
              </div>
            </div>

            {/* 탑승지 추가 정보 */}
            {formData.boarding_place_id && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">탑승 유형</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.boarding_type || ''}
                    onChange={(e) => setFormData({ ...formData, boarding_type: e.target.value })}
                  >
                    <option value="">선택</option>
                    <option value="승차">승차</option>
                    <option value="하차">하차</option>
                    <option value="경유">경유</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">탑승 인원</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.passenger_count || ''}
                    onChange={(e) => setFormData({ ...formData, passenger_count: e.target.value ? parseInt(e.target.value) : 0 })}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* 골프 라운드 정보 */}
            {formData.spot_id && (() => {
              const selectedSpot = spots.find(s => s.id === formData.spot_id);
              const isGolfRound = selectedSpot?.category === 'golf_round';
              
              if (isGolfRound) {
                return (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h4 className="font-medium text-emerald-800 mb-3">골프 라운드 정보</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">골프장</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={formData.golf_info?.golf_club || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              golf_info: { ...formData.golf_info, golf_club: e.target.value }
                            })}
                            placeholder="예: 파인밸리CC"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">티타임</label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={formData.golf_info?.tee_time || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              golf_info: { ...formData.golf_info, tee_time: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1">코스 정보</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg"
                          value={formData.golf_info?.course_info || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            golf_info: { ...formData.golf_info, course_info: e.target.value }
                          })}
                          placeholder="예: 파인/레이크/힐스 코스"
                        />
                      </div>
                    </div>
                  </div>
                );
              }
            })()}

            {/* 식사 정보 (식당/클럽식) */}
            {formData.spot_id && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">식사 구분</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.meal_type || ''}
                    onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  >
                    <option value="">해당없음</option>
                    <option value="조식">조식</option>
                    <option value="중식">중식</option>
                    <option value="석식">석식</option>
                    <option value="간식">간식</option>
                  </select>
                </div>
                {formData.meal_type && (
                  <div>
                    <label className="block text-sm font-medium mb-1">메뉴</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.meal_menu || ''}
                      onChange={(e) => setFormData({ ...formData, meal_menu: e.target.value })}
                      placeholder="메뉴 입력"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 비고 */}
            <div>
              <label className="block text-sm font-medium mb-1">비고</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="추가 메모사항"
              />
            </div>

            {/* 표시 옵션 */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.display_options?.show_image || false}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    display_options: { ...formData.display_options, show_image: e.target.checked }
                  })}
                />
                <span className="text-sm">이미지 표시</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {viewMode === 'timeline' && <TimelineView />}
        {viewMode === 'category' && (
          filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Day {selectedDay}에 등록된 장소가 없습니다.</p>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                첫 장소 추가하기
              </button>
            </div>
          ) : (
            <CategoryView />
          )
        )}
        {viewMode === 'map' && (
          <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">지도 뷰 (구현 예정)</p>
          </div>
        )}
      </div>
    </div>
  );
}