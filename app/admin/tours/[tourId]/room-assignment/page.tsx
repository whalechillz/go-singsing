"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import RoomTypeManager from "@/components/RoomTypeManager";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";

export default function RoomAssignmentPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "투어별 객실 배정 - 싱싱골프투어";
  }, []);
  
  // 데이터 변경 시 호출될 콜백
  const handleDataChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">투어별 객실 배정</h1>
      <RoomTypeManager tourId={tourId} onDataChange={handleDataChange} />
      <RoomAssignmentManager key={refreshKey} tourId={tourId} refreshKey={refreshKey} />
    </div>
  );
}