"use client";
import { useParams } from "next/navigation";
import ParticipantsManagerV2 from "@/components/ParticipantsManagerV2";

export default function TourParticipantsPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  
  return (
    <div className="p-8">
      {/* ParticipantsManagerV2 컴포넌트를 재사용하여 일괄 기능 제공 */}
      <ParticipantsManagerV2 
        tourId={tourId}
        // 투어별 페이지에서는 '투어' 컬럼 제외
        showColumns={["선택", "이름", "연락처", "팀", "탑승지", "객실", "참여횟수", "결제상태", "상태", "메모", "관리"]}
      />
    </div>
  );
}