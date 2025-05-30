"use client";

import { useParams } from "next/navigation";
import RoomAssignmentManager from "@/components/RoomAssignmentManager";

export default function RoomAssignmentPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  
  return <RoomAssignmentManager tourId={tourId} />;
}