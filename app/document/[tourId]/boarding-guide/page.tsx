import BoardingGuidePreview from "@/components/BoardingGuidePreview";
import { useParams } from "next/navigation";

const BoardingGuideDocumentPage = () => {
  const params = useParams();
  const tourId = typeof params.tourId === "string" ? params.tourId : Array.isArray(params.tourId) ? params.tourId[0] : "";
  if (!tourId) return <div className="p-8 text-center text-red-500">투어 ID가 없습니다.</div>;
  return <BoardingGuidePreview tourId={tourId} />;
};

export default BoardingGuideDocumentPage; 