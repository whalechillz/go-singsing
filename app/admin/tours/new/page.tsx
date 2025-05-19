"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type TourForm = {
  title: string;
  start_date: string;
  end_date: string;
  golf_course: string;
  accommodation: string;
  price: string;
  max_participants: string;
  includes: string;
  excludes: string;
  driver_name: string;
  schedule_notice?: string;
};

const TourNewPage: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<TourForm>({
    title: "",
    start_date: "",
    end_date: "",
    golf_course: "",
    accommodation: "",
    price: "",
    max_participants: "",
    includes: "",
    excludes: "",
    driver_name: "",
    schedule_notice: "※ 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("tour_products").select("id, name, hotel").then(({ data }) => {
      setProducts(data || []);
    });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGolfCourseChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const selectedProduct = products.find((p) => p.name === selectedName);
    setForm({
      ...form,
      golf_course: selectedProduct ? selectedProduct.name : "",
      accommodation: selectedProduct ? selectedProduct.hotel : "",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.from("singsing_tours").insert([
      {
        ...form,
        price: form.price ? Number(form.price) : null,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        schedule_notice: form.schedule_notice,
      },
    ]);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/tours");
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">투어 스케쥴 생성</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">제목</span>
          <input name="title" type="text" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.title} onChange={handleChange} required />
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">기사님 이름</span>
          <input name="driver_name" type="text" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.driver_name || ''} onChange={handleChange} required />
        </label>
        <div className="flex gap-2">
          <label className="flex flex-col gap-1 flex-1 text-gray-700 dark:text-gray-300">
            <span className="font-medium">시작일</span>
            <input name="start_date" type="date" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.start_date} onChange={handleChange} required />
          </label>
          <label className="flex flex-col gap-1 flex-1 text-gray-700 dark:text-gray-300">
            <span className="font-medium">종료일</span>
            <input name="end_date" type="date" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.end_date} onChange={handleChange} required />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">골프장</span>
          <select name="golf_course" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.golf_course} onChange={handleGolfCourseChange} required>
            <option value="">골프장(투어 상품) 선택</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">숙소</span>
          <input name="accommodation" type="text" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.accommodation} onChange={handleChange} required />
        </label>
        <div className="flex gap-2">
          <label className="flex flex-col gap-1 flex-1 text-gray-700 dark:text-gray-300">
            <span className="font-medium">가격</span>
            <input name="price" type="number" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.price} onChange={handleChange} required />
          </label>
          <label className="flex flex-col gap-1 flex-1 text-gray-700 dark:text-gray-300">
            <span className="font-medium">최대 인원</span>
            <input name="max_participants" type="number" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.max_participants} onChange={handleChange} required />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">기타 안내문구 (일정표 하단)</span>
          <textarea name="schedule_notice" value={form.schedule_notice} onChange={handleChange} placeholder="기타 안내문구 (일정표 하단)" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[32px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="기타 안내문구" />
        </label>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700 mt-4" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
      </form>
    </div>
  );
};

export default TourNewPage; 