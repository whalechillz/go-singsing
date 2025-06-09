"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DebugPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      console.log("=== DEBUG START ===");
      
      const info: any = {
        timestamp: new Date().toISOString(),
        tourId: tourId,
        url: window.location.href,
        params: params,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      };

      try {
        // 1. 투어 정보 확인
        const { data: tour, error: tourError } = await supabase
          .from("singsing_tours")
          .select("id, title, start_date, end_date")
          .eq("id", tourId)
          .single();

        info.tour = tour;
        info.tourError = tourError;

        // 2. 여정 아이템 확인
        const { data: journeyItems, error: journeyError } = await supabase
          .from("tour_journey_items")
          .select("id, tour_id, day_number, order_index, type")
          .eq("tour_id", tourId)
          .limit(5);

        info.journeyItems = journeyItems;
        info.journeyItemsCount = journeyItems?.length || 0;
        info.journeyError = journeyError;

        // 3. 탑승지 확인
        const { data: boardingPlaces, error: boardingError } = await supabase
          .from("singsing_boarding_places")
          .select("id, name")
          .limit(3);

        info.boardingPlaces = boardingPlaces;
        info.boardingPlacesCount = boardingPlaces?.length || 0;
        info.boardingError = boardingError;

        // 4. 관광지 확인
        const { data: attractions, error: attractionError } = await supabase
          .from("tourist_attractions")
          .select("id, name, is_active")
          .eq("is_active", true)
          .limit(3);

        info.attractions = attractions;
        info.attractionsCount = attractions?.length || 0;
        info.attractionError = attractionError;

        // 5. 현재 사용자 확인
        const { data: { user } } = await supabase.auth.getUser();
        info.user = user ? { id: user.id, email: user.email } : null;

      } catch (error) {
        info.generalError = error;
      }

      console.log("=== DEBUG INFO ===", info);
      setDebugInfo(info);
      setLoading(false);
    };

    if (tourId) {
      runDebug();
    }
  }, [tourId]);

  if (loading) {
    return <div className="p-8">디버그 정보 수집 중...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">디버그 정보</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">기본 정보</h2>
        <p>Tour ID: {debugInfo.tourId || "없음"}</p>
        <p>URL: {debugInfo.url}</p>
        <p>타임스탬프: {debugInfo.timestamp}</p>
        <p>Supabase URL: {debugInfo.supabaseUrl}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">투어 정보</h2>
        {debugInfo.tourError ? (
          <p className="text-red-600">에러: {JSON.stringify(debugInfo.tourError)}</p>
        ) : debugInfo.tour ? (
          <div>
            <p>제목: {debugInfo.tour.title}</p>
            <p>기간: {debugInfo.tour.start_date} ~ {debugInfo.tour.end_date}</p>
          </div>
        ) : (
          <p>투어 정보 없음</p>
        )}
      </div>

      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">데이터 카운트</h2>
        <p>여정 아이템: {debugInfo.journeyItemsCount}개</p>
        <p>탑승지: {debugInfo.boardingPlacesCount}개</p>
        <p>관광지: {debugInfo.attractionsCount}개</p>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">사용자 정보</h2>
        {debugInfo.user ? (
          <div>
            <p>ID: {debugInfo.user.id}</p>
            <p>Email: {debugInfo.user.email}</p>
          </div>
        ) : (
          <p>로그인되지 않음</p>
        )}
      </div>

      <div className="bg-gray-200 p-4 rounded-lg">
        <h2 className="font-bold mb-2">전체 디버그 정보 (콘솔 확인)</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}
