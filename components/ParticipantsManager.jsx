"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ParticipantsManager = ({ tourId }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", team_name: "", note: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchParticipants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("singsing_participants").select("*").eq("tour_id", tourId).order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setParticipants(data);
    setLoading(false);
  };

  useEffect(() => {
    if (tourId) fetchParticipants();
  }, [tourId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone) {
      setError("이름과 연락처는 필수입니다.");
      return;
    }
    if (editingId) {
      // 수정
      const { error } = await supabase.from("singsing_participants").update(form).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm({ name: "", phone: "", team_name: "", note: "" });
        fetchParticipants();
      }
    } else {
      // 추가
      const { error } = await supabase.from("singsing_participants").insert([{ ...form, tour_id: tourId }]);
      if (error) setError(error.message);
      else {
        setForm({ name: "", phone: "", team_name: "", note: "" });
        fetchParticipants();
      }
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, phone: p.phone, team_name: p.team_name || "", note: p.note || "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_participants").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchParticipants();
  };

  return (
    <div>
      <form className="flex flex-col md:flex-row gap-2 mb-4" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="이름" className="border rounded px-2 py-1 flex-1" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="연락처" className="border rounded px-2 py-1 flex-1" required />
        <input name="team_name" value={form.team_name} onChange={handleChange} placeholder="팀명" className="border rounded px-2 py-1 flex-1" />
        <input name="note" value={form.note} onChange={handleChange} placeholder="메모" className="border rounded px-2 py-1 flex-1" />
        <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
        {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm({ name: "", phone: "", team_name: "", note: "" }); }}>취소</button>}
      </form>
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
              <th className="py-2 px-2 text-left">메모</th>
              <th className="py-2 px-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-1 px-2">{p.name}</td>
                <td className="py-1 px-2">{p.phone}</td>
                <td className="py-1 px-2">{p.team_name}</td>
                <td className="py-1 px-2">{p.note}</td>
                <td className="py-1 px-2 flex gap-1">
                  <button className="text-blue-700 underline" onClick={() => handleEdit(p)}>수정</button>
                  <button className="text-red-600 underline" onClick={() => handleDelete(p.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ParticipantsManager; 