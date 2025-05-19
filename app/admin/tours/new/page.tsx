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
  reservation_notice?: string;
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
    reservation_notice: `티오프 시간: 사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다.\n객실 배정: 예약 접수 순서대로 진행되오니 참고 부탁드립니다.\n식사 서비스: 불참 시에도 별도 환불이 불가하오니 양해 바랍니다.\n리무진 좌석: 가는 날 좌석은 오는 날에도 동일하게 이용해 주세요. 멀미 증상이 있으신 분은 사전 요청 시 앞좌석 배정 가능.`,
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
        reservation_notice: form.reservation_notice,
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
          <span className="font-medium">예약 안내 사항</span>
          <textarea name="reservation_notice" value={form.reservation_notice} onChange={handleChange} placeholder="예약 안내 사항" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[64px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" aria-label="예약 안내 사항" />
        </label>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700 mt-4" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
      </form>
    </div>
  );
};

export default TourNewPage; 