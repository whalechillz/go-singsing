"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, X, Users, Phone, FileText, Settings } from "lucide-react";

type StaffMember = {
  name: string;
  phone: string;
  role: string;
};

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
  
  // 문서 표시 옵션
  show_staff_info: boolean;
  show_footer_message: boolean;
  show_company_phones: boolean;
  show_golf_phones: boolean;
  
  // 푸터 및 연락처
  footer_message: string;
  company_phone: string;
  company_mobile: string;
  golf_reservation_phone: string;
  golf_reservation_mobile: string;
  
  // 주의사항
  notices: string;
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
    
    // 문서 표시 옵션 (기본값)
    show_staff_info: true,
    show_footer_message: true,
    show_company_phones: true,
    show_golf_phones: true,
    
    // 푸터 및 연락처 (기본값)
    footer_message: "♡ 즐거운 하루 되시길 바랍니다. ♡",
    company_phone: "031-215-3990",
    company_mobile: "010-3332-9020",
    golf_reservation_phone: "",
    golf_reservation_mobile: "",
    
    // 주의사항 (기본값)
    notices: `• 집합시간: 티오프 시간 30분 전 골프장 도착
• 준비사항: 골프복, 골프화, 모자, 선글라스
• 카트배정: 4인 1카트 원칙
• 날씨대비: 우산, 우의 등 개인 준비`,
    
    reservation_notice: `티오프 시간: 사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다.
객실 배정: 예약 접수 순서대로 진행되오니 참고 부탁드립니다.
식사 서비스: 불참 시에도 별도 환불이 불가하오니 양해 바랍니다.
리무진 좌석: 가는 날 좌석은 오는 날에도 동일하게 이용해 주세요. 멀미 증상이 있으신 분은 사전 요청 시 앞좌석 배정 가능.`,
  });
  
  const [staff, setStaff] = useState<StaffMember[]>([
    { name: "", phone: "", role: "기사" }
  ]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"basic" | "staff" | "document">("basic");

  useEffect(() => {
    supabase.from("tour_products").select("id, name, hotel").then(({ data }) => {
      setProducts(data || []);
    });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
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

  const handleStaffChange = (index: number, field: 'name' | 'phone' | 'role', value: string) => {
    const newStaff = [...staff];
    newStaff[index][field] = value;
    setStaff(newStaff);
  };

  const addStaff = () => {
    setStaff([...staff, { name: "", phone: "", role: "가이드" }]);
  };

  const removeStaff = (index: number) => {
    setStaff(staff.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // 1. 투어 생성
      const { data: tourData, error: tourError } = await supabase
        .from("singsing_tours")
        .insert([{
          ...form,
          price: form.price ? Number(form.price) : null,
          max_participants: form.max_participants ? Number(form.max_participants) : null,
        }])
        .select()
        .single();
      
      if (tourError) throw tourError;
      
      // 2. 스텝진 추가
      const validStaff = staff.filter(s => s.name.trim() !== "");
      if (validStaff.length > 0 && tourData) {
        const staffRecords = validStaff.map((s, index) => ({
          tour_id: tourData.id,
          name: s.name,
          phone: s.phone,
          role: s.role,
          display_order: index + 1
        }));
        
        const { error: staffError } = await supabase
          .from("singsing_tour_staff")
          .insert(staffRecords);
        
        if (staffError) throw staffError;
      }
      
      router.push("/admin/tours");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">투어 스케쥴 생성</h2>
      
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          type="button"
          className={`pb-2 px-1 font-medium ${activeTab === "basic" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("basic")}
        >
          기본 정보
        </button>
        <button
          type="button"
          className={`pb-2 px-1 font-medium ${activeTab === "staff" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("staff")}
        >
          <Users className="w-4 h-4 inline mr-1" />
          스텝진 관리
        </button>
        <button
          type="button"
          className={`pb-2 px-1 font-medium ${activeTab === "document" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("document")}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          문서 설정
        </button>
      </div>
      
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* 기본 정보 탭 */}
        {activeTab === "basic" && (
          <>
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">제목</span>
              <input name="title" type="text" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.title} onChange={handleChange} required />
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
              <textarea name="reservation_notice" value={form.reservation_notice} onChange={handleChange} placeholder="예약 안내 사항" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </label>
          </>
        )}
        
        {/* 스텝진 관리 탭 */}
        {activeTab === "staff" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">스텝진 정보</h3>
              <button
                type="button"
                onClick={addStaff}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                스텝 추가
              </button>
            </div>
            
            {staff.map((member, index) => (
              <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <select
                  value={member.role}
                  onChange={(e) => handleStaffChange(index, "role", e.target.value)}
                  className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="기사">기사</option>
                  <option value="가이드">가이드</option>
                  <option value="인솔자">인솔자</option>
                  <option value="매니저">매니저</option>
                </select>
                
                <input
                  type="text"
                  placeholder="이름"
                  value={member.name}
                  onChange={(e) => handleStaffChange(index, "name", e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
                
                <input
                  type="text"
                  placeholder="연락처 (선택사항)"
                  value={member.phone}
                  onChange={(e) => handleStaffChange(index, "phone", e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
                
                {staff.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStaff(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* 문서 설정 탭 */}
        {activeTab === "document" && (
          <div className="space-y-6">
            {/* 표시 옵션 */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                문서 표시 옵션
              </h3>
              <div className="space-y-2 pl-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_staff_info"
                    checked={form.show_staff_info}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">스텝진 정보 표시</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_footer_message"
                    checked={form.show_footer_message}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">푸터 메시지 표시</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_company_phones"
                    checked={form.show_company_phones}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">회사 연락처 표시</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_golf_phones"
                    checked={form.show_golf_phones}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">골프장 연락처 표시</span>
                </label>
              </div>
            </div>
            
            {/* 연락처 정보 */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                연락처 정보
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">회사 대표번호</span>
                  <input
                    name="company_phone"
                    type="text"
                    value={form.company_phone}
                    onChange={handleChange}
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">회사 업무핸드폰</span>
                  <input
                    name="company_mobile"
                    type="text"
                    value={form.company_mobile}
                    onChange={handleChange}
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">골프장 예약실</span>
                  <input
                    name="golf_reservation_phone"
                    type="text"
                    value={form.golf_reservation_phone}
                    onChange={handleChange}
                    placeholder="예: 031-123-4567"
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">예약담당 핸드폰</span>
                  <input
                    name="golf_reservation_mobile"
                    type="text"
                    value={form.golf_reservation_mobile}
                    onChange={handleChange}
                    placeholder="예: 010-1234-5678"
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </label>
              </div>
            </div>
            
            {/* 라운딩 주의사항 */}
            <label className="flex flex-col gap-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">라운딩 이용 안내</span>
              <textarea
                name="notices"
                value={form.notices}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[120px] bg-white dark:bg-gray-800"
                placeholder="라운딩 시 주의사항을 입력하세요"
              />
            </label>
            
            {/* 푸터 메시지 */}
            <label className="flex flex-col gap-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">푸터 메시지</span>
              <input
                name="footer_message"
                type="text"
                value={form.footer_message}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
              />
            </label>
          </div>
        )}
        
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        
        <div className="flex gap-2 mt-4">
          <button 
            type="submit" 
            className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-700 focus:bg-blue-700" 
            disabled={loading}
          >
            {loading ? "저장 중..." : "투어 생성"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/tours")}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourNewPage;