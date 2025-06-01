"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ParticipantsManagerV2 from "@/components/ParticipantsManagerV2";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";
import RoomTypeManager from "@/components/RoomTypeManager";
import ScheduleManager from "@/components/ScheduleManager";
import TeeTimeSlotManager from "@/components/TeeTimeSlotManager";
import TeeTimeAssignmentManagerV2 from "@/components/TeeTimeAssignmentManagerV2";
import BoardingScheduleManager from "@/components/BoardingScheduleManager";
import BoardingGuidePreview from "@/components/BoardingGuidePreview";
import TourSchedulePreview from "@/components/TourSchedulePreview";
import { Users, BedDouble, Calendar, Flag, Bus, FileText } from 'lucide-react';

const TABS = [
  { key: "participants", label: "투어별 참가자 관리", icon: <Users className="w-4 h-4" /> },
  { key: "rooms", label: "투어별 객실 배정", icon: <BedDouble className="w-4 h-4" /> },
  { key: "schedules", label: "투어별 일정관리", icon: <Calendar className="w-4 h-4" /> },
  { key: "tee-times", label: "티오프시간 관리", icon: <Flag className="w-4 h-4" /> },
  { key: "boarding-guide", label: "탑승지 안내 미리보기", icon: <Bus className="w-4 h-4" /> },
  { key: "schedule-preview", label: "투어 일정표 미리보기", icon: <FileText className="w-4 h-4" /> },
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
  const [refreshKey, setRefreshKey] = useState(0);

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
    <div className="max-w-7xl mx-auto">
      {/* 탭 버튼들 */}
      <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-5 py-3 font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap relative
                ${activeTab === tab.key 
                  ? "text-blue-600 bg-gray-50" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab(tab.key)}
              aria-label={tab.label}
            >
              <span className={`transition-colors ${
                activeTab === tab.key ? "text-blue-600" : "text-gray-400"
              }`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* 탭 컨텐츠 */}
      <div className="bg-white rounded-b-lg shadow-sm p-6">
        {activeTab === "participants" && <ParticipantsManagerV2 tourId={tourId} showColumns={["이름", "연락처", "팀", "탑승지", "객실", "참여횟수", "상태", "관리"]} />}
        {activeTab === "rooms" && (
          <>
            <RoomTypeManager tourId={tourId} />
            <RoomAssignmentManager tourId={tourId} />
          </>
        )}
        {activeTab === "schedules" && tour && <ScheduleManager tourId={tourId} tour={tour} />}
        {activeTab === "tee-times" && (
          <>
            <TeeTimeSlotManager tourId={tourId} onDataChange={() => setRefreshKey(prev => prev + 1)} />
            <TeeTimeAssignmentManagerV2 tourId={tourId} refreshKey={refreshKey} />
          </>
        )}
        {activeTab === "boarding-guide" && <BoardingGuidePreview tourId={tourId} />}
        {activeTab === "schedule-preview" && <TourSchedulePreview tourId={tourId} />}
      </div>
    </div>
  );
};

export default TourDetailPage;