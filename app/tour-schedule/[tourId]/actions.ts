'use server'

import { supabase } from "@/lib/supabaseClient";

type TourData = {
  tour: any;
  schedules: any[] | null;
  journeyItems?: any[] | null;
}

export const fetchTourAndSchedules = async (tourId: string): Promise<TourData> => {
  const { data: tour } = await supabase.from("singsing_tours").select("*").eq("id", tourId).single();
  const { data: schedules } = await supabase.from("singsing_schedules").select("*").eq("tour_id", tourId).order("date", { ascending: true });
  
  // 여정 데이터 가져오기
  const { data: journeyItems } = await supabase
    .from("tour_journey_items")
    .select("*")
    .eq("tour_id", tourId)
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true });
  
  // 관계 데이터 추가 조회
  const journeyItemsWithRelations = await Promise.all((journeyItems || []).map(async (item) => {
    let boarding_place = null;
    let spot = null;
    
    if (item.boarding_place_id) {
      const { data } = await supabase
        .from("singsing_boarding_places")
        .select("*")
        .eq("id", item.boarding_place_id)
        .single();
      boarding_place = data;
    }
    
    if (item.spot_id) {
      const { data } = await supabase
        .from("tourist_attractions")
        .select("*")
        .eq("id", item.spot_id)
        .single();
      spot = data;
    }
    
    return { ...item, boarding_place, spot };
  }));
  
  return { tour, schedules, journeyItems: journeyItemsWithRelations };
}; 