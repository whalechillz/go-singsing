"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, X } from "lucide-react";

type Room = {
  id: string;
  room_type: string;
  capacity: number;
  tour_id: string;
};

type RoomForm = {
  room_type: string;
  capacity: string;
};

const initialForm: RoomForm = { room_type: "", capacity: "" };

type Props = { tourId: string };

const RoomTypeManager: React.FC<Props> = ({ tourId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomRows, setRoomRows] = useState([{ room_type: "", capacity: "" }]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("singsing_rooms").select("*").eq("tour_id", tourId).order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setRooms((data || []) as Room[]);
    setLoading(false);
  };

  useEffect(() => {
    if (tourId) fetchRooms();
  }, [tourId]);

  const handleRowChange = (idx: number, field: string, value: string) => {
    setRoomRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddRow = () => {
    setRoomRows(rows => [...rows, { room_type: "", capacity: "" }]);
  };

  const handleDeleteRow = (idx: number) => {
    setRoomRows(rows => rows.filter((_, i) => i !== idx));
  };

  const handleBulkAdd = async () => {
    setError("");
    // 유효성 검사
    if (roomRows.some(row => !row.room_type || !row.capacity)) {
      setError("모든 행의 객실 타입과 정원을 입력해 주세요.");
      return;
    }
    // 객실 타입별로 기존 seq 계산
    const newRooms: any[] = [];
    for (const row of roomRows) {
      const sameTypeRooms = rooms.filter(r => r.room_type === row.room_type);
      const nextSeq = sameTypeRooms.length + newRooms.filter(r => r.room_type === row.room_type).length + 1;
      newRooms.push({
        tour_id: tourId,
        room_type: row.room_type,
        room_seq: nextSeq,
        room_number: `${row.room_type}-${String(nextSeq).padStart(2, '0')}`,
        capacity: Number(row.capacity),
      });
    }
    const { error } = await supabase.from("singsing_rooms").insert(newRooms);
    if (error) setError(error.message);
    else {
      setRoomRows([{ room_type: "", capacity: "" }]);
      fetchRooms();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_rooms").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchRooms();
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">객실 타입/수량 관리</h2>
      <div className="flex flex-col gap-2 mb-4">
        {roomRows.map((row, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input name="room_type" value={row.room_type} onChange={e => handleRowChange(idx, "room_type", e.target.value)} placeholder="객실 타입 (예: 2인실)" className="border rounded px-2 py-1 flex-1" required aria-label="객실 타입" />
            <input name="capacity" value={row.capacity} onChange={e => handleRowChange(idx, "capacity", e.target.value)} placeholder="정원" type="number" min="1" className="border rounded px-2 py-1 flex-1" required aria-label="정원" />
            <button type="button" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteRow(idx)} aria-label="행 삭제"><X size={18} /></button>
          </div>
        ))}
        <button type="button" className="flex items-center gap-1 text-blue-700 font-semibold mt-2" onClick={handleAddRow}><Plus size={18} /> 행 추가</button>
        <button type="button" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[100px] font-semibold hover:bg-blue-900 transition-colors mt-2" onClick={handleBulkAdd}>일괄 추가</button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <table className="w-full bg-white dark:bg-gray-900 rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-2 px-2 text-left">객실 타입</th>
              <th className="py-2 px-2 text-left">정원</th>
              <th className="py-2 px-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-1 px-2">{room.room_type}</td>
                <td className="py-1 px-2">{room.capacity}</td>
                <td className="py-1 px-2">
                  <div className="flex justify-center items-center gap-2">
                    <button className="text-blue-700 underline" onClick={() => {/* 수정 로직 생략 */}} aria-label="수정">수정</button>
                    <button className="text-red-600 underline" onClick={() => handleDelete(room.id)} aria-label="삭제">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoomTypeManager; 