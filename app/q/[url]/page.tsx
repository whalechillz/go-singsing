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
    .select("tour_id, document_type, is_active, expires_at")
    .eq("public_url", url)
    .single();
  
  // 링크가 없거나 비활성화된 경우
  if (!linkData || !linkData.is_active || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">링크를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            유효하지 않은 링크이거나 만료된 링크입니다.
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">링크가 만료되었습니다</h1>
          <p className="text-gray-600">
            이 링크의 유효기간이 지났습니다.
          </p>
        </div>
      </div>
    );
  }
  
  // 조회수 증가 (view_count 업데이트)
  const currentViewCount = linkData.view_count || 0;
  await supabase
    .from("public_document_links")
    .update({ 
      view_count: currentViewCount + 1,
      last_viewed_at: new Date().toISOString(),
      first_viewed_at: linkData.first_viewed_at || new Date().toISOString()
    })
    .eq("public_url", url);
  
  // 문서 타입에 따라 리다이렉트
  if (linkData.document_type === 'quote') {
    redirect(`/quote/${linkData.tour_id}`);
  } else if (linkData.document_type === 'boarding_guide') {
    redirect(`/document/${linkData.tour_id}/boarding`);
  } else {
    redirect(`/document/${linkData.tour_id}`);
  }
}