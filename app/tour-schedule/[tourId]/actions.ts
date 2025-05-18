'use server'

import { supabase } from "@/lib/supabaseClient";

type TourData = {
  tour: any;
  schedules: any[] | null;
}

export const fetchTourAndSchedules = async (tourId: string): Promise<TourData> => {
  const { data: tour } = await supabase.from("singsing_tours").select("*").eq("id", tourId).single();
  const { data: schedules } = await supabase.from("singsing_schedules").select("*").eq("tour_id", tourId).order("date", { ascending: true });
  return { tour, schedules };
}; 