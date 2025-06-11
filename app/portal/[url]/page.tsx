import { createClient } from '@supabase/supabase-js';
import CustomerTourPortal from '@/components/CustomerTourPortal';

// 서버 사이드용 Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function TourPortalPage({
  params
}: {
  params: Promise<{ url: string }>
}) {
  const { url } = await params;
  
  // 포털 링크 정보 조회
  const { data: linkData, error } = await supabase
    .from("public_document_links")
    .select("*")
    .eq("public_url", url)
    .eq("document_type", "portal")
    .single();
  
  // 링크가 없거나 비활성화된 경우
  if (!linkData || !linkData.is_active || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">포털을 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            유효하지 않은 포털 링크이거나<br/>
            비활성화된 링크입니다.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            문의: 031-215-3990
          </p>
        </div>
      </div>
    );
  }
  
  // 만료일 확인
  if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">포털이 만료되었습니다</h1>
          <p className="text-gray-600">
            이 포털의 유효기간이 지났습니다.<br/>
            새로운 링크를 요청해 주세요.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            문의: 031-215-3990
          </p>
        </div>
      </div>
    );
  }
  
  // 조회수 증가
  const currentViewCount = linkData.view_count || 0;
  await supabase
    .from("public_document_links")
    .update({ 
      view_count: currentViewCount + 1,
      last_viewed_at: new Date().toISOString(),
      first_viewed_at: linkData.first_viewed_at || new Date().toISOString()
    })
    .eq("public_url", url);
  
  // 투어 정보 가져오기
  const { data: tourData, error: tourError } = await supabase
    .from("singsing_tours")
    .select("*")
    .eq("id", linkData.tour_id)
    .single();
    
  if (!tourData || tourError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">투어 정보를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            투어 정보를 불러올 수 없습니다.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            문의: 031-215-3990
          </p>
        </div>
      </div>
    );
  }
  
  // 모든 문서 링크 가져오기
  const { data: documentLinks, error: documentsError } = await supabase
    .from("public_document_links")
    .select("*")
    .eq("tour_id", linkData.tour_id)
    .eq("is_active", true)
    .not("document_type", "eq", "portal");
    
  return (
    <CustomerTourPortal 
      tourData={tourData} 
      documentLinks={documentLinks || []}
      portalSettings={linkData.settings || {}}
    />
  );
}
