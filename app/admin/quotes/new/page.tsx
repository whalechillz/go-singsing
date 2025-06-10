"use client";
import { useRouter } from "next/navigation";
import QuoteForm from "@/components/admin/quotes/QuoteForm";

export default function NewQuotePage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">새 견적 작성</h1>
        <p className="text-gray-600 mt-2">
          고객에게 보낼 투어 견적을 작성합니다. 견적이 확정되면 정식 투어로 전환할 수 있습니다.
        </p>
      </div>
      
      <QuoteForm 
        onSuccess={(id) => {
          router.push(`/admin/quotes/${id}`);
        }}
        onCancel={() => {
          router.push('/admin/quotes');
        }}
      />
    </div>
  );
}