"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourSettlementManager from "@/components/admin/tours/TourSettlementManager";

export default function TourSettlementPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [tour, setTour] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchTour = async () => {
      if (!tourId) {
        setError("tourId가 없습니다");
        setLoading(false);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching tour:", fetchError);
        setError(fetchError.message);
      } else {
        setTour(data);
      }
      setLoading(false);
    };
    
    fetchTour();
  }, [tourId]);
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">에러: {error}</div>
        <div className="text-gray-600">tourId: {tourId || "없음"}</div>
      </div>
    );
  }
  
  if (!tour) {
    return (
      <div className="p-8">
        <div className="text-red-500">투어 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">정산 관리</h1>
        <p className="text-gray-600 mt-1">{tour.title}</p>
      </div>
      <TourSettlementManager tourId={tourId} tour={tour} />
    </div>
  );
}








