"use client";
import { useState, useEffect } from "react";
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
  const [form, setForm] = useState<TourProductForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from("tour_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      if (data) {
        setForm({
          name: data.name || "",
          golf_course: data.golf_course || "",
          hotel: data.hotel || "",
          usage_round: data.usage_round || "",
          usage_hotel: data.usage_hotel || "",
          usage_meal: data.usage_meal || "",
          usage_locker: data.usage_locker || "",
          usage_bus: data.usage_bus || "",
          usage_tour: data.usage_tour || "",
          courses: data.courses || [],
        });
      }
    } catch (error: any) {
      setError(error.message || "상품 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoadingData(false);
    }
  };

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
    const { error } = await supabase
      .from("tour_products")
      .update({ ...form, courses: form.courses })
      .eq("id", productId);
    setLoading(false);
    if (error) setError(error.message);
    else {
      alert("상품이 수정되었습니다.");
      router.push("/admin/tour-products");
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <p className="mt-2 text-gray-500">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold mb-6">여행상품 수정</h1>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="상품명"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                골프장 <span className="text-red-500">*</span>
              </label>
              <input
                name="golf_course"
                value={form.golf_course}
                onChange={handleChange}
                placeholder="골프장"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                숙소 <span className="text-red-500">*</span>
              </label>
              <input
                name="hotel"
                value={form.hotel}
                onChange={handleChange}
                placeholder="숙소"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* 이용 안내 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">이용 안내</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                라운딩 규정
              </label>
              <textarea
                name="usage_round"
                value={form.usage_round}
                onChange={handleChange}
                placeholder="라운딩 규정"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                숙소 이용
              </label>
              <textarea
                name="usage_hotel"
                value={form.usage_hotel}
                onChange={handleChange}
                placeholder="숙소 이용"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                식사 안내
              </label>
              <textarea
                name="usage_meal"
                value={form.usage_meal}
                onChange={handleChange}
                placeholder="식사 안내"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                락카 이용
              </label>
              <textarea
                name="usage_locker"
                value={form.usage_locker}
                onChange={handleChange}
                placeholder="락카 이용"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                버스 이용
              </label>
              <textarea
                name="usage_bus"
                value={form.usage_bus}
                onChange={handleChange}
                placeholder="버스 이용"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관광지 투어
              </label>
              <textarea
                name="usage_tour"
                value={form.usage_tour}
                onChange={handleChange}
                placeholder="관광지 투어"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                코스명(여러 개)
              </label>
              <div className="flex gap-2">
                <input
                  value={courseInput}
                  onChange={handleCourseInputChange}
                  onKeyDown={handleCourseInputKeyDown}
                  placeholder="코스명 입력 후 Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  추가
                </button>
              </div>
              {form.courses.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.courses.map((c, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {c}
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(i)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/tour-products")}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "저장 중..." : "수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourProductEditPage;