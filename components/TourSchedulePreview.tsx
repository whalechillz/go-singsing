"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourScheduleInfo from "./TourScheduleInfo";

// 상품 타입(예시)
type Product = {
  id: string;
  name: string;
  description?: string;
  // 기타 필요한 필드
};

type Tour = {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  driver_name?: string;
  tour_product_id?: string;
  golf_course?: string;
  accommodation?: string;
  // 기타 필요한 필드
};

type Schedule = {
  id: string;
  date: string;
  title: string;
  description?: string;
  meal_breakfast?: boolean;
  meal_lunch?: boolean;
  meal_dinner?: boolean;
};

type Props = { tourId: string };

const TourSchedulePreview: React.FC<Props> = ({ tourId }) => {
  const [tour, setTour] = useState<Tour | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      // 투어 정보
      const { data: tourData, error: tourErr } = await supabase.from("singsing_tours").select("*", { count: "exact" }).eq("id", tourId).single();
      if (tourErr || !tourData) {
        setError("투어 정보를 불러올 수 없습니다.");
        setLoading(false);
        return;
      }
      setTour(tourData);
      // 상품 정보
      if (tourData.tour_product_id) {
        const { data: productData, error: productErr } = await supabase.from("tour_products").select("*").eq("id", tourData.tour_product_id).single();
        if (productErr) setError("상품 정보를 불러올 수 없습니다.");
        setProduct(productData || null);
      }
      // 일정 정보
      const { data: scheduleData, error: scheduleErr } = await supabase.from("singsing_schedules").select("*").eq("tour_id", tourId).order("date", { ascending: true });
      if (scheduleErr) setError("일정 정보를 불러올 수 없습니다.");
      setSchedules(scheduleData || []);
      setLoading(false);
    };
    if (tourId) fetchAll();
  }, [tourId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!tour) return <div className="text-center py-8 text-red-500">투어 정보 없음</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow print:bg-white print:shadow-none">
      <h2 className="text-2xl font-bold mb-2">투어 일정표</h2>
      {product && (
        <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
          <div className="font-bold text-lg mb-1">{product.name}</div>
          {product.description && <div className="text-gray-700 mb-1">{product.description}</div>}
        </div>
      )}
      <TourScheduleInfo tour={tour} schedules={schedules} />
      <div className="mt-6 flex justify-end print:hidden">
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={handlePrint} aria-label="프린트">프린트</button>
      </div>
    </div>
  );
};

export default TourSchedulePreview; 