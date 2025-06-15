import { createClient } from '@supabase/supabase-js';
import QuoteView from '@/components/QuoteView';
import PublicDocumentView from '@/components/PublicDocumentView';

// 캐시 무효화 - 항상 최신 데이터 가져오기
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// 서버 사이드용 Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function ShortLinkDocument({
  params,
  searchParams
}: {
  params: Promise<{ url: string }>
  searchParams?: Promise<{ type?: string }>
}) {
  const { url } = await params;
  const queryParams = await searchParams;
  const docType = queryParams?.type;
  
  // 공개 링크 정보 조회
  console.log('=== ShortLinkDocument Debug (Server) ===');
  console.log('Requested URL:', url);
  console.log('Document Type from Query:', docType);
  
  // 먼저 해당 URL로 모든 문서 가져오기
  const { data: allLinks, error: allLinksError } = await supabase
    .from("public_document_links")
    .select("*")
    .eq("public_url", url)
    .eq("is_active", true);
    
  console.log('All links with this URL:', allLinks?.map(l => ({ 
    id: l.id, 
    type: l.document_type, 
    url: l.public_url 
  })));
  
  let linkData = null;
  let error = allLinksError;
  
  if (allLinks && allLinks.length > 0) {
    if (docType) {
      // URL에 type 파라미터가 있으면 해당 타입의 문서 찾기
      linkData = allLinks.find(link => link.document_type === docType);
      if (!linkData) {
        console.log('Requested type not found, falling back to first link');
        linkData = allLinks[0];
      }
    } else {
      // type이 없으면 첫 번째 문서 사용
      linkData = allLinks[0];
    }
  }
    
  console.log('Selected linkData:', linkData);
  console.log('Document Type from DB:', linkData?.document_type);
  console.log('=====================================')
  
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">문서를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            유효하지 않은 문서 링크이거나<br/>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">문서가 만료되었습니다</h1>
          <p className="text-gray-600">
            이 문서의 유효기간이 지났습니다.<br/>
            새로운 문서를 요청해 주세요.
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
  
  // 문서 타입에 따라 적절한 컴포넌트 렌더링
  if (linkData.document_type === 'quote') {
    // 견적서
    return <QuoteView quoteId={linkData.tour_id} />;
  } else {
    // 일정표, 탑승 가이드 등 기타 문서
    return <PublicDocumentView linkData={linkData} />;
  }
}
