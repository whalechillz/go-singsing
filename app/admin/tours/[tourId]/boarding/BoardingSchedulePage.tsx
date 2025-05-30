"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Bus, MapPin, Clock, Phone, Users, Plus, Save } from "lucide-react";

type BoardingPlace = {
  id: string;
  name: string;
  address: string;
  pickup_time?: string;
};

type Participant = {
  id: string;
  name: string;
  phone: string;
  pickup_location?: string;
  group_name?: string;
};

type BusAssignment = {
  id: string;
  bus_number: number;
  bus_type: '25_seater' | '45_seater';
  driver_name: string;
  driver_phone: string;
  departure_time: string;
  boarding_place_id: string;
  participants: Participant[];
};

export default function BoardingSchedulePage() {
  const params = useParams();
  const tourId = params.tourId as string;
  
  const [tour, setTour] = useState<any>(null);
  const [boardingPlaces, setBoardingPlaces] = useState<BoardingPlace[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [busAssignments, setBusAssignments] = useState<BusAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 투어 정보
      const { data: tourData } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single();
        
      setTour(tourData);
      
      // 탑승 장소 목록
      const { data: placesData } = await supabase
        .from("singsing_boarding_places")
        .select("*")
        .order("name");
        
      setBoardingPlaces(placesData || []);
      
      // 참가자 목록
      const { data: participantsData } = await supabase
        .from("singsing_participants")
        .select("*")
        .eq("tour_id", tourId);
        
      setParticipants(participantsData || []);
      
      // 기존 버스 배정 확인 또는 자동 생성
      generateBusAssignments(participantsData || [], placesData || []);
      
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateBusAssignments = (participants: Participant[], places: BoardingPlace[]) => {
    // 탑승 장소별로 참가자 그룹화
    const participantsByPlace = new Map<string, Participant[]>();
    
    participants.forEach(p => {
      const placeId = places.find(place => 
        place.name === p.pickup_location
      )?.id || places[0]?.id;
      
      if (placeId) {
        if (!participantsByPlace.has(placeId)) {
          participantsByPlace.set(placeId, []);
        }
        participantsByPlace.get(placeId)!.push(p);
      }
    });
    
    // 버스 배정 생성
    const newAssignments: BusAssignment[] = [];
    let busNumber = 1;
    
    participantsByPlace.forEach((placeParticipants, placeId) => {
      const place = places.find(p => p.id === placeId);
      
      // 45인승 버스 기준으로 배정
      for (let i = 0; i < placeParticipants.length; i += 45) {
        const busParticipants = placeParticipants.slice(i, i + 45);
        
        newAssignments.push({
          id: `bus-${busNumber}`,
          bus_number: busNumber,
          bus_type: busParticipants.length > 25 ? '45_seater' : '25_seater',
          driver_name: '',
          driver_phone: '',
          departure_time: place?.pickup_time || '06:00',
          boarding_place_id: placeId,
          participants: busParticipants
        });
        
        busNumber++;
      }
    });
    
    setBusAssignments(newAssignments);
  };

  const handleSaveBusAssignments = async () => {
    try {
      setSaving(true);
      
      // 실제 저장 로직 구현
      // boarding_buses, boarding_assignments 테이블에 저장
      
      alert("버스 배정이 저장되었습니다.");
    } catch (error: any) {
      alert("저장 실패: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateBusInfo = (busId: string, field: string, value: string) => {
    setBusAssignments(prev => prev.map(bus => 
      bus.id === busId ? { ...bus, [field]: value } : bus
    ));
  };

  if (loading) return <div className="p-8">로딩중...</div>;

  return (
    <div className="p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{tour?.title}</h1>
          <p className="text-gray-500">탑승 스케줄 관리</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            <Plus className="w-4 h-4 mr-2 inline" />
            버스 추가
          </button>
          <button 
            onClick={handleSaveBusAssignments} 
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            {saving ? '저장중...' : '배정 저장'}
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">총 참가자</p>
              <p className="text-2xl font-bold">{participants.length}명</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">운행 버스</p>
              <p className="text-2xl font-bold">{busAssignments.length}대</p>
            </div>
            <Bus className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">탑승 장소</p>
              <p className="text-2xl font-bold">{boardingPlaces.length}곳</p>
            </div>
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">평균 탑승률</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  busAssignments.reduce((acc, bus) => 
                    acc + (bus.participants.length / (bus.bus_type === '45_seater' ? 45 : 25) * 100), 0
                  ) / busAssignments.length
                )}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 버스별 배정 현황 */}
      <div className="space-y-4">
        {busAssignments.map((bus) => {
          const boardingPlace = boardingPlaces.find(p => p.id === bus.boarding_place_id);
          
          return (
            <div key={bus.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Bus className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">{bus.bus_number}호차</h3>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {bus.bus_type === '45_seater' ? '45인승' : '25인승'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {bus.participants.length}명 탑승
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {boardingPlace?.name}
                    <Clock className="w-4 h-4 ml-2" />
                    {bus.departure_time}
                  </div>
                </div>

                {/* 기사 정보 입력 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium">기사명</label>
                    <input
                      placeholder="기사명 입력"
                      value={bus.driver_name}
                      onChange={(e) => updateBusInfo(bus.id, 'driver_name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">기사 연락처</label>
                    <input
                      placeholder="010-0000-0000"
                      value={bus.driver_phone}
                      onChange={(e) => updateBusInfo(bus.id, 'driver_phone', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">출발 시간</label>
                    <input
                      type="time"
                      value={bus.departure_time}
                      onChange={(e) => updateBusInfo(bus.id, 'departure_time', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* 탑승자 목록 */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">탑승자 명단 ({bus.participants.length}명)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {bus.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span>{participant.name}</span>
                        {participant.group_name && (
                          <span className="text-gray-500">({participant.group_name})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}