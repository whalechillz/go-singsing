import QuoteViewSimple from "@/components/QuoteViewSimple";

export default async function QuoteSimplePage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <QuoteViewSimple quoteId={id} />;
}

// 메타데이터 설정
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: '싱싱골프투어 견적서 (간단 버전)',
    description: '싱싱골프투어 견적서 간단 버전입니다.',
  };
}
