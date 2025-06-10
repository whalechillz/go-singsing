import { supabase } from "@/lib/supabaseClient";
import TourScheduleInfo from "@/components/TourScheduleInfo";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ tourId: string }> }): Promise<Metadata> {
  const { tourId } = await params;
  const { data: tour } = await supabase
    .from("singsing_tours")
    .select("title")
    .eq("id", tourId)
    .single();
  
  return {
    title: tour?.title || '투어 일정표',
    description: '싱싱골프 투어 일정표'
  };
}

async function fetchPublicTourData(tourId: string) {
  // 투어 정보 가져오기
  const { data: tour, error: tourError } = await supabase
    .from("singsing_tours")
    .select("*")
    .eq("id", tourId)
    .single();
  
  if (tourError || !tour) {
    console.error('Tour fetch error:', tourError);
    return null;
  }
  
  // 일정 정보 가져오기
  const { data: schedules } = await supabase
    .from("singsing_schedules")
    .select("*")
    .eq("tour_id", tourId)
    .order("date", { ascending: true });
  
  // 여정 데이터 가져오기
  const { data: journeyItems } = await supabase
    .from("tour_journey_items")
    .select("*")
    .eq("tour_id", tourId)
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true });
  
  // 관계 데이터 추가 조회
  const journeyItemsWithRelations = await Promise.all((journeyItems || []).map(async (item) => {
    let boarding_place = null;
    let spot = null;
    
    if (item.boarding_place_id) {
      const { data } = await supabase
        .from("singsing_boarding_places")
        .select("*")
        .eq("id", item.boarding_place_id)
        .single();
      boarding_place = data;
    }
    
    if (item.spot_id) {
      const { data } = await supabase
        .from("tourist_attractions")
        .select("*")
        .eq("id", item.spot_id)
        .single();
      spot = data;
    }
    
    return { ...item, boarding_place, spot };
  }));
  
  return { 
    tour, 
    schedules: schedules || [], 
    journeyItems: journeyItemsWithRelations || [] 
  };
}

export default async function PublicSchedulePage({
  params
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params;
  const data = await fetchPublicTourData(tourId);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">일정표를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            유효하지 않은 일정표이거나<br/>
            삭제된 일정표입니다.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            문의: 031-215-3990
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{data.tour.title}</h1>
          <p className="text-gray-600">
            {new Date(data.tour.start_date).toLocaleDateString('ko-KR')} ~ 
            {' '}{new Date(data.tour.end_date).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <TourScheduleInfo 
          tour={data.tour} 
          schedules={data.schedules} 
          journeyItems={data.journeyItems} 
        />
      </div>
    </div>
  );
}