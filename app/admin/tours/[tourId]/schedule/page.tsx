"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import IntegratedScheduleManager from "@/components/IntegratedScheduleManager";

export default function TourSchedulePage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [tour, setTour] = useState<any>(null);
  const [error, setError] = useState<string>("");
  
  useEffect(() => {
    const fetchTour = async () => {
      console.log("Schedule page - tourId from params:", tourId);
      console.log("Full params object:", params);
      
      if (!tourId) {
        setError("tourId가 없습니다");
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
        console.log("Tour data fetched:", data);
        setTour(data);
      }
    };
    
    fetchTour();
  }, [tourId]);
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">에러: {error}</div>
        <div className="text-gray-600">tourId: {tourId || "없음"}</div>
      </div>
    );
  }
  
  if (!tour) return <div className="p-8">로딩중... (tourId: {tourId || "없음"})</div>;
  
  return <IntegratedScheduleManager tourId={tourId} />;
}