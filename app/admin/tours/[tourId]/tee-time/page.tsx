"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import TeeTimeSlotManager from "@/components/TeeTimeSlotManager";
import TeeTimeAssignmentManager from "@/components/TeeTimeAssignmentManager";
import TeeTimeAssignmentManagerV2 from "@/components/TeeTimeAssignmentManagerV2";
import { ParticipantDuplicateCleaner } from "@/components/ParticipantDuplicateCleaner";

export default function TeeTimePage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [useNewVersion, setUseNewVersion] = useState(true); // 새 버전 사용 여부
  const [showDuplicateCleaner, setShowDuplicateCleaner] = useState(false); // 중복 정리 도구 표시
  
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
          onClick={() => setUseNewVersion(!useNewVersion)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {useNewVersion ? '기존 버전 사용' : '개선된 버전 사용'}
        </button>
        <span className="text-gray-400">|</span>
        <button
          onClick={() => setShowDuplicateCleaner(!showDuplicateCleaner)}
          className="text-sm text-orange-600 hover:text-orange-800"
        >
          {showDuplicateCleaner ? '중복 정리 도구 숨기기' : '중복 참가자 정리'}
        </button>
      </div>
      
      {showDuplicateCleaner && (
        <div className="mb-6">
          <ParticipantDuplicateCleaner tourId={tourId} />
        </div>
      )}
      
      <TeeTimeSlotManager tourId={tourId} onDataChange={handleDataChange} />
      {useNewVersion ? (
        <TeeTimeAssignmentManagerV2 key={refreshKey} tourId={tourId} refreshKey={refreshKey} />
      ) : (
        <TeeTimeAssignmentManager key={refreshKey} tourId={tourId} refreshKey={refreshKey} />
      )}
    </div>
  );
}