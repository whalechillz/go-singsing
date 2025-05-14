"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type TeeTime = {
  id: string;
  date: string;
  course: string;
  team_no: number;
  tee_time: string;
  players: string[];
};

const initialForm = {
  date: "",
  course: "",
  team_no: 1,
  tee_time: "",
  players: "",
};

const TeeTimeManager: React.FC = () => {
  const [form, setForm] = useState({ ...initialForm });
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // DB에서 티오프 시간표 불러오기
  const fetchTeeTimes = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("singsing_tee_times").select("*").order("date").order("course").order("team_no");
    if (error) setError(error.message);
    else setTeeTimes((data || []).map((t: any) => ({ ...t, players: Array.isArray(t.players) ? t.players : [] })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTeeTimes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.date || !form.course || !form.tee_time || !form.players) return;
    const playersArr = form.players.split(/,|\n|\s*·\s*/).map(p => p.trim()).filter(Boolean);
    if (editingId) {
      const { error } = await supabase.from("singsing_tee_times").update({
        date: form.date,
        course: form.course,
        team_no: Number(form.team_no),
        tee_time: form.tee_time,
        players: playersArr,
      }).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm({ ...initialForm });
        fetchTeeTimes();
      }
    } else {
      const { error } = await supabase.from("singsing_tee_times").insert([
        {
          date: form.date,
          course: form.course,
          team_no: Number(form.team_no),
          tee_time: form.tee_time,
          players: playersArr,
        },
      ]);
      if (error) setError(error.message);
      else {
        setForm({ ...initialForm });
        fetchTeeTimes();
      }
    }
  };

  const handleEdit = (t: TeeTime) => {
    setEditingId(t.id);
    setForm({
      date: t.date,
      course: t.course,
      team_no: t.team_no,
      tee_time: t.tee_time,
      players: t.players.join(" · "),
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_tee_times").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchTeeTimes();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-blue-800 mb-4">티오프 시간 관리</h2>
        <form className="flex flex-col md:flex-row gap-2 mb-6" onSubmit={handleSubmit}>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-2 py-1 flex-1" required aria-label="날짜" />
          <select name="course" value={form.course} onChange={handleChange} className="border rounded px-2 py-1 flex-1" required aria-label="코스">
            <option value="">코스 선택</option>
            <option value="파인힐스 CC - 파인 코스">파인힐스 CC - 파인 코스</option>
            <option value="파인힐스 CC - 레이크 코스">파인힐스 CC - 레이크 코스</option>
            <option value="파인힐스 CC - 힐스 코스">파인힐스 CC - 힐스 코스</option>
          </select>
          <input name="team_no" type="number" min={1} value={form.team_no} onChange={handleChange} className="border rounded px-2 py-1 w-20" required aria-label="조 번호" />
          <input name="tee_time" type="time" value={form.tee_time} onChange={handleChange} className="border rounded px-2 py-1 w-28" required aria-label="티오프 시간" />
          <input name="players" value={form.players} onChange={handleChange} placeholder="참가자 (·, ,로 구분)" className="border rounded px-2 py-1 flex-1" required aria-label="참가자" />
          <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
          {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm(initialForm); }}>취소</button>}
        </form>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {loading ? (
          <div className="text-center py-4 text-gray-500">불러오는 중...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2">날짜</th>
                  <th className="px-2 py-2">코스</th>
                  <th className="px-2 py-2">조</th>
                  <th className="px-2 py-2">티오프</th>
                  <th className="px-2 py-2">참가자</th>
                  <th className="px-2 py-2">관리</th>
                </tr>
              </thead>
              <tbody>
                {teeTimes.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-2 py-1 whitespace-nowrap">{t.date}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{t.course}</td>
                    <td className="px-2 py-1 text-center">{t.team_no}</td>
                    <td className="px-2 py-1 text-center text-red-600 font-bold">{t.tee_time}</td>
                    <td className="px-2 py-1">
                      {t.players.map((p, i, arr) => (
                        <span key={i} className={p.includes("(남)") ? "text-blue-700 font-medium" : ""}>
                          {p}{i < arr.length - 1 && <span className="mx-1 text-gray-400">·</span>}
                        </span>
                      ))}
                    </td>
                    <td className="px-2 py-1 flex gap-1">
                      <button className="text-blue-700 underline" onClick={() => handleEdit(t)} aria-label="수정">수정</button>
                      <button className="text-red-600 underline" onClick={() => handleDelete(t.id)} aria-label="삭제">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeeTimeManager; 