"use client";

import { useParams } from "next/navigation";
import BoardingScheduleManager from "@/components/BoardingScheduleManager";

export default function BoardingSchedulesPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  
  return <BoardingScheduleManager tourId={tourId} />;
}