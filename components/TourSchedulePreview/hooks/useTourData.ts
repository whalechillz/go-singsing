import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TourData, ProductData, BoardingPlace, Waypoint, JourneyItem, Schedule, ScheduleItem } from '../types';

export function useTourData(tourId: string) {
  const [tourData, setTourData] = useState<TourData | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourBoardingPlaces, setTourBoardingPlaces] = useState<BoardingPlace[]>([]);
  const [tourWaypoints, setTourWaypoints] = useState<Waypoint[]>([]);
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([]);

  useEffect(() => {
    if (tourId) {
      fetchAllData();
    }
  }, [tourId]);

  const fetchAllData = async () => {
    await fetchTourBoardingPlaces();
    await fetchTourData();
  };

  const fetchTourBoardingPlaces = async () => {
    try {
      const { data: tourInfo } = await supabase
        .from('singsing_tours')
        .select('start_date, end_date')
        .eq('id', tourId)
        .single();

      if (!tourInfo) return;

      const { data: journeyItems, error } = await supabase
        .from('tour_journey_items')
        .select(`
          *,
          spot:tourist_attractions (*)
        `)
        .eq('tour_id', tourId)
        .order('day_number')
        .order('order_index');

      if (error) {
        console.error('Error fetching journey items:', error);
        return;
      }

      // 첫날 탑승지 정보 추출
      const boardingItems = journeyItems?.filter(item => 
        item.day_number === 1 && 
        item.spot?.category === 'boarding_place'
      ).map(item => ({
        id: item.id,
        tour_id: item.tour_id,
        departure_time: item.departure_time || item.arrival_time,
        arrival_time: item.arrival_time,
        order_no: item.order_index,
        boarding_place: item.spot ? {
          id: item.spot.id,
          name: item.spot.name,
          address: item.spot.address,
          description: item.spot.description,
          map_url: item.spot.map_url,
          boarding_main: item.spot.boarding_info?.main_description || '',
          boarding_sub: item.spot.boarding_info?.sub_description || '',
          parking_main: item.spot.parking_info?.description || '',
          parking_map_url: item.spot.parking_info?.map_url || '',
          parking_info: item.spot.parking_info?.fee_info || '무료',
          district: item.spot.region || ''
        } : null,
        is_waypoint: false
      })) || [];
      
      setTourBoardingPlaces(boardingItems);

      // 경유지 정보 추출
      const waypointItems = journeyItems?.filter(item => 
        item.spot && (
          item.spot.category === 'rest_area' || 
          item.spot.category === 'tourist_spot' ||
          item.spot.category === 'restaurant'
        )
      ).map(item => ({
        id: item.id,
        tour_id: item.tour_id,
        waypoint_name: item.spot.name,
        waypoint_time: item.arrival_time,
        waypoint_duration: item.stay_duration || item.spot.recommended_duration || 30,
        waypoint_description: item.notes || item.spot.description,
        visit_date: item.day_date || new Date(new Date(tourInfo.start_date).getTime() + (item.day_number - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        order_no: item.order_index,
        is_waypoint: true,
        attraction_data: item.spot
      })) || [];
      
      setTourWaypoints(waypointItems);
    } catch (error) {
      console.error('Error in fetchTourBoardingPlaces:', error);
      setTourBoardingPlaces([]);
      setTourWaypoints([]);
    }
  };

  const fetchTourData = async () => {
    try {
      setLoading(true);
      
      const { data: tour, error: tourError } = await supabase
        .from('singsing_tours')
        .select(`
          *,
          singsing_tour_staff (*)
        `)
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;

      // 여정 아이템에서 일정 정보 가져오기
      const { data: journeyData, error: journeyError } = await supabase
        .from('tour_journey_items')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_number')
        .order('order_index');

      if (journeyError) throw journeyError;
      
      // DAY_INFO 타입의 아이템에서 날짜별 정보 추출
      const dayInfoItems = journeyData?.filter(item => item.order_index === 0) || [];
      
      // 스케줄 생성
      let schedules: Schedule[] = [];
      
      if (dayInfoItems.length > 0) {
        schedules = dayInfoItems.map(dayInfo => ({
          id: dayInfo.id,
          tour_id: dayInfo.tour_id,
          date: dayInfo.day_date || new Date(new Date(tour.start_date).getTime() + (dayInfo.day_number - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          day_number: dayInfo.day_number,
          title: dayInfo.notes || `Day ${dayInfo.day_number} 일정`,
          meal_breakfast: dayInfo.meal_breakfast || false,
          meal_lunch: dayInfo.meal_lunch || false,
          meal_dinner: dayInfo.meal_dinner || false,
          menu_breakfast: dayInfo.menu_breakfast || '',
          menu_lunch: dayInfo.menu_lunch || '',
          menu_dinner: dayInfo.menu_dinner || '',
          schedule_items: []
        }));
      } else {
        // 기본 스케줄 생성
        const startDate = new Date(tour.start_date);
        const endDate = new Date(tour.end_date);
        const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        for (let i = 0; i < dayCount; i++) {
          const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          schedules.push({
            id: `temp-${i}`,
            tour_id: tourId,
            date: currentDate.toISOString().split('T')[0],
            day_number: i + 1,
            title: `Day ${i + 1} 일정`,
            meal_breakfast: false,
            meal_lunch: false,
            meal_dinner: false,
            menu_breakfast: '',
            menu_lunch: '',
            menu_dinner: '',
            schedule_items: []
          });
        }
      }
      
      // 일반 여정 아이템 처리
      const regularItems = journeyData?.filter(item => item.order_index > 0) || [];
      
      if (regularItems.length > 0) {
        const itemsWithRelations = await Promise.all(regularItems.map(async (item) => {
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
        
        // 각 날짜별로 일정 아이템 생성
        schedules.forEach(schedule => {
          const dayItems = itemsWithRelations.filter(item => item.day_number === schedule.day_number);
          const dayNumber = schedule.day_number; // 일차 정보
          
          schedule.schedule_items = dayItems.map(item => {
            let content = '';
            let time = item.arrival_time || '';
            
            // 스팟이 있으면 스팟 이름을 그대로 사용
            if (item.spot) {
              content = item.spot.name;
              
              // 식사 메뉴가 있으면 추가
              if (item.meal_menu) {
                content += ` - ${item.meal_menu}`;
              }
            } else {
              // 스팟이 없는 경우만 기본 처리
              if (item.boarding_type === 'arrival') {
                content = '도착';
              } else if (item.notes) {
                content = item.notes;
              } else if (item.meal_type) {
                const mealName = item.meal_type === 'breakfast' ? '조식' : item.meal_type === 'lunch' ? '중식' : item.meal_type === 'dinner' ? '석식' : item.meal_type === 'snack' ? '간편식' : '';
                content = mealName;
                if (item.meal_menu) {
                  content += ` - ${item.meal_menu}`;
                }
              }
            }
            
            return {
              time,
              content,
              attraction_data: item.spot
            } as ScheduleItem;
          });
        });
      }

      // 여행상품 정보 가져오기
      if (tour.tour_product_id) {
        const { data: product, error: productError } = await supabase
          .from('tour_products')
          .select('*')
          .eq('id', tour.tour_product_id)
          .single();

        if (!productError && product) {
          setProductData(product);
        }
      }

      // 데이터 통합
      setTourData({
        ...tour,
        schedules: schedules,
        staff: tour.singsing_tour_staff || [],
        tour_period: tour.tour_period || `${tour.start_date} ~ ${tour.end_date}`,
        show_staff_info: tour.show_staff_info ?? true,
        show_footer_message: tour.show_footer_message ?? true,
        show_company_phones: tour.show_company_phones ?? true,
        company_phone: tour.company_phone || '031-215-3990',
        company_mobile: tour.company_mobile || '010-3332-9020',
        golf_reservation_phone: tour.golf_reservation_phone || '',
        golf_reservation_mobile: tour.golf_reservation_mobile || '',
        footer_message: tour.footer_message || '♡ 즐거운 하루 되시길 바랍니다. ♡',
        notices: tour.notices || '• 집합시간: 티오프 시간 30분 전 골프장 도착\n• 준비사항: 골프복, 골프화, 모자, 선글라스\n• 카트배정: 4인 1카트 원칙\n• 날씨대비: 우산, 우의 등 개인 준비'
      });
    } catch (error) {
      console.error('Error fetching tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    tourData,
    productData,
    loading,
    tourBoardingPlaces,
    tourWaypoints,
    journeyItems,
    refetch: fetchAllData
  };
}
