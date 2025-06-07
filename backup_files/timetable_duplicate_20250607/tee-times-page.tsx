"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const TeeTimesPage = () => {
  const params = useParams();
  const router = useRouter();
  const tourId = typeof params.tourId === "string" ? params.tourId : Array.isArray(params.tourId) ? params.tourId[0] : "";
  
  useEffect(() => {
    // /tee-time 페이지로 리다이렉트
    if (tourId) {
      router.replace(`/admin/tours/${tourId}/tee-time`);
    } else {
      router.replace('/admin/tours');
    }
  }, [tourId, router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">티오프시간 관리 페이지로 이동 중...</p>
      </div>
    </div>
  );
};

export default TeeTimesPage;