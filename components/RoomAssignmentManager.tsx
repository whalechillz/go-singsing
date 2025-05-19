"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  room_name?: string;
  singsing_rooms?: {
    room_type?: string;
    capacity?: number;
    quantity?: number;
  };
};

type Room = {
  id: string;
  room_type: string;
  room_name: string;
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

  // 데이터 fetch
  const fetchData = async () => {
    setLoading(true);
    setError("");
    const [{ data: participantsData, error: participantsError }, { data: roomsData, error: roomsError }] = await Promise.all([
      supabase.from("singsing_participants").select("*").eq("tour_id", tourId).order("created_at", { ascending: true }),
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
      room_name: `${trimmedRoomType}-${String(lastNum + i + 1).padStart(2, '0')}`,
      capacity: getCapacity(trimmedRoomType),
      quantity: 1,
    }));
    // Supabase에 upsert (onConflict: room_name)
    const { error } = await supabase
      .from("singsing_rooms")
      .upsert(newRooms, { onConflict: 'room_name' });
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
    if (room.room_name) {
      roomGroups[room.room_name] = [];
    }
  });
  participants.forEach(p => {
    if (p.room_name && roomGroups[p.room_name]) roomGroups[p.room_name].push(p);
  });
  // 미배정 참가자
  const unassigned = participants.filter(p => !p.room_name);

  // 객실명 표시 함수
  const displayRoomName = (roomName: string | undefined) => roomName ? roomName : "미배정";

  // 객실 배정 변경
  const handleAssignRoom = async (participantId: string, roomName: string) => {
    setAssigning(participantId);
    setAssignSuccess(null);
    // 낙관적 UI 업데이트
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, room_name: roomName === "" ? undefined : roomName }
          : p
      )
    );
    const { error } = await supabase
      .from("singsing_participants")
      .update({ room_name: roomName === "" ? undefined : roomName })
      .eq("id", participantId);
    setAssigning(null);
    if (!error) {
      setAssignSuccess(participantId);
      setTimeout(() => setAssignSuccess(null), 1200);
      // 성공 시 fetchData() 호출하지 않음
    } else {
      setError(error.message);
      fetchData(); // 에러 시에만 fetchData 호출
    }
  };

  // 객실 삭제
  const handleDeleteRoom = async (roomName: string) => {
    await supabase.from("singsing_participants").update({ room_name: null }).eq("room_name", roomName);
    await supabase.from("singsing_rooms").delete().eq("room_name", roomName).eq("tour_id", tourId);
    fetchData();
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">객실별 참가자 그룹핑</h2>
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-8">
          {/* 객실별 그룹 */}
          {Object.entries(roomGroups).map(([roomName, members]) => (
            <div key={roomName} className="bg-gray-50 rounded-lg shadow p-4">
              <div className="font-bold text-blue-800 mb-2">{displayRoomName(roomName)}</div>
              {members.length === 0 ? (
                <div className="text-gray-400 text-sm">배정된 참가자가 없습니다.</div>
              ) : (
                <ul>
                  {members.map(p => (
                    <li key={p.id} className="grid grid-cols-5 gap-2 items-center py-2">
                      <span className="col-span-2 text-left font-semibold text-gray-900">{p.name}</span>
                      <span className="text-left text-gray-500 text-xs">{p.phone}</span>
                      <span className="text-left text-gray-500 text-xs">{p.team_name}</span>
                      <select
                        className="col-span-1 border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 text-right"
                        value={p.room_name || ""}
                        onChange={e => handleAssignRoom(p.id, e.target.value)}
                        aria-label="객실 선택"
                        tabIndex={0}
                        disabled={!!assigning}
                      >
                        <option value="">미배정</option>
                        {rooms.map(r => <option key={r.room_name} value={r.room_name}>{r.room_name}</option>)}
                      </select>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {/* 미배정 */}
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="font-bold text-gray-700 mb-2">미배정</div>
            {unassigned.length === 0 ? (
              <div className="text-gray-400 text-sm">모든 참가자가 객실에 배정되었습니다.</div>
            ) : (
              <ul>
                {unassigned.map(p => (
                  <li key={p.id} className="grid grid-cols-5 gap-2 items-center py-2">
                    <span className="col-span-2 text-left font-semibold text-gray-900">{p.name}</span>
                    <span className="text-left text-gray-500 text-xs">{p.phone}</span>
                    <span className="text-left text-gray-500 text-xs">{p.team_name}</span>
                    <select
                      className="col-span-1 border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500 text-right"
                      value={p.room_name || ""}
                      onChange={e => handleAssignRoom(p.id, e.target.value)}
                      aria-label="객실 선택"
                      tabIndex={0}
                      disabled={!!assigning}
                    >
                      <option value="">미배정</option>
                      {rooms.map(r => <option key={r.room_name} value={r.room_name}>{r.room_name}</option>)}
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