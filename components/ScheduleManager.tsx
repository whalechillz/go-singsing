"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Schedule = {
  id: string;
  date: string;
  title: string;
  description: string;
  meal_breakfast: boolean;
  meal_lunch: boolean;
  meal_dinner: boolean;
  tour_id: string;
};

type ScheduleForm = {
  date: string;
  title: string;
  description: string;
  meal_breakfast: boolean;
  meal_lunch: boolean;
  meal_dinner: boolean;
};

const initialForm: ScheduleForm = { date: "", title: "", description: "", meal_breakfast: false, meal_lunch: false, meal_dinner: false };

type Props = { tourId: string; tour: any };

const ScheduleManager: React.FC<Props> = ({ tourId, tour }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [form, setForm] = useState<ScheduleForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchSchedules = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("singsing_schedules").select("*").eq("tour_id", tourId).order("date", { ascending: true });
    if (error) setError(error.message);
    else setSchedules((data || []) as Schedule[]);
    setLoading(false);
  };

  useEffect(() => {
    if (tourId) fetchSchedules();
  }, [tourId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!form.date || !form.title) {
      setError("날짜와 제목은 필수입니다.");
      return;
    }
    if (editingId) {
      const { error } = await supabase.from("singsing_schedules").update(form).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm(initialForm);
        fetchSchedules();
      }
    } else {
      const { error } = await supabase.from("singsing_schedules").insert([{ ...form, tour_id: tourId }]);
      if (error) setError(error.message);
      else {
        setForm(initialForm);
        fetchSchedules();
      }
    }
  };

  const handleEdit = (s: Schedule) => {
    setEditingId(s.id);
    setForm({
      date: s.date || "",
      title: s.title || "",
      description: s.description || "",
      meal_breakfast: !!s.meal_breakfast,
      meal_lunch: !!s.meal_lunch,
      meal_dinner: !!s.meal_dinner,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_schedules").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchSchedules();
  };

  return (
    <div>
      <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
        <div className="font-bold text-lg mb-1">{tour.title}</div>
        <div className="text-gray-700 mb-1">{tour.start_date} ~ {tour.end_date} | 기사님: {tour.driver_name}</div>
        {tour.golf_course && <div className="text-gray-700">골프장: {tour.golf_course}</div>}
        {tour.accommodation && <div className="text-gray-700">숙소: {tour.accommodation}</div>}
      </div>
      <h2 className="text-lg font-semibold mb-4">일정 관리</h2>
      <form className="flex flex-col md:flex-row gap-2 mb-4" onSubmit={handleSubmit}>
        <input name="date" value={form.date} onChange={handleChange} placeholder="날짜 (예: 2025-05-19)" type="date" className="border rounded px-2 py-1 flex-1" required aria-label="날짜" />
        <input name="title" value={form.title} onChange={handleChange} placeholder="제목" className="border rounded px-2 py-1 flex-1" required aria-label="제목" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="설명 (여러 줄 입력 가능)" className="border rounded px-2 py-1 flex-1 w-full min-h-[80px] resize-y" aria-label="설명" />
        <label className="flex items-center gap-1">
          <input type="checkbox" name="meal_breakfast" checked={form.meal_breakfast} onChange={handleChange} />조식
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="meal_lunch" checked={form.meal_lunch} onChange={handleChange} />중식
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="meal_dinner" checked={form.meal_dinner} onChange={handleChange} />석식
        </label>
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
              <th className="py-2 px-2 text-left">날짜</th>
              <th className="py-2 px-2 text-left">제목</th>
              <th className="py-2 px-2 text-left">설명</th>
              <th className="py-2 px-2 text-center">조식</th>
              <th className="py-2 px-2 text-center">중식</th>
              <th className="py-2 px-2 text-center">석식</th>
              <th className="py-2 px-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-1 px-2">{s.date}</td>
                <td className="py-1 px-2">{s.title}</td>
                <td className="py-1 px-2 w-[320px] whitespace-pre-line">{s.description}</td>
                <td className="py-1 px-2 text-center">{s.meal_breakfast ? "O" : "-"}</td>
                <td className="py-1 px-2 text-center">{s.meal_lunch ? "O" : "-"}</td>
                <td className="py-1 px-2 text-center">{s.meal_dinner ? "O" : "-"}</td>
                <td className="py-1 px-2 flex gap-1">
                  <button className="text-blue-700 underline" onClick={() => handleEdit(s)} aria-label="수정">수정</button>
                  <button className="text-red-600 underline" onClick={() => handleDelete(s.id)} aria-label="삭제">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScheduleManager; 