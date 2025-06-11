"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import RoomTypeManager from "@/components/RoomTypeManager";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";
import { supabase } from "@/lib/supabaseClient";

export default function RoomAssignmentPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [tourData, setTourData] = useState<any>(null);
  
  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "투어별 객실 배정 - 싱싱골프투어";
  }, []);
  
  // 투어 정보 가져오기
  useEffect(() => {
    const fetchTourData = async () => {
      const { data, error } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single();
      
      if (data && !error) {
        setTourData(data);
      }
    };
    
    if (tourId) {
      fetchTourData();
    }
  }, [tourId]);
  
  // 데이터 변경 시 호출될 콜백
  const handleDataChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네이비색 헤더 */}
      <div className="bg-gradient-to-r from-[#2c5282] to-[#3182ce] text-white">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">객실 배정표</h1>
          <p className="text-xl opacity-90">
            {tourData?.title || "투어 정보 로딩중..."}
          </p>
          {tourData?.start_date && tourData?.end_date && (
            <p className="text-lg opacity-80 mt-2">
              {new Date(tourData.start_date).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} ~ {new Date(tourData.end_date).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <RoomTypeManager tourId={tourId} onDataChange={handleDataChange} />
        <RoomAssignmentManager key={refreshKey} tourId={tourId} refreshKey={refreshKey} />
      </div>
    </div>
  );
}