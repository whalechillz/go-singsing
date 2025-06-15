import QuoteView from '@/components/QuoteView';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const { data } = await supabase
      .from("singsing_tours")
      .select("title, start_date, end_date, golf_course")
      .eq("id", id)
      .single();
    
    if (data) {
      // 날짜 계산
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const days = nights + 1;
      
      return {
        title: `${data.title} | ${nights}박${days}일 골프패키지 견적서 - 싱싱골프투어`,
        description: `${data.golf_course} ${nights}박${days}일 골프패키지 견적서 | 리무진버스 이동, 숙박/식사 포함, 전문 기사·가이드 동행 | 싱싱골프투어 031-215-3990`,
        keywords: `${data.golf_course}, ${nights}박${days}일 골프여행, 골프패키지, 리무진버스 골프투어, 단체골프여행`,
        openGraph: {
          title: `${data.title} | ${nights}박${days}일 골프패키지 견적서`,
          description: `${data.golf_course} ${nights}박${days}일 골프여행 견적서 | ✅ 리무진버스 ✅ 숙박/식사 포함 ✅ 전문가이드 | 📞 031-215-3990`,
          type: "article",
        },
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
  
  return {
    title: '골프패키지 견적서 - 싱싱골프투어 | 2박3일 리무진버스 단체투어',
    description: '싱싱골프투어 골프패키지 견적서 | 리무진버스 이동, 숙박/식사 포함, 전문 기사·가이드 동행',
  };
}

export default async function PublicQuotePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  return <QuoteView quoteId={id} />;
}
