"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// 상품 타입
interface TourProduct {
  id: string;
  name: string;
  golf_course?: string;
  hotel?: string;
  description?: string;
}

const initialForm = { name: "", golf_course: "", hotel: "", description: "" };

const TourProductsPage = () => {
  const [products, setProducts] = useState<TourProduct[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("tour_products").select("*").order("name");
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name) {
      setError("상품명을 입력하세요.");
      return;
    }
    setLoading(true);
    if (editingId) {
      const { error } = await supabase.from("tour_products").update(form).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm(initialForm);
        fetchProducts();
      }
    } else {
      const { error } = await supabase.from("tour_products").insert([{ ...form }]);
      if (error) setError(error.message);
      else {
        setForm(initialForm);
        fetchProducts();
      }
    }
    setLoading(false);
  };

  const handleEdit = (p: TourProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      golf_course: p.golf_course || "",
      hotel: p.hotel || "",
      description: p.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    const { error } = await supabase.from("tour_products").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchProducts();
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">여행상품(투어 상품) 관리</h1>
      <form className="flex flex-col gap-2 mb-6" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="상품명" className="border rounded px-2 py-1" required aria-label="상품명" />
        <input name="golf_course" value={form.golf_course} onChange={handleChange} placeholder="골프장" className="border rounded px-2 py-1" aria-label="골프장" />
        <input name="hotel" value={form.hotel} onChange={handleChange} placeholder="숙소" className="border rounded px-2 py-1" aria-label="숙소" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="설명" className="border rounded px-2 py-1" aria-label="설명" />
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-700 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
          {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm(initialForm); }}>취소</button>}
        </div>
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      </form>
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-2 text-left">상품명</th>
              <th className="py-2 px-2 text-left">골프장</th>
              <th className="py-2 px-2 text-left">숙소</th>
              <th className="py-2 px-2 text-left">설명</th>
              <th className="py-2 px-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gray-200">
                <td className="py-1 px-2">{p.name}</td>
                <td className="py-1 px-2">{p.golf_course}</td>
                <td className="py-1 px-2">{p.hotel}</td>
                <td className="py-1 px-2">{p.description}</td>
                <td className="py-1 px-2 flex gap-1">
                  <button className="text-blue-700 underline" onClick={() => handleEdit(p)} aria-label="수정">수정</button>
                  <button className="text-red-600 underline" onClick={() => handleDelete(p.id)} aria-label="삭제">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TourProductsPage; 