import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type BoardingPlace = {
  id: string;
  name: string;
  address: string;
  boarding_main?: string;
  boarding_sub?: string;
  parking_main?: string;
  parking_map_url?: string;
  parking_info?: string;
};

type Participant = {
  id: string;
  name: string;
  phone: string;
  pickup_location?: string; // place id
  pickup_time?: string;
  team_name?: string;
};

type Props = { tourId: string };

const BoardingGuidePreview: React.FC<Props> = ({ tourId }) => {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data: placeData, error: placeError } = await supabase.from("singsing_boarding_places").select("*");
      const { data: participantData, error: participantError } = await supabase.from("singsing_participants").select("*").eq("tour_id", tourId);
      if (placeError) setError(placeError.message);
      if (participantError) setError(participantError.message);
      setPlaces(placeData || []);
      setParticipants(participantData || []);
      setLoading(false);
    };
    fetchData();
  }, [tourId]);

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!participants.length) return <div className="text-center py-8 text-gray-500">등록된 참가자가 없습니다.</div>;

  // 탑승지별로 참가자 그룹화
  const grouped = places.map(place => ({
    ...place,
    participants: participants.filter(p => p.pickup_location === place.id)
  })).filter(g => g.participants.length > 0);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">탑승지 안내 미리보기</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {grouped.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative p-6">
            <div className="bg-blue-600 absolute left-0 top-0 bottom-0 w-2 rounded-l-xl"></div>
            <div className="pl-8">
              <div className="text-2xl font-bold text-blue-800 mb-2">{group.name}</div>
              <div className="text-gray-700 mb-2 text-lg">{group.address}</div>
              <div className="flex gap-4 mt-2 text-base">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded">주차: {group.parking_info || group.parking_main}</div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <div className="font-semibold text-gray-800 mb-1">버스탑승지</div>
                  <div className="font-medium text-gray-700 mb-0.5">{group.boarding_main}</div>
                  <div className="text-gray-500 text-sm">{group.boarding_sub}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <div className="font-semibold text-gray-800 mb-1">주차장 오시는길</div>
                  <div className="font-medium text-gray-700 mb-1">{group.parking_main}</div>
                  {group.parking_map_url && <a href={group.parking_map_url} className="bg-blue-600 text-white py-1 px-3 rounded text-base inline-flex items-center hover:bg-blue-700 transition mt-2" target="_blank" rel="noopener noreferrer">네이버 지도에서 보기</a>}
                </div>
              </div>
              {/* 참가자 명단 */}
              <div className="mt-6">
                <div className="font-semibold mb-2">탑승자 명단 ({group.participants.length}명)</div>
                <ul className="list-disc pl-5 text-base">
                  {group.participants.map((p) => (
                    <li key={p.id} className="mb-1">
                      <span className="font-medium">{p.name}</span>
                      {p.team_name && <span className="ml-2 text-gray-500">({p.team_name})</span>}
                      {p.pickup_time && <span className="ml-4 text-blue-700">{p.pickup_time.slice(0,5)}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      {grouped.length === 0 && <div className="text-center py-8 text-gray-500">탑승지별로 배정된 참가자가 없습니다.</div>}
    </div>
  );
};

export default BoardingGuidePreview;
