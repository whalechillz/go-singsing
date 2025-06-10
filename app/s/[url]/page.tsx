import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드용 Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function ShortLinkRedirect({
  params
}: {
  params: Promise<{ url: string }>
}) {
  const { url } = await params;
  
  // 공개 링크 정보 조회
  const { data: linkData, error } = await supabase
    .from("public_document_links")
    .select("*")
    .eq("public_url", url)
    .single();
  
  // 링크가 없거나 비활성화된 경우
  if (!linkData || !linkData.is_active || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">스케줄을 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            유효하지 않은 스케줄 링크이거나<br/>
            비활성화된 링크입니다.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            문의: 031-215-3990
          </p>
        </div>
      </div>
    );
  }
  
  // document_type에 따른 리다이렉트 처리
  const getRedirectPath = (linkData: any) => {
    const tourId = linkData.tour_id;
    
    switch (linkData.document_type) {
      // 새로운 통합 링크 타입
      case 'customer_all':
        return `/public-document/${tourId}`;
      
      case 'staff_all':
        return `/public-document/${tourId}?staff=true`;
      
      case 'golf_timetable':
        return `/public-document/${tourId}?golf=true#timetable`;
      
      // 기존 개별 링크 타입들 (호환성 유지)
      case 'customer_schedule':
      case 'simplified':
        return `/public-document/${tourId}`;
      
      case 'staff_schedule':
        return `/public-document/${tourId}?staff=true`;
      
      case 'customer_boarding':
        return `/public-document/${tourId}#boarding`;
      
      case 'staff_boarding':
        return `/public-document/${tourId}?staff=true#boarding`;
      
      case 'room_assignment':
        return `/public-document/${tourId}#room`;
      
      case 'room_assignment_staff':
        return `/public-document/${tourId}?staff=true#room`;
      
      case 'customer_timetable':
        return `/public-document/${tourId}#timetable`;
      
      case 'staff_timetable':
        return `/public-document/${tourId}?staff=true#timetable`;
      
      case 'quote':
        return `/quote/${tourId}`;
      
      default:
        return null;
    }
  };
  
  const redirectPath = getRedirectPath(linkData);
  
  // 처리할 수 없는 문서 유형인 경우
  if (!redirectPath) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">잘못된 문서 유형</h1>
          <p className="text-gray-600">
            이 링크는 처리할 수 없는 문서 유형입니다.
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">스케줄이 만료되었습니다</h1>
          <p className="text-gray-600">
            이 스케줄의 유효기간이 지났습니다.<br/>
            최신 스케줄을 확인해 주세요.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            문의: 031-215-3990
          </p>
        </div>
      </div>
    );
  }
  
  // 조회수 증가 (view_count 업데이트)
  const currentViewCount = (linkData as any).view_count || 0;
  await supabase
    .from("public_document_links")
    .update({ 
      view_count: currentViewCount + 1,
      last_viewed_at: new Date().toISOString(),
      first_viewed_at: (linkData as any).first_viewed_at || new Date().toISOString()
    })
    .eq("public_url", url);
  
  // 적절한 페이지로 리다이렉트
  redirect(redirectPath!);
}