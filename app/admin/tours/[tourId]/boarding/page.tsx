"use client";

import { useParams } from "next/navigation";
import BoardingGuidePreview from "@/components/BoardingGuidePreview";

export default function BoardingGuidePage() {
  const params = useParams();
  const tourId = params.tourId as string;
  
  return <BoardingGuidePreview tourId={tourId} />;
}