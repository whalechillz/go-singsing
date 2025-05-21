"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface TourProductForm {
  name: string;
  golf_course: string;
  hotel: string;
  usage_round: string;
  usage_hotel: string;
  usage_meal: string;
  usage_locker: string;
  usage_bus: string;
  usage_tour: string;
  courses: string[];
}

const initialForm: TourProductForm = {
  name: "",
  golf_course: "",
  hotel: "",
  usage_round: "",
  usage_hotel: "",
  usage_meal: "",
  usage_locker: "",
  usage_bus: "",
  usage_tour: "",
  courses: [],
};

const TourProductEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [form, setForm] = useState<TourProductForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseInput, setCourseInput] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase.from("tour_products").select("id, name, hotel, golf_course, usage_round, usage_hotel, usage_meal, usage_locker, usage_bus, usage_tour, courses").eq("id", id).single().then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setForm({
        name: data.name || "",
        golf_course: data.golf_course || "",
        hotel: data.hotel || "",
        usage_round: data.usage_round || "",
        usage_hotel: data.usage_hotel || "",
        usage_meal: data.usage_meal || "",
        usage_locker: data.usage_locker || "",
        usage_bus: data.usage_bus || "",
        usage_tour: data.usage_tour || "",
        courses: Array.isArray(data.courses) ? data.courses : [],
      });
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseInput(e.target.value);
  };

  const handleAddCourse = () => {
    const value = courseInput.trim();
    if (!value || form.courses.includes(value)) return;
    setForm({ ...form, courses: [...form.courses, value] });
    setCourseInput("");
  };

  const handleCourseInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddCourse();
    }
  };

  const handleRemoveCourse = (idx: number) => {
    setForm({ ...form, courses: form.courses.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.golf_course || !form.hotel) {
      setError("상품명, 골프장, 숙소는 필수입니다.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("tour_products").update({ ...form, courses: form.courses }).eq("id", id);
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/admin/tour-products");
  };

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">여행상품(투어 상품) 수정</h1>
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
        <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">코스명(여러 개)</span>
          <div className="flex gap-2">
            <input
              value={courseInput}
              onChange={handleCourseInputChange}
              onKeyDown={handleCourseInputKeyDown}
              placeholder="코스명 입력 후 Enter"
              className="border rounded px-2 py-1 flex-1"
            />
            <button type="button" onClick={handleAddCourse} className="bg-blue-600 text-white px-3 py-1 rounded">추가</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.courses.map((c, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                {c}
                <button type="button" onClick={() => handleRemoveCourse(i)} className="ml-1 text-xs text-red-500">×</button>
              </span>
            ))}
          </div>
        </label>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700 mt-4" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
      </form>
    </div>
  );
};

export default TourProductEditPage; 