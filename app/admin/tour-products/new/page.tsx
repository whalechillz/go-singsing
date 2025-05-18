"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const initialForm = {
  name: "",
  golf_course: "",
  hotel: "",
  date: "",
  included: "",
  not_included: "",
  reservation_notice: "",
  schedule_notice: "※ 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.",
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
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">여행상품(투어 상품) 신규 등록</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="상품명" className="border rounded px-2 py-1" required aria-label="상품명" />
        <input name="golf_course" value={form.golf_course} onChange={handleChange} placeholder="골프장" className="border rounded px-2 py-1" required aria-label="골프장" />
        <input name="hotel" value={form.hotel} onChange={handleChange} placeholder="숙소" className="border rounded px-2 py-1" required aria-label="숙소" />
        <input name="date" value={form.date} onChange={handleChange} placeholder="일정 (예: 2025-05-19 ~ 2025-05-21)" className="border rounded px-2 py-1" aria-label="일정" />
        <textarea name="included" value={form.included} onChange={handleChange} placeholder="포함 사항" className="border rounded px-2 py-1 min-h-[48px]" aria-label="포함 사항" />
        <textarea name="not_included" value={form.not_included} onChange={handleChange} placeholder="불포함 사항" className="border rounded px-2 py-1 min-h-[48px]" aria-label="불포함 사항" />
        <textarea name="reservation_notice" value={form.reservation_notice} onChange={handleChange} placeholder="예약 안내 사항 (여러 줄 입력 가능)" className="border rounded px-2 py-1 min-h-[48px]" aria-label="예약 안내 사항" />
        <textarea name="schedule_notice" value={form.schedule_notice} onChange={handleChange} placeholder="기타 안내문구 (일정표 하단)" className="border rounded px-2 py-1 min-h-[32px]" aria-label="기타 안내문구" />
        <div className="font-bold mt-4">이용 안내</div>
        <textarea name="usage_round" value={form.usage_round} onChange={handleChange} placeholder="라운딩 규정" className="border rounded px-2 py-1 min-h-[32px]" aria-label="라운딩 규정" />
        <textarea name="usage_hotel" value={form.usage_hotel} onChange={handleChange} placeholder="숙소 이용" className="border rounded px-2 py-1 min-h-[32px]" aria-label="숙소 이용" />
        <textarea name="usage_meal" value={form.usage_meal} onChange={handleChange} placeholder="식사 안내" className="border rounded px-2 py-1 min-h-[32px]" aria-label="식사 안내" />
        <textarea name="usage_locker" value={form.usage_locker} onChange={handleChange} placeholder="락카 이용" className="border rounded px-2 py-1 min-h-[32px]" aria-label="락카 이용" />
        <textarea name="usage_bus" value={form.usage_bus} onChange={handleChange} placeholder="버스 이용" className="border rounded px-2 py-1 min-h-[32px]" aria-label="버스 이용" />
        <textarea name="usage_tour" value={form.usage_tour} onChange={handleChange} placeholder="관광지 투어" className="border rounded px-2 py-1 min-h-[32px]" aria-label="관광지 투어" />
        <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded mt-4" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      </form>
    </div>
  );
};

export default TourProductNewPage; 