import { useParams } from "next/navigation";
import TeeTimeManager from "@/components/TeeTimeManager";

const TeeTimesPage = () => {
  const params = useParams();
  const tourId = typeof params.tourId === "string" ? params.tourId : Array.isArray(params.tourId) ? params.tourId[0] : "";
  if (!tourId) return <div className="p-8 text-center text-red-500">투어 ID가 없습니다.</div>;
  return <TeeTimeManager tourId={tourId} />;
};

export default TeeTimesPage; 