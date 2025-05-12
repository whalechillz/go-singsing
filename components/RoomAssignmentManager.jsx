"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const RoomAssignmentManager = ({ tourId }) => {
  const [participants, setParticipants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRoomType, setNewRoomType] = useState("");
  const [newRoomCount, setNewRoomCount] = useState(1);

  // 데이터 fetch
  const fetchData = async () => {
    setLoading(true);
    setError("");
    const [{ data: participantsData, error: participantsError }, { data: roomsData, error: roomsError }] = await Promise.all([
      supabase.from("singsing_participants").select("*" ).eq("tour_id", tourId).order("created_at", { ascending: true }),
      supabase.from("singsing_rooms").select("*" ).eq("tour_id", tourId)
    ]);
    if (participantsError) setError(participantsError.message);
    else setParticipants(participantsData || []);
    if (roomsError) setError(roomsError.message);
    else setRooms(roomsData || []);
    setLoading(false);
  };

  useEffect(() => { if (tourId) fetchData(); }, [tourId]);

  // 객실 자동 생성
  const handleAddRooms = async () => {
    if (!newRoomType || newRoomCount < 1) return;
    // 이미 있는 객실 중 해당 타입의 마지막 번호 찾기
    const sameTypeRooms = rooms.filter(r => r.room_type === newRoomType);
    const lastNum = sameTypeRooms.length;
    const newRooms = Array.from({ length: newRoomCount }, (_, i) => ({
      tour_id: tourId,
      room_type: newRoomType,
      room_name: `${newRoomType}-${String(lastNum + i + 1).padStart(2, '0')}`
    }));
    await supabase.from("singsing_rooms").insert(newRooms);
    setNewRoomType("");
    setNewRoomCount(1);
    fetchData();
  };

  // 객실별로 참가자 그룹핑
  const roomGroups = {};
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
  const displayRoomName = (roomName) => roomName ? roomName : "미배정";

  // 객실 배정 변경
  const handleAssignRoom = async (participantId, roomName) => {
    await supabase
      .from("singsing_participants")
      .update({ room_name: roomName === "" ? null : roomName })
      .eq("id", participantId);
    fetchData();
  };

  // 객실 삭제
  const handleDeleteRoom = async (roomName) => {
    // 해당 객실 참가자 room_name null 처리
    await supabase.from("singsing_participants").update({ room_name: null }).eq("room_name", roomName);
    await supabase.from("singsing_rooms").delete().eq("room_name", roomName).eq("tour_id", tourId);
    fetchData();
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-4">객실별 참가자 그룹핑</h2>
      {/* 객실 추가 */}
      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="객실 타입 (예: 2인실)" className="border rounded px-2 py-1" value={newRoomType} onChange={e => setNewRoomType(e.target.value)} />
        <input type="number" min={1} className="border rounded px-2 py-1 w-20" value={newRoomCount} onChange={e => setNewRoomCount(Number(e.target.value))} />
        <button className="bg-blue-700 text-white px-4 py-1 rounded" onClick={handleAddRooms}>객실 추가</button>
      </div>
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-8">
          {/* 객실별 그룹 */}
          {Object.entries(roomGroups).map(([roomName, members]) => (
            <div key={roomName} className="bg-gray-50 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-blue-800">{displayRoomName(roomName)}</div>
                <button className="text-red-500 text-xs" onClick={() => handleDeleteRoom(roomName)} aria-label="객실 삭제" tabIndex={0}>객실 삭제</button>
              </div>
              {members.length === 0 ? (
                <div className="text-gray-400 text-sm">배정된 참가자가 없습니다.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {members.map(p => (
                    <li key={p.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="font-semibold text-gray-900">{p.name}</span>
                        <span className="ml-2 text-gray-500 text-xs">{p.phone}</span>
                        <span className="ml-2 text-gray-500 text-xs">{p.team_name}</span>
                      </div>
                      <select
                        className="border rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500"
                        value={p.room_name || ""}
                        onChange={e => handleAssignRoom(p.id, e.target.value)}
                        aria-label="객실 선택"
                        tabIndex={0}
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
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="font-bold text-yellow-800 mb-2">미배정</div>
            {unassigned.length === 0 ? (
              <div className="text-gray-400 text-sm">모든 참가자가 객실에 배정되었습니다.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {unassigned.map(p => (
                  <li key={p.id} className="flex items-center justify-between py-2">
                    <div>
                      <span className="font-semibold text-gray-900">{p.name}</span>
                      <span className="ml-2 text-gray-500 text-xs">{p.phone}</span>
                      <span className="ml-2 text-gray-500 text-xs">{p.team_name}</span>
                    </div>
                    <select
                      className="border rounded px-2 py-1 bg-white text-gray-900 focus:outline-blue-500"
                      value={p.room_name || ""}
                      onChange={e => handleAssignRoom(p.id, e.target.value)}
                      aria-label="객실 선택"
                      tabIndex={0}
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