"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import QuoteForm from "@/components/admin/quotes/QuoteForm";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.quoteId as string;
  
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuoteData();
  }, [quoteId]);

  const fetchQuoteData = async () => {
    try {
      const { data, error } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", quoteId)
        .single();
      
      if (error) throw error;
      
      setInitialData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Link href="/admin/quotes" className="mt-4 inline-block text-blue-600 hover:underline">
          견적 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/quotes/${quoteId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">견적 수정</h1>
          <p className="text-gray-600 mt-1">
            견적 정보를 수정합니다.
          </p>
        </div>
      </div>
      
      <QuoteForm 
        initialData={initialData}
        onSuccess={(id) => {
          router.push(`/admin/quotes/${id}`);
        }}
        onCancel={() => {
          router.push(`/admin/quotes/${quoteId}`);
        }}
      />
    </div>
  );
}