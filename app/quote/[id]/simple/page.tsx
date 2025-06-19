import QuoteViewSimple from "@/components/QuoteViewSimple";

export default function QuoteSimplePage({ 
  params 
}: { 
  params: { id: string }
}) {
  return <QuoteViewSimple quoteId={params.id} />;
}

// 메타데이터 설정
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: '싱싱골프투어 견적서 (간단 버전)',
    description: '싱싱골프투어 견적서 간단 버전입니다.',
  };
}
