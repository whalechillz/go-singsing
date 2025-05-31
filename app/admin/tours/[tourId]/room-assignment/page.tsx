"use client";

import { useParams } from "next/navigation";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";

export default function RoomAssignmentPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">투어별 객실 배정</h1>
      <RoomAssignmentManager tourId={tourId} />
    </div>
  );
}