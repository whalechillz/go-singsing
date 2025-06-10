"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  golf_courses: [],
  included_items: "그린피(18홀×3일)\n숙박 2박\n전일정 클럽식\n카트비\n리무진 버스(상해보장)\n2일차 관광",
  excluded_items: "캐디피\n중식 및 석식\n개인 경비\n여행자 보험",
  accommodation_info: "",
  general_notices: [
    { order: 1, content: "티오프 시간: 사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다." },
    { order: 2, content: "객실 배정: 예약 접수 순서대로 진행되오니 참고 부탁드립니다." },
    { order: 3, content: "식사 서비스: 불참 시에도 별도 환불이 불가하오니 양해 바랍니다." },
    { order: 4, content: "리무진 좌석: 가는 날 좌석은 오는 날에도 동일하게 이용해 주세요." },
    { order: 5, content: "집합시간: 티오프 시간 30분 전 골프장 도착" },
    { order: 6, content: "준비사항: 골프복, 골프화, 모자, 선글라스" },
    { order: 7, content: "카트배정: 4인 1카트 원칙" },
    { order: 8, content: "날씨대비: 우산, 우의 등 개인 준비" }
  ]
};

// 텍스트를 파싱하여 "제목: 내용" 형식을 볼드 처리하는 함수
const formatTextWithBold = (text: string): string => {
  return text.split('\n').map(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1 && colonIndex < line.length - 1) {
      const title = line.substring(0, colonIndex).trim();
      const content = line.substring(colonIndex + 1).trim();
      return `<strong>${title}:</strong> ${content}`;
    }
    return line;
  }).join('<br>');
};

// 미리보기용 컴포넌트
const UsagePreview = ({ value, label }: { value: string; label: string }) => {
  if (!value) return null;
  
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
      <div className="text-xs text-gray-500 mb-1">{label} 미리보기:</div>
      <div 
        dangerouslySetInnerHTML={{ __html: formatTextWithBold(value) }}
        className="text-gray-700"
      />
    </div>
  );
};

const TourProductEditPage = () => {
  const [form, setForm] = useState<TourProductForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [newGolfCourse, setNewGolfCourse] = useState<GolfCourse>({ name: "", description: "" });
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
          golf_courses: data.golf_courses || [],
          included_items: data.included_items || initialForm.included_items,
          excluded_items: data.excluded_items || initialForm.excluded_items,
          accommodation_info: data.accommodation_info || "",
          general_notices: data.general_notices || initialForm.general_notices
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
      .update({ 
        ...form, 
        courses: form.courses,
        golf_courses: form.golf_courses,
        general_notices: form.general_notices.filter(n => n.content.trim())
      })
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <p className="mt-2 text-gray-500">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold mb-6">여행상품 수정</h1>
        
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
                  placeholder="숙소 (예: A호텔, B리조트)"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">여러 숙소를 사용하는 경우 쉼표로 구분해 주세요</p>
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
            </div>

            {/* 코스명 - 골프장 정보 아래로 이동 */}
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
              <p className="text-xs text-gray-500 mt-1">
              * 각 항목을 줄바꿈으로 구분하면 견적서에서 개별 항목으로 표시됩니다.
              <br/>예) 
              <br/>그린피(18홀×3일)
              <br/>숙박 2박
              <br/>전일정 클럽식
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
              <h2 className="text-lg font-semibold text-gray-800">예약 안내 사항</h2>
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
            </div>
          </div>

          {/* 이용 안내 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b">상세 이용 안내</h2>
            
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
                <p className="text-xs text-gray-500 mt-1">"제목: 내용" 형식으로 입력하면 제목이 볼드체로 표시됩니다.</p>
                <UsagePreview value={form.usage_round} label="라운딩 규정" />
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
                <UsagePreview value={form.usage_hotel} label="숙소 이용" />
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
                <UsagePreview value={form.usage_meal} label="식사 안내" />
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
                <UsagePreview value={form.usage_locker} label="락카 이용" />
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
                <UsagePreview value={form.usage_bus} label="버스 이용" />
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
                <UsagePreview value={form.usage_tour} label="관광지 투어" />
              </div>
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