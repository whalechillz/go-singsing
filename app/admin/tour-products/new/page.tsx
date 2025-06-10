"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, X } from "lucide-react";

interface GolfCourse {
  name: string;
  description: string;
}

interface Notice {
  order: number;
  content: string;
}

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
  // 새로운 필드들
  golf_courses: GolfCourse[];
  included_items: string;
  excluded_items: string;
  accommodation_info: string;
  general_notices: Notice[];
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
  golf_courses: [
    { name: "파인힐스", description: "18홀 파72" },
    { name: "레이크힐스", description: "18홀 파72" }
  ],
  included_items: "그린피(18홀×3일)\n숙박 2박\n전일정 클럽식\n카트비\n리무진 버스(상해보장)\n2일차 관광",
  excluded_items: "캐디피\n중식 및 석식\n개인 경비\n여행자 보험",
  accommodation_info: "",
  general_notices: [
    { order: 1, content: "티오프 시간: 사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다." },
    { order: 2, content: "객실 배정: 예약 접수 순서대로 진행되오니 참고 부탁드립니다." },
    { order: 3, content: "식사 서비스: 불참 시에도 별도 환불이 불가하오니 양해 바랍니다." },
    { order: 4, content: "리무진 좌석: 가는 날 좌석은 오는 날에도 동일하게 이용해 주세요." }
  ]
};

const TourProductNewPage = () => {
  const [form, setForm] = useState<TourProductForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [newGolfCourse, setNewGolfCourse] = useState<GolfCourse>({ name: "", description: "" });
  const router = useRouter();

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

  // 골프장 관리
  const handleAddGolfCourse = () => {
    if (!newGolfCourse.name.trim()) return;
    setForm({ 
      ...form, 
      golf_courses: [...form.golf_courses, { ...newGolfCourse }] 
    });
    setNewGolfCourse({ name: "", description: "" });
  };

  const handleRemoveGolfCourse = (idx: number) => {
    setForm({ 
      ...form, 
      golf_courses: form.golf_courses.filter((_, i) => i !== idx) 
    });
  };

  // 공지사항 관리
  const handleAddNotice = () => {
    const newOrder = Math.max(...form.general_notices.map(n => n.order), 0) + 1;
    setForm({
      ...form,
      general_notices: [...form.general_notices, { order: newOrder, content: "" }]
    });
  };

  const handleNoticeChange = (idx: number, content: string) => {
    const updated = [...form.general_notices];
    updated[idx].content = content;
    setForm({ ...form, general_notices: updated });
  };

  const handleRemoveNotice = (idx: number) => {
    setForm({
      ...form,
      general_notices: form.general_notices.filter((_, i) => i !== idx)
    });
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
      .insert([{ 
        ...form, 
        courses: form.courses,
        golf_courses: form.golf_courses,
        general_notices: form.general_notices.filter(n => n.content.trim())
      }]);
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/admin/tour-products");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold mb-6">여행상품 신규 등록</h1>
        
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  메인 골프장 <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  숙소 정보
                </label>
                <input
                  name="accommodation_info"
                  value={form.accommodation_info}
                  onChange={handleChange}
                  placeholder="숙소 상세 정보"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 골프장 목록 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">골프장 정보</h2>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={newGolfCourse.name}
                  onChange={(e) => setNewGolfCourse({ ...newGolfCourse, name: e.target.value })}
                  placeholder="골프장명"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={newGolfCourse.description}
                  onChange={(e) => setNewGolfCourse({ ...newGolfCourse, description: e.target.value })}
                  placeholder="설명 (예: 18홀 파72)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddGolfCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> 추가
                </button>
              </div>

              {form.golf_courses.length > 0 && (
                <div className="space-y-2 bg-gray-50 p-3 rounded">
                  {form.golf_courses.map((gc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                      <div>
                        <span className="font-medium">{gc.name}</span>
                        {gc.description && <span className="text-gray-500 ml-2">- {gc.description}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGolfCourse(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 italic">* 기본값이 설정되어 있습니다. 필요시 수정하세요.</p>
            </div>
          </div>

          {/* 포함/불포함 사항 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">포함/불포함 사항</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                포함 사항
              </label>
              <textarea
                name="included_items"
                value={form.included_items}
                onChange={handleChange}
                placeholder="포함되는 항목들"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                * 각 항목을 줄바꿈으로 구분하면 견적서에서 개별 항목으로 표시됩니다.
                <br/>예) 
                <br/>그린피(18홀×3일)
                <br/>숙박 2박
                <br/>전일정 클럽식
                <br/><br/>
                * 기본값이 설정되어 있습니다.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                불포함 사항
              </label>
              <textarea
                name="excluded_items"
                value={form.excluded_items}
                onChange={handleChange}
                placeholder="불포함 항목들"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                * 여러 항목은 줄바꿈으로 구분해 주세요.
              </p>
            </div>
          </div>

          {/* 일반 공지사항 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">일반 공지사항</h2>
              <button
                type="button"
                onClick={handleAddNotice}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> 공지 추가
              </button>
            </div>
            
            <div className="space-y-3">
              {form.general_notices.map((notice, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="mt-2 text-sm text-gray-500 w-8">{notice.order}.</span>
                  <textarea
                    value={notice.content}
                    onChange={(e) => handleNoticeChange(idx, e.target.value)}
                    placeholder="공지사항 내용"
                    rows={2}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNotice(idx)}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <p className="text-sm text-gray-500 italic">* 기본 공지사항이 설정되어 있습니다. 필요시 수정하세요.</p>
            </div>
          </div>

          {/* 이용 안내 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">이용 안내</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourProductNewPage;