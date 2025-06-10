'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useDocumentHTML } from '@/components/TourSchedulePreview/hooks/useDocumentHTML';

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
        setTourData(linkData.singsing_tours);

        // 2. 투어 관련 데이터 조회
        if (linkData.singsing_tours) {
          // 상품 정보
          if (linkData.singsing_tours.tour_product_id) {
            const { data: product } = await supabase
              .from('tour_products')
              .select('*')
              .eq('id', linkData.singsing_tours.tour_product_id)
              .single();
            setProductData(product);
          }

          // 일정 정보 가져오기 (중요!)
          const { data: schedules } = await supabase
            .from('singsing_schedules')
            .select(`
              *,
              schedule_items:singsing_schedule_items(
                *,
                attraction_data:attraction_id(
                  id,
                  name,
                  description,
                  main_image_url
                )
              )
            `)
            .eq('tour_id', linkData.tour_id)
            .order('date');

          // 스케줄 데이터를 tourData에 추가
          if (schedules) {
            // schedule_items를 order_no로 정렬
            const schedulesWithOrderedItems = schedules.map(schedule => ({
              ...schedule,
              schedule_items: schedule.schedule_items?.sort((a: any, b: any) => 
                (a.order_no || 0) - (b.order_no || 0)
              ) || []
            }));
            
            setTourData({
              ...linkData.singsing_tours,
              schedules: schedulesWithOrderedItems
            });
          }

          // 여정 정보 (탑승안내용)
          const { data: journeys } = await supabase
            .from('tour_journey_items')
            .select(`
              *,
              spot:spot_id(*)
            `)
            .eq('tour_id', linkData.tour_id)
            .order('day_number, order_index');
          
          setJourneyItems(journeys || []);
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
