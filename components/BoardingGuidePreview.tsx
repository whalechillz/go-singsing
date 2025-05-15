"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// 타입 정의
interface BoardingPlace {
  id: string;
  name: string;
  address: string;
  boarding_main?: string;
  boarding_sub?: string;
  parking_main?: string;
  parking_map_url?: string;
}
interface BoardingSchedule {
  id: string;
  tour_id: string;
  place_id: string;
  date: string;
  depart_time?: string;
  arrive_time?: string;
  parking_info?: string;
  memo?: string;
}

type Props = { tourId: string };

const BoardingGuidePreview: React.FC<Props> = ({ tourId }) => {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [schedules, setSchedules] = useState<BoardingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideContent, setGuideContent] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: placeData } = await supabase.from("singsing_boarding_places").select("*");
      const { data: scheduleData, error } = await supabase.from("singsing_boarding_schedules").select("*").eq("tour_id", tourId).order("date").order("depart_time");
      setPlaces(placeData || []);
      setSchedules(scheduleData || []);
      const { data: guideDoc } = await supabase.from("documents").select("content").eq("tour_id", tourId).eq("type", "boarding-guide").single();
      setGuideContent(guideDoc?.content || "");
      if (error) setError(error.message);
      setLoading(false);
    };
    fetchData();
  }, [tourId]);

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!schedules.length) return <div className="text-center py-8 text-gray-500">등록된 탑승지 스케줄이 없습니다.</div>;

  // 스케줄별로 place 정보 매칭
  const getPlace = (place_id: string) => places.find(p => p.id === place_id);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">탑승지 안내 미리보기</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {schedules.map((schedule) => {
          const place = getPlace(schedule.place_id);
          return (
            <div key={schedule.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative p-6">
              <div className="bg-blue-600 absolute left-0 top-0 bottom-0 w-2 rounded-l-xl"></div>
              <div className="pl-8">
                <div className="text-2xl font-bold text-blue-800 mb-2">{place?.name}</div>
                <div className="text-4xl font-extrabold text-red-600 mb-1">{schedule.depart_time?.slice(0,5)}</div>
                <div className="text-gray-700 mb-2 text-lg">{schedule.date}</div>
                <div className="flex gap-4 mt-2 text-base">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded">주차: {schedule.parking_info}</div>
                  <div className="bg-red-50 text-red-600 px-3 py-1 rounded">{schedule.arrive_time && `${schedule.arrive_time.slice(0,5)} 도착`}</div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="font-semibold text-gray-800 mb-1">버스탑승지</div>
                    <div className="font-medium text-gray-700 mb-0.5">{place?.boarding_main}</div>
                    <div className="text-gray-500 text-sm">{place?.boarding_sub}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="font-semibold text-gray-800 mb-1">주차장 오시는길</div>
                    <div className="font-medium text-gray-700 mb-1">{place?.parking_main}</div>
                    {place?.parking_map_url && <a href={place.parking_map_url} className="bg-blue-600 text-white py-1 px-3 rounded text-base inline-flex items-center hover:bg-blue-700 transition mt-2" target="_blank" rel="noopener noreferrer">네이버 지도에서 보기</a>}
                  </div>
                </div>
                {schedule.memo && <div className="mt-3 text-gray-600 text-base">메모: {schedule.memo}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {guideContent && (
        <div className="mt-8 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: guideContent }} />
        </div>
      )}
    </div>
  );
};

export default BoardingGuidePreview; 