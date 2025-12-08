"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourCommunicationsViewer from "@/components/admin/tours/TourCommunicationsViewer";

export default function TourCommunicationsPage() {
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
        .select("id, title")
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니케이션 관리</h1>
        <p className="text-gray-600 text-sm">{tour.title}</p>
      </div>
      <TourCommunicationsViewer tourId={tourId} tourTitle={tour.title} />
    </div>
  );
}
