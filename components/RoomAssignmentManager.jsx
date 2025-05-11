"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const RoomAssignmentManager = ({ tourId }) => {
  const [participants, setParticipants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // 참가자 및 객실 타입 목록 불러오기
  const fetchData = async () => {
    setLoading(true);
    setError("");
    const [{ data: participantsData, error: participantsError }, { data: roomsData, error: roomsError }] = await Promise.all([
      supabase.from("singsing_participants").select("*" ).eq("tour_id", tourId).order("created_at", { ascending: true }),
      supabase.from("singsing_rooms").select("room_type").eq("tour_id", tourId)
    ]);
    if (participantsError) setError(participantsError.message);
    else setParticipants(participantsData);
    if (roomsError) setError(roomsError.message);
    else setRooms(roomsData?.map(r => r.room_type).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i));
    setLoading(false);
  };

  useEffect(() => {
    if (tourId) fetchData();
  }, [tourId]);

  const handleRoomTypeChange = (id, value) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, room_type: value } : p));
  };

  // status가 '확정'인 참가자만 객실 배정 대상으로 사용
  const confirmedParticipants = participants.filter(p => p.status === '확정');

  const handleSave = async (id, roomType) => {
    setSavingId(id);
    setError("");
    // 최대 인원 초과 체크 (확정 참가자만)
    if (roomType) {
      const roomObj = rooms.find(r => r.room_type === roomType);
      const capacity = Number(roomObj?.capacity || 0);
      const quantity = Number(roomObj?.quantity || 0);
      const max = capacity * quantity;
      const assignedCount = confirmedParticipants.filter(p => p.room_type === roomType).length;
      const isAlreadyAssigned = confirmedParticipants.find(p => p.id === id)?.room_type === roomType;
      const afterCount = isAlreadyAssigned ? assignedCount : assignedCount + 1;
      if (max > 0 && afterCount > max) {
        setError(`${roomType}의 최대 인원(${max}명)을 초과할 수 없습니다.`);
        setSavingId(null);
        return;
      }
    }
    const { error } = await supabase.from("singsing_participants").update({ room_type: roomType }).eq("id", id);
    if (error) setError(error.message);
    await fetchData();
    setSavingId(null);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">객실 배정</h2>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <table className="w-full bg-white dark:bg-gray-900 rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-2 px-2 text-left">이름</th>
              <th className="py-2 px-2 text-left">연락처</th>
              <th className="py-2 px-2 text-left">팀명</th>
              <th className="py-2 px-2 text-left">객실 타입</th>
              <th className="py-2 px-2">저장</th>
            </tr>
          </thead>
          <tbody>
            {confirmedParticipants.map((p) => (
              <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-1 px-2">{p.name}</td>
                <td className="py-1 px-2">{p.phone}</td>
                <td className="py-1 px-2">{p.team_name}</td>
                <td className="py-1 px-2">
                  <select
                    className="border rounded px-2 py-1 min-w-[80px]"
                    value={p.room_type || ""}
                    onChange={e => handleRoomTypeChange(p.id, e.target.value)}
                    aria-label="객실 타입 선택"
                  >
                    <option value="">미배정</option>
                    {rooms.map((type) => (
                      <option key={type.room_type || type} value={type.room_type || type}>{type.room_type || type}</option>
                    ))}
                  </select>
                </td>
                <td className="py-1 px-2">
                  <button
                    className="bg-blue-800 text-white px-3 py-1 rounded disabled:opacity-50"
                    onClick={() => handleSave(p.id, p.room_type || "")}
                    disabled={savingId === p.id}
                    aria-label="객실 배정 저장"
                  >
                    {savingId === p.id ? "저장중..." : "저장"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoomAssignmentManager; 