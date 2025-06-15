import QuoteView from '@/components/QuoteView';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const { data } = await supabase
      .from("singsing_tours")
      .select("title")
      .eq("id", id)
      .single();
    
    if (data?.title) {
      return {
        title: `${data.title} - 싱싱골프투어 견적서`,
        description: `싱싱골프투어 ${data.title} 견적서를 확인해보세요.`,
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
  
  return {
    title: '견적서 - 싱싱골프투어',
    description: '싱싱골프투어 견적서를 확인해보세요.',
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
