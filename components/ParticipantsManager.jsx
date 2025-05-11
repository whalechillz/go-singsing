"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ParticipantsManager = ({ tourId }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", team_name: "", note: "", status: "확정" });
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
    let { name, value } = e.target;
    if (name === "phone") {
      // 숫자만 허용, 하이픈 제거
      value = value.replace(/[^0-9]/g, "");
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone) {
      setError("이름과 연락처는 필수입니다.");
      return;
    }
    // 중복 등록 방지(이름+전화번호)
    const isDuplicate = participants.some(
      (p) => p.name === form.name && p.phone === form.phone
    );
    if (!editingId && isDuplicate) {
      setError("이미 등록된 참가자입니다.");
      return;
    }
    if (editingId) {
      // 수정
      const { error } = await supabase.from("singsing_participants").update({ ...form, phone: form.phone.replace(/[^0-9]/g, "") }).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm({ name: "", phone: "", team_name: "", note: "", status: "확정" });
        fetchParticipants();
      }
    } else {
      // 추가
      const { error } = await supabase.from("singsing_participants").insert([{ ...form, phone: form.phone.replace(/[^0-9]/g, "") }]);
      if (error) setError(error.message);
      else {
        setForm({ name: "", phone: "", team_name: "", note: "", status: "확정" });
        fetchParticipants();
      }
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, phone: p.phone, team_name: p.team_name || "", note: p.note || "", status: p.status || "확정" });
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
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="연락처(숫자만)" className="border rounded px-2 py-1 flex-1" required maxLength={11} />
        <input name="team_name" value={form.team_name} onChange={handleChange} placeholder="팀명" className="border rounded px-2 py-1 flex-1" />
        <input name="note" value={form.note} onChange={handleChange} placeholder="메모" className="border rounded px-2 py-1 flex-1" />
        <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1 flex-1" aria-label="상태">
          <option value="확정">확정</option>
          <option value="대기">대기</option>
          <option value="취소">취소</option>
        </select>
        <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
        {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm({ name: "", phone: "", team_name: "", note: "", status: "확정" }); }}>취소</button>}
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
              <th className="py-2 px-2 text-left">상태</th>
              <th className="py-2 px-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-1 px-2">{p.name}</td>
                <td className="py-1 px-2">{p.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')}</td>
                <td className="py-1 px-2">{p.team_name}</td>
                <td className="py-1 px-2">{p.note}</td>
                <td className="py-1 px-2">
                  <span className={
                    p.status === "확정"
                      ? "bg-green-100 text-green-800 px-2 py-1 rounded"
                      : p.status === "대기"
                      ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                      : "bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  }>
                    {p.status || "확정"}
                  </span>
                </td>
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