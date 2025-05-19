"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const initialForm = {
  name: "",
  golf_course: "",
  hotel: "",
  usage_round: "",
  usage_hotel: "",
  usage_meal: "",
  usage_locker: "",
  usage_bus: "",
  usage_tour: "",
};

const TourProductNewPage = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.golf_course || !form.hotel) {
      setError("상품명, 골프장, 숙소는 필수입니다.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("tour_products").insert([{ ...form }]);
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/admin/tour-products");
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">여행상품(투어 상품) 신규 등록</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">상품명</span>
          <input name="name" value={form.name} onChange={handleChange} placeholder="상품명" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required aria-label="상품명" />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">골프장</span>
          <input name="golf_course" value={form.golf_course} onChange={handleChange} placeholder="골프장" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required aria-label="골프장" />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">숙소</span>
          <input name="hotel" value={form.hotel} onChange={handleChange} placeholder="숙소" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required aria-label="숙소" />
        </label>
        <div className="font-bold mt-4 text-gray-800 dark:text-gray-200">이용 안내</div>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">라운딩 규정</span>
          <textarea name="usage_round" value={form.usage_round} onChange={handleChange} placeholder="라운딩 규정" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[32px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="라운딩 규정" />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">숙소 이용</span>
          <textarea name="usage_hotel" value={form.usage_hotel} onChange={handleChange} placeholder="숙소 이용" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[32px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="숙소 이용" />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">식사 안내</span>
          <textarea name="usage_meal" value={form.usage_meal} onChange={handleChange} placeholder="식사 안내" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[32px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="식사 안내" />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">락카 이용</span>
          <textarea name="usage_locker" value={form.usage_locker} onChange={handleChange} placeholder="락카 이용" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[32px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="락카 이용" />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">버스 이용</span>
          <textarea name="usage_bus" value={form.usage_bus} onChange={handleChange} placeholder="버스 이용" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[32px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="버스 이용" />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">관광지 투어</span>
          <textarea name="usage_tour" value={form.usage_tour} onChange={handleChange} placeholder="관광지 투어" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[32px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="관광지 투어" />
        </label>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700 mt-4" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
      </form>
    </div>
  );
};

export default TourProductNewPage; 