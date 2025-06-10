'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useDocumentHTML } from '@/components/TourSchedulePreview/hooks/useDocumentHTML';
import { Schedule, ScheduleItem } from '@/components/TourSchedulePreview/types';

export default function PublicDocumentPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [tourData, setTourData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [journeyItems, setJourneyItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // 1. 토큰으로 문서 정보 조회
        const { data: linkData, error: linkError } = await supabase
          .from('public_document_links')
          .select('*, singsing_tours(*)')
          .eq('access_token', token)
          .eq('is_active', true)
          .single();

        if (linkError || !linkData) {
          setError('문서를 찾을 수 없습니다.');
          return;
        }

        // 만료일 체크
        if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
          setError('문서 링크가 만료되었습니다.');
          return;
        }

        // 조회수 증가
        await supabase
          .from('public_document_links')
          .update({ view_count: (linkData.view_count || 0) + 1 })
          .eq('id', linkData.id);

        setDocumentData(linkData);
        const tour = linkData.singsing_tours;

        // 2. 투어 관련 데이터 조회
        if (tour) {
          // 상품 정보
          if (tour.tour_product_id) {
            const { data: product } = await supabase
              .from('tour_products')
              .select('*')
              .eq('id', tour.tour_product_id)
              .single();
            setProductData(product);
          }

          // 일정 정보 가져오기 (중요!)
          const { data: journeyData, error: journeyError } = await supabase
            .from('tour_journey_items')
            .select('*')
            .eq('tour_id', linkData.tour_id)
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
                meal_breakfast: Boolean(dayInfo.meal_breakfast),
                meal_lunch: Boolean(dayInfo.meal_lunch),
                meal_dinner: Boolean(dayInfo.meal_dinner),
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
                tour_id: linkData.tour_id,
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

          // tourData 설정
          const finalTourData = {
            ...tour,
            schedules: schedules,
            staff: [],
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
          };
          
          setTourData(finalTourData);
        }

      } catch (error) {
        console.error('Error fetching document:', error);
        setError('문서를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDocument();
    }
  }, [token]);

  // 문서 HTML 생성
  const documentHTML = useDocumentHTML({
    activeTab: documentData?.document_type || 'customer_schedule',
    tourData,
    productData,
    tourBoardingPlaces: [],
    tourWaypoints: [],
    journeyItems,
    tourId: tourData?.id || ''
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 로고/헤더 */}
      <div className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">싱싱골프투어</h1>
        </div>
      </div>

      {/* 문서 내용 */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div 
            className="document-content"
            dangerouslySetInnerHTML={{ __html: documentHTML }}
          />
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="max-w-4xl mx-auto px-4 pb-8 print:hidden">
        <div className="text-center text-sm text-gray-500">
          <p>본 문서는 싱싱골프투어에서 제공하는 투어 정보입니다.</p>
          <p>문의: 031-215-3990</p>
        </div>
      </div>
    </div>
  );
}
