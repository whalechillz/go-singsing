"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const initialForm = { room_type: "", capacity: "", quantity: "" };

const RoomTypeManager = ({ tourId }) => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("singsing_rooms").select("*").eq("tour_id", tourId).order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    if (tourId) fetchRooms();
  }, [tourId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.room_type || !form.capacity || !form.quantity) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }
    if (editingId) {
      // 수정
      const { error } = await supabase.from("singsing_rooms").update({ ...form, capacity: Number(form.capacity), quantity: Number(form.quantity) }).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm(initialForm);
        fetchRooms();
      }
    } else {
      // 추가
      const { error } = await supabase.from("singsing_rooms").insert([{ ...form, tour_id: tourId, capacity: Number(form.capacity), quantity: Number(form.quantity) }]);
      if (error) setError(error.message);
      else {
        setForm(initialForm);
        fetchRooms();
      }
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({ room_type: room.room_type, capacity: room.capacity, quantity: room.quantity });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_rooms").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchRooms();
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">객실 타입/수량 관리</h2>
      <form className="flex flex-col md:flex-row gap-2 mb-4" onSubmit={handleSubmit}>
        <input name="room_type" value={form.room_type} onChange={handleChange} placeholder="객실 타입 (예: 2인실)" className="border rounded px-2 py-1 flex-1" required aria-label="객실 타입" />
        <input name="capacity" value={form.capacity} onChange={handleChange} placeholder="정원" type="number" min="1" className="border rounded px-2 py-1 flex-1" required aria-label="정원" />
        <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="객실 수" type="number" min="1" className="border rounded px-2 py-1 flex-1" required aria-label="객실 수" />
        <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
        {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm(initialForm); }}>취소</button>}
      </form>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <table className="w-full bg-white dark:bg-gray-900 rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-2 px-2 text-left">객실 타입</th>
              <th className="py-2 px-2 text-left">정원</th>
              <th className="py-2 px-2 text-left">객실 수</th>
              <th className="py-2 px-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-1 px-2">{room.room_type}</td>
                <td className="py-1 px-2">{room.capacity}</td>
                <td className="py-1 px-2">{room.quantity}</td>
                <td className="py-1 px-2">
                  <div className="flex justify-center items-center gap-2">
                    <button className="text-blue-700 underline" onClick={() => handleEdit(room)} aria-label="수정">수정</button>
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