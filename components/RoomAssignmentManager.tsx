"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Check, AlertCircle, RefreshCw, X } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  room_id?: string | null;
  singsing_rooms?: {
    room_type?: string;
    room_seq?: number;
    room_number?: string;
  };
};

type Room = {
  id: string;
  room_type: string;
  room_seq: number;
  room_number?: string;
  capacity: number;
  quantity: number;
  tour_id: string;
};

type Tour = {
  id: string;
  title: string;  // 실제 DB 커럼명
  start_date: string;
  end_date: string;
  driver_name?: string;
  driver_phone?: string;
};

type Staff = {
  id: string;
  tour_id: string;
  name: string;
  phone: string;
  role: string;
  order: number;
};

type Props = { tourId: string; refreshKey?: number };

const RoomAssignmentManager: React.FC<Props> = ({ tourId, refreshKey }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tour, setTour] = useState<Tour | null>(null);
  const [tourStaff, setTourStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 데이터 fetch
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: participantsData, error: participantsError }, { data: roomsData, error: roomsError }, { data: tourData, error: tourError }, { data: staffData, error: staffError }] = await Promise.all([
        supabase
          .from("singsing_participants")
          .select("*, singsing_rooms:room_id(id, room_type, room_seq, room_number, capacity)")
          .eq("tour_id", tourId)
          .order("created_at", { ascending: true }),
        supabase
          .from("singsing_rooms")
          .select("*")
          .eq("tour_id", tourId)
          .order("room_seq"),
        supabase
          .from("singsing_tours")
          .select("*")
          .eq("id", tourId)
          .single(),
        supabase
          .from("singsing_tour_staff")
          .select("*")
          .eq("tour_id", tourId)
          .eq("role", "기사")
          .order("order")
          .limit(1)
      ]);
      
      if (participantsError) throw participantsError;
      if (roomsError) throw roomsError;
      if (tourError && tourError.code !== 'PGRST116') throw tourError;
      
      setParticipants((participantsData || []) as Participant[]);
      setRooms((roomsData || []) as Room[]);
      setTour(tourData as Tour);
      setTourStaff(staffData && staffData.length > 0 ? staffData[0] as Staff : null);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tourId) fetchData(); }, [tourId, refreshKey]);

  // 객실 배정 변경
  const handleAssignRoom = async (participantId: string, roomId: string) => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      const assignedCount = participants.filter(p => p.room_id === roomId).length;
      if (room && assignedCount >= room.capacity) {
        alert('이 객실은 정원이 가득 찼습니다.');
        return;
      }
    }
    
    try {
      setAssigning(participantId);
      const { error } = await supabase
        .from("singsing_participants")
        .update({ room_id: roomId === "" ? null : roomId })
        .eq("id", participantId);
      
      if (error) throw error;
      
      await fetchData();
      setAssignSuccess(participantId);
      setTimeout(() => setAssignSuccess(null), 1200);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAssigning(null);
    }
  };

  // 개별 객실 삭제
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('이 객실을 삭제하시겠습니까? 배정된 참가자들은 미배정 상태가 됩니다.')) {
      return;
    }
    
    try {
      const { error: updateError } = await supabase
        .from("singsing_participants")
        .update({ room_id: null })
        .eq("room_id", roomId);
      
      if (updateError) throw updateError;
      
      const { error: deleteError } = await supabase
        .from("singsing_rooms")
        .delete()
        .eq("id", roomId);
      
      if (deleteError) throw deleteError;
      
      await fetchData();
    } catch (error: any) {
      setError(`객실 삭제 중 오류 발생: ${error.message}`);
    }
  };

  // 미배정 참가자 필터링
  const filteredUnassigned = participants.filter(p => !p.room_id && p.name.includes(unassignedSearch));
  
  // 통계 계산
  const assignedParticipants = participants.filter(p => p.room_id).length;
  const totalParticipants = participants.length;
  const unassignedParticipants = totalParticipants - assignedParticipants;
  
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupiedSpaces = participants.filter(p => p.room_id).length;
  const availableSpaces = totalCapacity - occupiedSpaces;
  
  const compRooms = rooms.filter(room => {
    const name = room.room_type.toLowerCase();
    return name.includes('가이드') || 
           name.includes('기사') || 
           name.includes('comp') ||
           name.includes('무료') ||
           name === '가이드' ||
           name === '콤프룸' ||
           name === 'comp룸';
  });
  
  // 빈 객실: 참가자가 한 명도 배정되지 않은 객실 (정원 0인 객실 제외)
  const emptyRooms = rooms.filter(room => {
    if (room.capacity === 0) return false; // 정원 0인 객실은 제외
    const assignedToRoom = participants.filter(p => p.room_id === room.id).length;
    return assignedToRoom === 0;
  }).length;
  
  // 사용 가능한 객실 수 (정원이 1 이상인 객실)
  const usableRooms = rooms.filter(room => room.capacity > 0).length;
  const occupiedRooms = usableRooms - emptyRooms;

  return (
    <div className="mb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">객실별 참가자 그룹핑</h2>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await fetchData();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <>
          {/* 통계 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">참가자 현황</div>
              <div className="text-2xl font-bold text-blue-900">{assignedParticipants}/{totalParticipants}</div>
              <div className="text-xs text-blue-600">배정완료 / 총인원</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">객실 현황</div>
              <div className="text-2xl font-bold text-green-900">{occupiedSpaces}/{totalCapacity}</div>
              <div className="text-xs text-green-600">사용중 / 총정원</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">빈 객실</div>
              <div className="text-2xl font-bold text-yellow-900">{emptyRooms}/{usableRooms}</div>
              <div className="text-xs text-yellow-600">빈 방 / 사용가능 객실</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">콤프룸</div>
              <div className="text-2xl font-bold text-purple-900">{compRooms.length}개</div>
              <div className="text-xs text-purple-600">가이드/기사 객실</div>
            </div>
          </div>
          
          {/* 미배정 경고 */}
          {unassignedParticipants > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">
                미배정 참가자가 {unassignedParticipants}명 있습니다. 남은 자리: {availableSpaces}개
              </span>
            </div>
          )}
          
          <div className="space-y-4">
          {/* 객실별 참가자 배정 */}
          {rooms.map(room => {
            const assigned = participants.filter(p => p.room_id === room.id);
            return (
              <div key={room.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-800 text-base">{room.room_number}호</span>
                  <div className="flex items-center gap-4">
                    <span className={assigned.length === room.capacity ? "text-red-600 font-bold" : "text-gray-500"}>
                      현재 {assigned.length} / 정원 {room.capacity}
                    </span>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="객실 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {assigned.length === 0 ? (
                    <li className="text-gray-400 text-sm">배정된 참가자가 없습니다.</li>
                  ) : (
                    assigned.map(p => (
                      <li key={p.id} className="flex items-center gap-1 flex-1 min-w-[120px]">
                        <div className="flex flex-col items-start min-w-0">
                          <span className="font-medium text-gray-900 truncate">{p.name}</span>
                        </div>
                        <select
                          className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 ml-2"
                          value={p.room_id || ""}
                          onChange={e => handleAssignRoom(p.id, e.target.value)}
                          disabled={!!assigning}
                        >
                          <option value="">미배정</option>
                          {rooms.map(r => {
                            const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                            const isFull = assignedCount >= r.capacity;
                            const label = `${r.room_number}호 (${assignedCount}/${r.capacity}명)`;
                            return (
                              <option key={r.id} value={r.id} disabled={isFull && r.id !== p.room_id}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}

          {/* 미배정 참가자 */}
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="font-bold text-gray-700 mb-2">미배정</div>
            <input
              type="text"
              placeholder="이름으로 검색"
              value={unassignedSearch}
              onChange={e => setUnassignedSearch(e.target.value)}
              className="mb-3 w-full max-w-xs border border-gray-300 rounded px-2 py-1 text-sm focus:outline-blue-500"
            />
            {filteredUnassigned.length === 0 ? (
              <div className="text-gray-400 text-sm">검색 결과가 없습니다.</div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                {filteredUnassigned.map(p => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between bg-white rounded-lg shadow px-3 py-2 transition hover:bg-blue-50"
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-medium text-gray-900 truncate">{p.name}</span>
                    </div>
                    <select
                    className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500"
                    value={p.room_id || ""}
                    onChange={e => handleAssignRoom(p.id, e.target.value)}
                    disabled={!!assigning}
                    >
                      <option value="">미배정</option>
                      {rooms.map(r => {
                        const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                        const isFull = assignedCount >= r.capacity;
                        const label = `${r.room_number}호 (${assignedCount}/${r.capacity}명)`;
                        return (
                          <option key={r.id} value={r.id} disabled={isFull}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </>
      )}
      
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default RoomAssignmentManager;