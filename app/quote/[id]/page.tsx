import QuoteView from '@/components/QuoteView';

export default async function PublicQuotePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  return <QuoteView quoteId={id} />;
}
