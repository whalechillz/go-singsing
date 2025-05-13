'use server'

import { supabase } from "@/lib/supabaseClient";

export const fetchTourAndSchedules = async (tourId: string) => {
  const { data: tour } = await supabase.from("singsing_tours").select("*").eq("id", tourId).single();
  const { data: schedules } = await supabase.from("singsing_schedules").select("*").eq("tour_id", tourId).order("date", { ascending: true });
  return { tour, schedules };
}; 