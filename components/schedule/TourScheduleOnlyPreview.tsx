import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { simplifyCourseName } from '@/lib/utils';

interface TourScheduleOnlyPreviewProps {
  tourId: string;
}

export default function TourScheduleOnlyPreview({ tourId }: TourScheduleOnlyPreviewProps) {
  const [tourData, setTourData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [journeyItems, setJourneyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tourId) {
      fetchTourData();
    }
  }, [tourId]);

  const fetchTourData = async () => {
    try {
      setLoading(true);
      
      // 투어 정보 가져오기
      const { data: tour, error: tourError } = await supabase
        .from('singsing_tours')
        .select(`
          *,
          singsing_tour_staff (*)
        `)
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;

      // 일정 정보 가져오기
      const { data: schedules, error: schedulesError } = await supabase
        .from('singsing_schedules')
        .select('*')
        .eq('tour_id', tourId)
        .order('date');

      if (schedulesError) throw schedulesError;
      
      // 여정 아이템 가져오기
      const { data: journeyData, error: journeyError } = await supabase
        .from('tour_journey_items')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_number')
        .order('order_index');
      
      if (!journeyError && journeyData) {
        setJourneyItems(journeyData);
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
        staff: tour.singsing_tour_staff || []
      });
    } catch (error) {
      console.error('Error fetching tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tourData) {
    return <div className="text-center p-8">투어 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="bg-white p-8 print:p-0">
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
      
      {/* 헤더 */}
      <div className="text-center pb-6 border-b-2 border-blue-600 mb-6">
        <div className="text-2xl font-bold text-blue-600 mb-2">싱싱골프투어</div>
        <div className="text-sm text-gray-600">
          수원시 영통구 법조로149번길 200<br/>
          고객센터 TEL 031-215-3990
        </div>
      </div>
      
      {/* 상품 정보 */}
      <div className="mb-6">
        <div className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 mb-4">상품 정보</div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-2 font-medium w-32">상품명</td>
                <td className="px-4 py-2 font-semibold text-blue-600">{tourData.title}</td>
              </tr>
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-2 font-medium">일정</td>
                <td className="px-4 py-2 font-semibold text-blue-600">
                  {new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
                  {new Date(tourData.end_date).toLocaleDateString('ko-KR')}
                </td>
              </tr>
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-2 font-medium">골프장</td>
                <td className="px-4 py-2">{productData?.golf_course || ''}</td>
              </tr>
              {productData?.courses?.length > 0 && (
                <tr className="border-b">
                  <td className="bg-gray-50 px-4 py-2 font-medium">코스</td>
                  <td className="px-4 py-2">{productData.courses.join(', ')}</td>
                </tr>
              )}
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-2 font-medium">숙소</td>
                <td className="px-4 py-2">{productData?.hotel || ''}</td>
              </tr>
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-2 font-medium">포함사항</td>
                <td className="px-4 py-2">{productData?.included_items || ''}</td>
              </tr>
              <tr>
                <td className="bg-gray-50 px-4 py-2 font-medium">불포함사항</td>
                <td className="px-4 py-2">{productData?.excluded_items || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 특별 공지사항 */}
      {tourData.special_notices && tourData.special_notices.length > 0 && (
        <div className="mb-6">
          <div className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 mb-4">특별 공지사항</div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-1">
              {tourData.special_notices.map((notice: any, idx: number) => (
                <li key={idx}>{notice.content || notice}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 일정 안내 */}
      <div className="mb-6">
        <div className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 mb-4">일정 안내</div>
        <div className="space-y-4">
          {tourData.schedules?.map((schedule: any, idx: number) => (
            <div key={schedule.id} className="border rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2 font-bold flex justify-between items-center">
                <span>Day {idx + 1} - {new Date(schedule.date || schedule.schedule_date).toLocaleDateString('ko-KR')}</span>
                <span className="text-sm font-normal">{schedule.title ? simplifyCourseName(schedule.title) : ''}</span>
              </div>
              <div className="p-4">
                {schedule.schedule_items?.length > 0 && (
                  <div className="space-y-2">
                    {schedule.schedule_items.map((item: any, itemIdx: number) => (
                      <div key={itemIdx} className="flex gap-2">
                        {item.time && <span className="font-medium text-blue-600">{item.time}:</span>}
                        <span>{item.content}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 식사 정보 */}
                <div className="mt-4 flex gap-4 text-sm">
                  {schedule.meal_breakfast && (
                    <div className="text-gray-600">
                      <span className="font-medium">조식:</span> {schedule.menu_breakfast || '제공'}
                    </div>
                  )}
                  {schedule.meal_lunch && (
                    <div className="text-gray-600">
                      <span className="font-medium">중식:</span> {schedule.menu_lunch || '제공'}
                    </div>
                  )}
                  {schedule.meal_dinner && (
                    <div className="text-gray-600">
                      <span className="font-medium">석식:</span> {schedule.menu_dinner || '제공'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 예약 안내사항 */}
      {productData?.general_notices && productData.general_notices.length > 0 && (
        <div className="mb-6">
          <div className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 mb-4">예약 안내 사항</div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-1">
              {productData.general_notices.map((notice: any, idx: number) => (
                <li key={idx}>{notice.content || notice}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <div className="text-center pt-6 mt-8 border-t-2 border-gray-200">
        <p className="text-lg mb-2">♡ 즐거운 하루 되시길 바랍니다. ♡</p>
        <p className="text-gray-600">싱싱골프투어 ☎ 031-215-3990</p>
      </div>
    </div>
  );
}