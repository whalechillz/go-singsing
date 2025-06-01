"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import TeeTimeSlotManager from "@/components/TeeTimeSlotManager";
import TeeTimeAssignmentManagerV2 from "@/components/TeeTimeAssignmentManagerV2";
import { ParticipantDuplicateCleaner } from "@/components/ParticipantDuplicateCleaner";
import { TeeTimeParticipantCleaner } from "@/components/TeeTimeParticipantCleaner";

export default function TeeTimePage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDuplicateCleaner, setShowDuplicateCleaner] = useState(false);
  const [showTeeTimeCleaner, setShowTeeTimeCleaner] = useState(false);
  
  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "투어별 티오프시간 관리 - 싱싱골프투어";
  }, []);
  
  // 데이터 변경 시 호출될 콜백
  const handleDataChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">투어별 티오프시간 관리</h1>
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
      <TeeTimeAssignmentManagerV2 key={refreshKey} tourId={tourId} refreshKey={refreshKey} />
    </div>
  );
}