"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import QuoteListEnhanced from "@/components/admin/quotes/QuoteListEnhanced";

type Quote = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  max_participants: number;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  quote_expires_at?: string;
  quoted_at?: string;
  tour_product_id?: string;
  current_participants?: number;
};

const QuoteListPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchQuotes = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 견적 상태인 투어만 가져오기
      const { data: quotesData, error: quotesError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("status", "quote")
        .order("created_at", { ascending: false });
      
      if (quotesError) throw quotesError;
      
      // tour_products 정보 가져오기
      const { data: productsData } = await supabase
        .from("tour_products")
        .select("id, name, golf_course");
      
      const productsMap = new Map(productsData?.map(p => [p.id, p]) || []);
      
      // 각 견적의 참가자 수 계산
      if (quotesData) {
        const quotesWithParticipants = await Promise.all(
          quotesData.map(async (quote) => {
            const { count } = await supabase
              .from("singsing_participants")
              .select("*", { count: 'exact', head: true })
              .eq("tour_id", quote.id);
            
            const product = quote.tour_product_id ? productsMap.get(quote.tour_product_id) : null;
            
            return {
              ...quote,
              golf_course: product?.golf_course || product?.name || "",
              current_participants: count || 0,
              max_participants: quote.max_participants || 40,
              price: quote.price || 0
            };
          })
        );
        
        setQuotes(quotesWithParticipants);
      }
    } catch (error: any) {
      setError(error.message || "견적 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    
    try {
      const { error } = await supabase
        .from("singsing_tours")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      alert("견적이 삭제되었습니다.");
      
    } catch (error: any) {
      alert("삭제 실패: " + error.message);
    }
  };

  const handleConvertToTour = async (id: string) => {
    if (!window.confirm("이 견적을 정식 투어로 전환하시겠습니까?")) return;
    
    try {
      const { error } = await supabase
        .from("singsing_tours")
        .update({ 
          status: 'confirmed',
          converted_at: new Date().toISOString()
        })
        .eq("id", id);
        
      if (error) throw error;
      
      alert("견적이 투어로 전환되었습니다.");
      fetchQuotes(); // 목록 새로고침
      
    } catch (error: any) {
      alert("전환 실패: " + error.message);
    }
  };

  const handleRefresh = () => {
    fetchQuotes();
  };

  return (
    <QuoteListEnhanced
      quotes={quotes}
      loading={loading}
      error={error}
      onDelete={handleDelete}
      onConvertToTour={handleConvertToTour}
      onRefresh={handleRefresh}
    />
  );
};

export default QuoteListPage;