"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ParticipantsManager from "@/components/ParticipantsManager";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";
import RoomTypeManager from "@/components/RoomTypeManager";
import ScheduleManager from "@/components/ScheduleManager";
import TeeTimeManager from "@/components/TeeTimeManager";
import BoardingScheduleManager from "@/components/BoardingScheduleManager";
import BoardingGuidePreview from "@/components/BoardingGuidePreview";
import TourSchedulePreview from "@/components/TourSchedulePreview";

const TABS = [
  { key: "participants", label: "투어별 참가자 관리" },
  { key: "rooms", label: "투어별 객실 배정" },
  { key: "schedules", label: "투어별 일정관리" },
  { key: "tee-times", label: "티오프시간 관리" },
  { key: "pickup-points", label: "탑승 스케쥴 관리" },
  { key: "schedule-preview", label: "투어 일정표 미리보기" },
];

type Tour = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  driver_name: string;
};

type Params = { tourId?: string };

const TourDetailPage: React.FC = () => {
  const params = useParams() as Params;
  const tourId = params?.tourId ?? "";
  const [activeTab, setActiveTab] = useState<string>("participants");
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      const { data } = await supabase.from("singsing_tours").select("*").eq("id", tourId).single();
      setTour(data as Tour);
      setLoading(false);
    };
    if (tourId) fetchTour();
  }, [tourId]);

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;
  if (!tour) return <div className="text-center py-8 text-red-500">투어 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{tour.title}</h1>
      <div className="text-gray-700 dark:text-gray-300 mb-6">{tour.start_date} ~ {tour.end_date} | 기사님: {tour.driver_name}</div>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === tab.key ? "bg-blue-800 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            onClick={() => setActiveTab(tab.key)}
            aria-label={tab.label}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-b-lg p-6 min-h-[200px]">
        {activeTab === "participants" && <ParticipantsManager tourId={tourId} />}
        {activeTab === "rooms" && (
          <>
            <RoomTypeManager tourId={tourId} />
            <RoomAssignmentManager tourId={tourId} />
          </>
        )}
        {activeTab === "schedules" && tour && <ScheduleManager tourId={tourId} tour={tour} />}
        {activeTab === "tee-times" && <TeeTimeManager tourId={tourId} />}
        {activeTab === "pickup-points" && (
          <>
            <BoardingScheduleManager tourId={tourId} />
            <div className="mt-6 flex justify-end">
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                onClick={() => setShowPreview(true)}
                aria-label="탑승지 안내 미리보기"
              >
                탑승지 안내 미리보기
              </button>
            </div>
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                    onClick={() => setShowPreview(false)}
                    aria-label="미리보기 닫기"
                  >
                    ×
                  </button>
                  <BoardingGuidePreview tourId={tourId} />
                </div>
              </div>
            )}
          </>
        )}
        {activeTab === "schedule-preview" && <TourSchedulePreview tourId={tourId} />}
      </div>
    </div>
  );
};

export default TourDetailPage; 