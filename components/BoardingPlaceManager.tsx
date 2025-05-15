import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type BoardingPlace = {
  id: string;
  name: string;
  address: string;
  description?: string;
  map_url?: string;
  created_at?: string;
};

const BoardingPlaceManager: React.FC = () => {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [form, setForm] = useState<Omit<BoardingPlace, "id" | "created_at">>({ name: "", address: "", description: "", map_url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 목록 조회
  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("singsing_boarding_places").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setPlaces(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlaces(); }, []);

  // 입력값 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 추가/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.name || !form.address) {
      setError("탑승지명과 주소는 필수입니다.");
      setLoading(false);
      return;
    }
    if (editingId) {
      const { error } = await supabase.from("singsing_boarding_places").update(form).eq("id", editingId);
      if (error) setError(error.message);
      else setEditingId(null);
    } else {
      const { error } = await supabase.from("singsing_boarding_places").insert([{ ...form }]);
      if (error) setError(error.message);
    }
    setForm({ name: "", address: "", description: "", map_url: "" });
    setLoading(false);
    fetchPlaces();
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    const { error } = await supabase.from("singsing_boarding_places").delete().eq("id", id);
    if (error) setError(error.message);
    setLoading(false);
    fetchPlaces();
  };

  // 수정 모드 진입
  const handleEdit = (place: BoardingPlace) => {
    setEditingId(place.id);
    setForm({ name: place.name, address: place.address, description: place.description || "", map_url: place.map_url || "" });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">탑승지 정보 관리</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <input className="border rounded px-2 py-1" name="name" value={form.name} onChange={handleChange} placeholder="탑승지명" aria-label="탑승지명" tabIndex={0} required />
        <input className="border rounded px-2 py-1" name="address" value={form.address} onChange={handleChange} placeholder="주소" aria-label="주소" tabIndex={0} required />
        <input className="border rounded px-2 py-1" name="map_url" value={form.map_url} onChange={handleChange} placeholder="지도 링크" aria-label="지도 링크" tabIndex={0} />
        <textarea className="border rounded px-2 py-1" name="description" value={form.description} onChange={handleChange} placeholder="설명" aria-label="설명" tabIndex={0} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>{editingId ? "수정" : "추가"}</button>
        {editingId && <button type="button" className="text-gray-500 underline" onClick={() => { setEditingId(null); setForm({ name: "", address: "", description: "", map_url: "" }); }}>취소</button>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">탑승지명</th>
            <th className="p-2">주소</th>
            <th className="p-2">지도</th>
            <th className="p-2">설명</th>
            <th className="p-2">관리</th>
          </tr>
        </thead>
        <tbody>
          {places.map(place => (
            <tr key={place.id} className="border-t">
              <td className="p-2">{place.name}</td>
              <td className="p-2">{place.address}</td>
              <td className="p-2">
                {place.map_url && <a href={place.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">지도</a>}
              </td>
              <td className="p-2">{place.description}</td>
              <td className="p-2">
                <button className="text-yellow-600 mr-2" onClick={() => handleEdit(place)} aria-label="수정" tabIndex={0}>수정</button>
                <button className="text-red-600" onClick={() => handleDelete(place.id)} aria-label="삭제" tabIndex={0}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div className="mt-4 text-blue-600">로딩 중...</div>}
    </div>
  );
};

export default BoardingPlaceManager; 