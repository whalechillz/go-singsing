import { supabase } from "@/lib/supabaseClient";
import ProductInfo from "@/components/ProductInfo";

const fetchTourAndSchedules = async (tourId: string) => {
  const { data: tour } = await supabase.from("singsing_tours").select("*").eq("id", tourId).single();
  const { data: schedules } = await supabase.from("singsing_schedules").select("*").eq("tour_id", tourId).order("date", { ascending: true });
  return { tour, schedules };
};

export default async function ProductInfoPage({ params }) {
  const { tour, schedules } = await fetchTourAndSchedules(params.tourId);
  if (!tour) return <div className="p-8 text-center text-red-500">투어 정보를 찾을 수 없습니다.</div>;
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <ProductInfo tour={tour} schedules={schedules || []} />
      </div>
    </div>
  );
} 