"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import TeeTimeSlotManager from "@/components/TeeTimeSlotManager";
import TeeTimeAssignmentManager from "@/components/TeeTimeAssignmentManager";
import { ParticipantDuplicateCleaner } from "@/components/ParticipantDuplicateCleaner";
import { TeeTimeParticipantCleaner } from "@/components/TeeTimeParticipantCleaner";
import { supabase } from "@/lib/supabaseClient";

export default function TeeTimePage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDuplicateCleaner, setShowDuplicateCleaner] = useState(false);
  const [showTeeTimeCleaner, setShowTeeTimeCleaner] = useState(false);
  const [tourData, setTourData] = useState<any>(null);
  
  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "투어별 티오프시간 관리 - 싱싱골프투어";
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
      {/* 보라색 그라데이션 헤더 */}
      <div className="bg-gradient-to-r from-[#6B46C1] via-[#7C3AED] to-[#9333EA] text-white">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">티타임표</h1>
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
          <div className="mt-3 text-lg opacity-90">
            싱싱골프투어
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowDuplicateCleaner(!showDuplicateCleaner)}
            className="text-sm text-orange-600 hover:text-orange-800"
          >
            {showDuplicateCleaner ? '참가자 중복 정리 숨기기' : '참가자 중복 정리'}
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => setShowTeeTimeCleaner(!showTeeTimeCleaner)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            {showTeeTimeCleaner ? '티타임 중복 정리 숨기기' : '티타임 중복 정리'}
          </button>
        </div>
        
        {showDuplicateCleaner && (
          <div className="mb-6">
            <ParticipantDuplicateCleaner tourId={tourId} />
          </div>
        )}
        
        {showTeeTimeCleaner && (
          <div className="mb-6">
            <TeeTimeParticipantCleaner tourId={tourId} onComplete={handleDataChange} />
          </div>
        )}
        
        <TeeTimeSlotManager tourId={tourId} onDataChange={handleDataChange} />
        <TeeTimeAssignmentManager key={refreshKey} tourId={tourId} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
