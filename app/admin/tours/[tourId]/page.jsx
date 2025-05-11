"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ParticipantsManager from "@/components/ParticipantsManager";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";
import RoomTypeManager from "@/components/RoomTypeManager";
import ScheduleManager from "@/components/ScheduleManager";

const TABS = [
  { key: "participants", label: "참가자 관리" },
  { key: "rooms", label: "객실 배정" },
  { key: "schedules", label: "일정 관리" },
];

const TourDetailPage = () => {
  const params = useParams();
  const tourId = params?.tourId;
  const [activeTab, setActiveTab] = useState("participants");
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      const { data } = await supabase.from("singsing_tours").select("*").eq("id", tourId).single();
      setTour(data);
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
        {activeTab === "schedules" && <ScheduleManager tourId={tourId} />}
      </div>
    </div>
  );
};

export default TourDetailPage; 