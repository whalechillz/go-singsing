"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourPromotionManager from "@/components/TourPromotionManager";
import { ArrowLeft } from "lucide-react";

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

export default function TourPromotionPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTour();
  }, [tourId]);

  const fetchTour = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("singsing_tours")
      .select("*")
      .eq("id", tourId)
      .single();

    if (error) {
      console.error("Error fetching tour:", error);
    } else {
      setTour(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">투어를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/promotions")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tour.title}</h1>
            <p className="text-sm text-gray-600 mt-1">홍보 페이지 편집</p>
          </div>
        </div>
      </div>

      {/* 홍보 페이지 관리 컴포넌트 */}
      <div className="bg-white rounded-lg shadow-sm">
        <TourPromotionManager tourId={tourId} />
      </div>
    </div>
  );
}