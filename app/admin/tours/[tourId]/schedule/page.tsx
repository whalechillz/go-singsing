"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import IntegratedScheduleManager from "@/components/IntegratedScheduleManager";

export default function TourSchedulePage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [tour, setTour] = useState<any>(null);
  
  useEffect(() => {
    const fetchTour = async () => {
      const { data } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single();
        
      setTour(data);
    };
    
    fetchTour();
  }, [tourId]);
  
  if (!tour) return <div className="p-8">로딩중...</div>;
  
  return <IntegratedScheduleManager tourId={tourId} />;
}