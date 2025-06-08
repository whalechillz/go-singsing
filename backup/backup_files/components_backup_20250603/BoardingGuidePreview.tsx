"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Clock, Car, Users, Phone, Eye, EyeOff } from "lucide-react";

// 타입 정의
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
  pickup_location?: string; // 탑승지 이름
  pickup_time?: string;
  team_name?: string;
};

type Props = { tourId: string };

const BoardingGuidePreview: React.FC<Props> = ({ tourId }) => {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'customer' | 'staff'>('customer');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: placeData, error: placeError } = await supabase
          .from("singsing_boarding_places")
          .select("*");
          
        const { data: participantData, error: participantError } = await supabase
          .from("singsing_participants")
          .select("*")
          .eq("tour_id", tourId)
          .not("pickup_location", "is", null);
          
        if (placeError) throw placeError;
        if (participantError) throw participantError;
        
        setPlaces(placeData || []);
        setParticipants(participantData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tourId]);

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!participants.length) return <div className="text-center py-8 text-gray-500">탑승지가 배정된 참가자가 없습니다.</div>;

  // 탑승지별로 참가자 그룹화 (이름으로 매칭)
  const grouped = places.map(place => ({
    ...place,
    participants: participants.filter(p => 
      p.pickup_location === place.id || 
      p.pickup_location === place.name ||
      p.pickup_location?.toLowerCase() === place.name?.toLowerCase()
    )
  })).filter(g => g.participants.length > 0);

  // 도착시간 계산 (출발시간 20분 전)
  const calculateArrivalTime = (departureTime?: string) => {
    if (!departureTime) return null;
    try {
      const [hours, minutes] = departureTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 20;
      const arrivalHours = Math.floor(totalMinutes / 60);
      const arrivalMinutes = totalMinutes % 60;
      return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
    } catch {
      return null;
    }
  };

  // 고객용 카드 뷰
  const CustomerView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {grouped.map((group) => {
        // 이 탑승지의 가장 빠른 출발시간 찾기
        const earliestTime = group.participants
          .map(p => p.pickup_time)
          .filter(Boolean)
          .sort()[0];
        const arrivalTime = calculateArrivalTime(earliestTime);
        
        return (
          <div key={group.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {group.name}
              </h3>
            </div>
            
            <div className="p-6">
              {/* 시간 정보 */}
              {earliestTime && (
                <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">출발시간: {earliestTime}</span>
                  </div>
                  {arrivalTime && (
                    <div className="text-sm text-blue-600 mt-1 ml-7">
                      도착시간: {arrivalTime} (20분 전 도착 권장)
                    </div>
                  )}
                </div>
              )}
              
              {/* 주소 */}
              <div className="mb-4">
                <div className="text-gray-700">{group.address}</div>
              </div>
              
              {/* 주차 정보 */}
              {group.parking_info && (
                <div className="mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">주차: {group.parking_info}</span>
                </div>
              )}
              
              {/* 탑승지 상세 */}
              {group.boarding_main && (
                <div className="mb-4 bg-gray-50 p-4 rounded">
                  <div className="font-semibold text-gray-800 mb-1">버스 탑승 위치</div>
                  <div className="text-gray-700">{group.boarding_main}</div>
                  {group.boarding_sub && (
                    <div className="text-sm text-gray-500 mt-1">{group.boarding_sub}</div>
                  )}
                </div>
              )}
              
              {/* 주차장 안내 */}
              {(group.parking_main || group.parking_map_url) && (
                <div className="bg-gray-50 p-4 rounded">
                  <div className="font-semibold text-gray-800 mb-1">주차장 안내</div>
                  {group.parking_main && (
                    <div className="text-gray-700 mb-2">{group.parking_main}</div>
                  )}
                  {group.parking_map_url && (
                    <a 
                      href={group.parking_map_url} 
                      className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MapPin className="w-4 h-4" />
                      네이버 지도 보기
                    </a>
                  )}
                </div>
              )}
              
              {/* 탑승 인원 */}
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>탑승 인원: {group.participants.length}명</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 스탭용 상세 뷰
  const StaffView = () => (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <h3 className="text-lg font-bold">{group.name}</h3>
            <div className="text-sm mt-1">{group.address}</div>
          </div>
          
          <div className="p-6">
            {/* 탑승지 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="font-semibold text-gray-700 mb-2">탑승지 정보</div>
                {group.boarding_main && (
                  <div className="text-sm">
                    <span className="font-medium">버스 탑승:</span> {group.boarding_main}
                    {group.boarding_sub && <div className="text-gray-500 ml-4">{group.boarding_sub}</div>}
                  </div>
                )}
                {group.parking_info && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">주차:</span> {group.parking_info}
                  </div>
                )}
              </div>
              
              <div>
                <div className="font-semibold text-gray-700 mb-2">주차장 안내</div>
                {group.parking_main && (
                  <div className="text-sm">{group.parking_main}</div>
                )}
                {group.parking_map_url && (
                  <a 
                    href={group.parking_map_url} 
                    className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    📍 지도 링크
                  </a>
                )}
              </div>
            </div>
            
            {/* 참가자 명단 (스탭용) */}
            <div>
              <div className="font-semibold text-gray-700 mb-3">탑승자 명단 ({group.participants.length}명)</div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">팀명</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">출발시간</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">도착시간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {group.participants.map((p) => {
                      const arrival = calculateArrivalTime(p.pickup_time);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium">{p.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{p.team_name || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            <a href={`tel:${p.phone}`} className="hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {p.phone || '-'}
                            </a>
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-blue-600">
                            {p.pickup_time ? p.pickup_time.slice(0, 5) : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {arrival || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">탑승지 안내</h2>
        
        {/* 뷰 모드 전환 */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('customer')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
              viewMode === 'customer'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            고객용
          </button>
          <button
            onClick={() => setViewMode('staff')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
              viewMode === 'staff'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            스탭용
          </button>
        </div>
      </div>
      
      {/* 콘텐츠 */}
      {grouped.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          탑승지별로 배정된 참가자가 없습니다.
        </div>
      ) : (
        viewMode === 'customer' ? <CustomerView /> : <StaffView />
      )}
    </div>
  );
};

export default BoardingGuidePreview; 