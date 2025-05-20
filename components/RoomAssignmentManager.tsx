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

type Props = { tourId: string };

const roomTypeColors: Record<string, string> = {
  "미배정": "bg-gray-200 text-gray-700",
  "2인실": "bg-blue-100 text-blue-700",
  "3인실": "bg-green-100 text-green-700",
  "4인실": "bg-purple-100 text-purple-700",
};

const RoomAssignmentManager: React.FC<Props> = ({ tourId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [newRoomType, setNewRoomType] = useState<string>("");
  const [newRoomCount, setNewRoomCount] = useState<number>(1);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [unassignedSearch, setUnassignedSearch] = useState("");

  // 데이터 fetch
  const fetchData = async () => {
    setLoading(true);
    setError("");
    const [{ data: participantsData, error: participantsError }, { data: roomsData, error: roomsError }] = await Promise.all([
      supabase.from("singsing_participants").select("*, singsing_rooms:room_id(room_type, room_seq, room_number)").eq("tour_id", tourId).order("created_at", { ascending: true }),
      supabase.from("singsing_rooms").select("*").eq("tour_id", tourId)
    ]);
    if (participantsError) setError(participantsError.message);
    else setParticipants((participantsData || []) as Participant[]);
    if (roomsError) setError(roomsError.message);
    else setRooms((roomsData || []) as Room[]);
    setLoading(false);
  };

  useEffect(() => { if (tourId) fetchData(); }, [tourId]);

  // 객실 자동 생성
  const handleAddRooms = async () => {
    const trimmedRoomType = newRoomType.trim();
    if (!trimmedRoomType || newRoomCount < 1) {
      setError("객실 타입을 입력해 주세요.");
      return;
    }
    // 같은 타입의 마지막 객실 번호 계산
    const sameTypeRooms = rooms.filter(r => r.room_type === trimmedRoomType);
    const lastNum = sameTypeRooms.length;
    // capacity 자동 추출(2, 3, 4, 8인실 등)
    const getCapacity = (type: string) => {
      if (type.includes("2인실")) return 2;
      if (type.includes("3인실")) return 3;
      if (type.includes("4인실")) return 4;
      if (type.includes("8인실")) return 8;
      return 2; // 기본값
    };
    const newRooms = Array.from({ length: newRoomCount }, (_, i) => ({
      tour_id: tourId,
      room_type: trimmedRoomType,
      room_seq: lastNum + i + 1,
      room_number: `${trimmedRoomType}-${String(lastNum + i + 1).padStart(2, '0')}`,
      capacity: getCapacity(trimmedRoomType),
      quantity: 1,
    }));
    // Supabase에 insert (room_seq, room_number 반드시 포함)
    const { error } = await supabase
      .from("singsing_rooms")
      .insert(newRooms);
    if (error) {
      setError(error.message);
    }
    setNewRoomType("");
    setNewRoomCount(1);
    fetchData();
  };

  // 객실별로 참가자 그룹핑
  const roomGroups: Record<string, Participant[]> = {};
  rooms.forEach(room => {
    if (room.room_number) {
      roomGroups[room.room_number] = [];
    }
  });
  participants.forEach(p => {
    if (p.singsing_rooms?.room_number && roomGroups[p.singsing_rooms.room_number]) roomGroups[p.singsing_rooms.room_number].push(p);
  });
  // 미배정 참가자
  const unassigned = participants.filter(p => !p.room_id);
  // 미배정 참가자 필터링
  const filteredUnassigned = participants.filter(p => !p.room_id && p.name.includes(unassignedSearch));

  // 객실명 표시 함수
  const displayRoomName = (room: Room | undefined) => {
    if (!room) return "미배정";
    return `${room.room_number}호`;
  };

  // 객실 배정 변경
  const handleAssignRoom = async (participantId: string, roomId: string) => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      const assignedCount = participants.filter(p => p.room_id === roomId).length;
      // 정원 초과 시 배정 불가
      if (room && assignedCount >= room.capacity) {
        alert('이 객실은 정원이 가득 찼습니다.');
        return;
      }
    }
    setAssigning(participantId);
    setAssignSuccess(null);
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, room_id: roomId === "" ? null : roomId }
          : p
      )
    );
    const { error } = await supabase
      .from("singsing_participants")
      .update({ room_id: roomId === "" ? null : roomId })
      .eq("id", participantId);
    setAssigning(null);
    if (!error) {
      setAssignSuccess(participantId);
      setTimeout(() => setAssignSuccess(null), 1200);
    } else {
      setError(error.message);
      fetchData();
    }
  };

  // 객실 삭제
  const handleDeleteRoom = async (roomName: string) => {
    await supabase.from("singsing_participants").update({ room_id: null }).eq("room_number", roomName);
    await supabase.from("singsing_rooms").delete().eq("room_number", roomName).eq("tour_id", tourId);
    fetchData();
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">객실별 참가자 그룹핑</h2>
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-8">
          {rooms.map(room => {
            const assigned = participants.filter(p => p.room_id === room.id);
            return (
              <div key={room.id} className="mb-6 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-800 text-base">{room.room_number}호</span>
                  <span className={assigned.length === room.capacity ? "text-red-600 font-bold" : "text-gray-500"}>
                    현재 {assigned.length} / 정원 {room.capacity}
                  </span>
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
                          className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 text-right ml-2"
                          value={p.room_id || ""}
                          onChange={e => handleAssignRoom(p.id, e.target.value)}
                          aria-label="객실 선택"
                          tabIndex={0}
                          disabled={!!assigning}
                        >
                          <option value="">미배정</option>
                          {rooms.map(r => {
                            const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                            const isFull = assignedCount >= r.capacity;
                            return (
                              <option key={r.id} value={r.id} disabled={isFull && r.id !== p.room_id}>
                                {`${r.room_number}호`}
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
          {/* 미배정 */}
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
                      className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 text-right"
                      value={p.room_id || ""}
                      onChange={e => handleAssignRoom(p.id, e.target.value)}
                      aria-label="객실 선택"
                      tabIndex={0}
                      disabled={!!assigning}
                    >
                      <option value="">미배정</option>
                      {rooms.map(r => {
                        const assignedCount = participants.filter(pp => pp.room_id === r.id).length;
                        const isFull = assignedCount >= r.capacity;
                        return (
                          <option key={r.id} value={r.id} disabled={isFull}>
                            {`${r.room_number}호`}
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
      )}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default RoomAssignmentManager; 