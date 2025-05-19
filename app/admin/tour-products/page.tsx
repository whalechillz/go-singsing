"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// 상품 타입
interface TourProduct {
  id: string;
  name: string;
  golf_course?: string;
  hotel?: string;
  date?: string;
}

const TourProductsPage = () => {
  const [products, setProducts] = useState<TourProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("tour_products").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    const { error } = await supabase.from("tour_products").delete().eq("id", id);
    if (error) setError(error.message);
    else setProducts((prev) => prev.filter((p) => p.id !== id));
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">여행상품 관리</h1>
        <Link href="/admin/tour-products/new" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700" aria-label="여행상품 등록">+ 여행상품 등록</Link>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">불러오는 중...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-2 px-4 text-left">상품명</th>
              <th className="py-2 px-4 text-left">골프장</th>
              <th className="py-2 px-4 text-left">숙소</th>
              <th className="py-2 px-4 text-left">일정</th>
              <th className="py-2 px-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-2 px-4 dark:text-gray-100">{p.name}</td>
                <td className="py-2 px-4 dark:text-gray-100">{p.golf_course}</td>
                <td className="py-2 px-4 dark:text-gray-100">{p.hotel}</td>
                <td className="py-2 px-4 dark:text-gray-100">{p.date}</td>
                <td className="py-2 px-4 flex gap-2">
                  <Link href={`/admin/tour-products/${p.id}/edit`} className="text-blue-800 dark:text-blue-400 underline hover:text-blue-600 focus:text-blue-600 dark:hover:text-blue-300 dark:focus:text-blue-300" aria-label="수정">수정</Link>
                  <button className="text-red-600 dark:text-red-400 underline hover:text-red-400 focus:text-red-400" aria-label="삭제" onClick={() => handleDelete(p.id)}>삭제</button>
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