"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ParticipantsManagerV2 from "@/components/ParticipantsManagerV2";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";
import RoomTypeManager from "@/components/RoomTypeManager";
import IntegratedScheduleManager from "@/components/IntegratedScheduleManager";
import TeeTimeSlotManager from "@/components/TeeTimeSlotManager";
import TeeTimeAssignmentManagerV2 from "@/components/TeeTimeAssignmentManagerV2";
// 사용하지 않는 컴포넌트 import 제거됨
import TourSchedulePreview from "@/components/TourSchedulePreview";
import { Users, BedDouble, Calendar, Flag, MapPin, FileText, Clock } from 'lucide-react';

const TABS = [
  { key: "participants", label: "참가자 관리", icon: <Users className="w-4 h-4" /> },
  { key: "boarding-routes", label: "탑승 경로", icon: <MapPin className="w-4 h-4" /> },
  { key: "rooms", label: "객실 배정", icon: <BedDouble className="w-4 h-4" /> },
  { key: "schedules", label: "일정 관리", icon: <Calendar className="w-4 h-4" /> },
  { key: "tee-times", label: "티타임 관리", icon: <Flag className="w-4 h-4" /> },
  { key: "schedule-preview", label: "문서 미리보기", icon: <FileText className="w-4 h-4" /> },
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
        {activeTab === "boarding-routes" && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">탑승 경로 관리</h3>
              <p className="text-sm text-gray-600">이 투어의 탑승 경로와 시간을 관리하세요.</p>
            </div>
            <IntegratedScheduleManager tourId={tourId} />
          </div>
        )}
        {activeTab === "rooms" && (
          <>
            <RoomTypeManager tourId={tourId} />
            <RoomAssignmentManager tourId={tourId} />
          </>
        )}
        {activeTab === "schedules" && tour && <IntegratedScheduleManager tourId={tourId} />}
        {activeTab === "tee-times" && (
          <>
            <TeeTimeSlotManager tourId={tourId} onDataChange={() => setRefreshKey(prev => prev + 1)} />
            <TeeTimeAssignmentManagerV2 tourId={tourId} refreshKey={refreshKey} />
          </>
        )}

        {activeTab === "schedule-preview" && <TourSchedulePreview tourId={tourId} />}
      </div>
    </div>
  );
};

export default TourDetailPage;