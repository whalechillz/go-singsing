"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourScheduleInfo from "./TourScheduleInfo";
import TourNoticeBox from "./TourNoticeBox";
import TourUsageBox from "./TourUsageBox";
import TourInfoBox from "./TourInfoBox";

// 상품 타입(예시)
type Product = {
  id: string;
  name: string;
  description?: string;
  usage_round?: string;
  usage_hotel?: string;
  usage_meal?: string;
  usage_locker?: string;
  usage_bus?: string;
  usage_tour?: string;
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
  reservation_notice?: string;
  schedule_notice?: string;
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

const dummyNotices = [
  "티오프 시간: 사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다.",
  "객실 배정: 예약 접수 순서대로 진행되오니 참고 부탁드립니다.",
  "식사 서비스: 불참 시에도 별도 환불이 불가하오니 양해 바랍니다.",
  "리무진 좌석: 가는 날 좌석은 오는 날에도 동일하게 이용해 주세요. 멀미 증상이 있으신 분은 사전 요청 시 앞좌석 배정 가능."
];

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

  // usage 배열 동적 생성
  const usage = product
    ? [
        { title: "라운드 규정", items: product.usage_round?.split('\n').filter(Boolean) || [] },
        { title: "숙소 이용", items: product.usage_hotel?.split('\n').filter(Boolean) || [] },
        { title: "식사 안내", items: product.usage_meal?.split('\n').filter(Boolean) || [] },
        { title: "락카 이용", items: product.usage_locker?.split('\n').filter(Boolean) || [] },
        { title: "버스 이용", items: product.usage_bus?.split('\n').filter(Boolean) || [] },
        { title: "관광지 투어", items: product.usage_tour?.split('\n').filter(Boolean) || [] },
      ].filter(section => section.items.length > 0)
    : [];

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow print:bg-white print:shadow-none">
      <h2 className="text-2xl font-bold mb-2">투어 일정표</h2>
      {/* 1. 상품/예약 안내 통합 */}
      <TourInfoBox tour={{ ...tour, notice: tour.reservation_notice?.split('\n').filter(Boolean) || [] }} />
      {/* 2. 일정 안내 */}
      <TourScheduleInfo tour={tour} schedules={schedules} />
      {/* 3. 이용 안내 */}
      {usage.length > 0 ? (
        <TourUsageBox usage={usage} />
      ) : (
        <div className="text-gray-400 text-center py-8">이용안내 정보가 없습니다.</div>
      )}
      <div className="mt-6 flex justify-end print:hidden">
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={handlePrint} aria-label="프린트">프린트</button>
      </div>
    </div>
  );
};

export default TourSchedulePreview; 