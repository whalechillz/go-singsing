"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type BoardingPlace = {
  id: string;
  name: string;
  address: string;
  description?: string;
  map_url?: string;
};

type BoardingSchedule = {
  id: string;
  tour_id: string;
  place_id: string;
  date: string;
  depart_time?: string;
  arrive_time?: string;
  parking_info?: string;
  memo?: string;
};

type Props = { tourId: string };

const BoardingScheduleManager: React.FC<Props> = ({ tourId }) => {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [schedules, setSchedules] = useState<BoardingSchedule[]>([]);
  const [form, setForm] = useState<Omit<BoardingSchedule, "id" | "tour_id">>({ place_id: "", date: "", depart_time: "", arrive_time: "", parking_info: "", memo: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 마스터 탑승지 목록 조회
  const fetchPlaces = async () => {
    const { data } = await supabase.from("singsing_boarding_places").select("*").order("name");
    setPlaces(data || []);
  };

  // 투어별 스케줄 목록 조회
  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("singsing_boarding_schedules").select("*").eq("tour_id", tourId).order("date").order("depart_time");
    if (error) setError(error.message);
    else setSchedules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlaces(); fetchSchedules(); }, [tourId]);

  // 입력값 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 추가/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.place_id || !form.date) {
      setError("탑승지와 날짜는 필수입니다.");
      setLoading(false);
      return;
    }
    if (editingId) {
      const { error } = await supabase.from("singsing_boarding_schedules").update({ ...form, tour_id: tourId }).eq("id", editingId);
      if (error) setError(error.message);
      else setEditingId(null);
    } else {
      const { error } = await supabase.from("singsing_boarding_schedules").insert([{ ...form, tour_id: tourId }]);
      if (error) setError(error.message);
    }
    setForm({ place_id: "", date: "", depart_time: "", arrive_time: "", parking_info: "", memo: "" });
    setLoading(false);
    fetchSchedules();
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    const { error } = await supabase.from("singsing_boarding_schedules").delete().eq("id", id);
    if (error) setError(error.message);
    setLoading(false);
    fetchSchedules();
  };

  // 수정 모드 진입
  const handleEdit = (schedule: BoardingSchedule) => {
    setEditingId(schedule.id);
    setForm({
      place_id: schedule.place_id,
      date: schedule.date,
      depart_time: schedule.depart_time || "",
      arrive_time: schedule.arrive_time || "",
      parking_info: schedule.parking_info || "",
      memo: schedule.memo || ""
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">투어별 탑승지 스케줄 관리</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <select className="border rounded px-2 py-1" name="place_id" value={form.place_id} onChange={handleChange} aria-label="탑승지 선택" tabIndex={0} required>
          <option value="">탑승지 선택</option>
          {places.map(place => (
            <option key={place.id} value={place.id}>{place.name}</option>
          ))}
        </select>
        <input className="border rounded px-2 py-1" type="date" name="date" value={form.date} onChange={handleChange} aria-label="날짜" tabIndex={0} required />
        <input className="border rounded px-2 py-1" type="time" name="depart_time" value={form.depart_time} onChange={handleChange} aria-label="출발 시간" tabIndex={0} />
        <input className="border rounded px-2 py-1" type="time" name="arrive_time" value={form.arrive_time} onChange={handleChange} aria-label="도착 시간" tabIndex={0} />
        <input className="border rounded px-2 py-1" name="parking_info" value={form.parking_info} onChange={handleChange} placeholder="주차 정보" aria-label="주차 정보" tabIndex={0} />
        <textarea className="border rounded px-2 py-1" name="memo" value={form.memo} onChange={handleChange} placeholder="메모" aria-label="메모" tabIndex={0} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>{editingId ? "수정" : "추가"}</button>
        {editingId && <button type="button" className="text-gray-500 underline" onClick={() => { setEditingId(null); setForm({ place_id: "", date: "", depart_time: "", arrive_time: "", parking_info: "", memo: "" }); }}>취소</button>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">탑승지</th>
            <th className="p-2">날짜</th>
            <th className="p-2">출발</th>
            <th className="p-2">도착</th>
            <th className="p-2">주차</th>
            <th className="p-2">메모</th>
            <th className="p-2">관리</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(schedule => {
            const place = places.find(p => p.id === schedule.place_id);
            return (
              <tr key={schedule.id} className="border-t">
                <td className="p-2">{place?.name || "-"}</td>
                <td className="p-2">{schedule.date}</td>
                <td className="p-2">{schedule.depart_time}</td>
                <td className="p-2">{schedule.arrive_time}</td>
                <td className="p-2">{schedule.parking_info}</td>
                <td className="p-2">{schedule.memo}</td>
                <td className="p-2">
                  <button className="text-yellow-600 mr-2" onClick={() => handleEdit(schedule)} aria-label="수정" tabIndex={0}>수정</button>
                  <button className="text-red-600" onClick={() => handleDelete(schedule.id)} aria-label="삭제" tabIndex={0}>삭제</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {loading && <div className="mt-4 text-blue-600">로딩 중...</div>}
    </div>
  );
};

export default BoardingScheduleManager; 