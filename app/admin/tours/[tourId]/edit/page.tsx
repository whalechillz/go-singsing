"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, X, Users, Phone, FileText, Settings } from "lucide-react";
// DocumentNoticeManager 제거됨

type StaffMember = {
  id?: string;
  name: string;
  phone: string;
  role: string;
  display_order?: number;
};

type ReservationNotice = {
  order: number;
  title: string;
  content: string;
};

type TourForm = {
  title: string;
  start_date: string;
  end_date: string;
  tour_product_id: string;
  // accommodation: string; // 삭제됨
  price: string;
  max_participants: string;
  // includes: string; // 삭제됨
  // excludes: string; // 삭제됨
  
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
  special_notices: string;
  reservation_notices: ReservationNotice[];
  other_notices: string;
  document_settings: {
    customer_schedule: boolean;
    customer_boarding: boolean;
    staff_boarding: boolean;
    room_assignment: boolean;
    tee_time: boolean;
    simplified: boolean;
  };
};

type Params = { tourId?: string };

const TourEditPage: React.FC = () => {
  const router = useRouter();
  const params = useParams() as Params;
  const tourId = params?.tourId ?? "";
  const [form, setForm] = useState<TourForm>({
    title: "",
    start_date: "",
    end_date: "",
    tour_product_id: "",
    // accommodation: "", // 삭제됨
    price: "",
    max_participants: "",
    // includes: "", // 삭제됨
    // excludes: "", // 삭제됨
    
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
    
    // 투어별 특수 공지사항
    special_notices: "",
    
    reservation_notices: [
      { order: 1, title: "티오프 시간", content: "사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다." },
      { order: 2, title: "객실 배정", content: "예약 접수 순서대로 진행되오니 참고 부탁드립니다." },
      { order: 3, title: "식사 서비스", content: "불참 시에도 별도 환불이 불가하오니 양해 바랍니다." },
      { order: 4, title: "리무진 좌석", content: "가는 날 좌석은 오는 날에도 동일하게 이용해 주세요." }
    ],
    other_notices: "※ 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.",
    document_settings: {
      customer_schedule: true,
      customer_boarding: true,
      staff_boarding: true,
      room_assignment: true,
      tee_time: true,
      simplified: true
    }
  });
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [deletedStaffIds, setDeletedStaffIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"basic" | "staff" | "document">("basic");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 투어 정보 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single();
        
      if (tourError) {
        setError(tourError.message);
      } else if (tourData) {
        setForm({
          title: tourData.title || "",
          start_date: tourData.start_date ? tourData.start_date.substring(0, 10) : "",
          end_date: tourData.end_date ? tourData.end_date.substring(0, 10) : "",
          tour_product_id: tourData.tour_product_id || "",
          accommodation: tourData.accommodation || "",
          price: tourData.price?.toString() || "",
          max_participants: tourData.max_participants?.toString() || "",
          includes: tourData.includes || "",
          excludes: tourData.excludes || "",
          
          // 문서 표시 옵션
          show_staff_info: tourData.show_staff_info ?? true,
          show_footer_message: tourData.show_footer_message ?? true,
          show_company_phones: tourData.show_company_phones ?? true,
          show_golf_phones: tourData.show_golf_phones ?? true,
          
          // 푸터 및 연락처
          footer_message: tourData.footer_message || "♡ 즐거운 하루 되시길 바랍니다. ♡",
          company_phone: tourData.company_phone || "031-215-3990",
          company_mobile: tourData.company_mobile || "010-3332-9020",
          golf_reservation_phone: tourData.golf_reservation_phone || "",
          golf_reservation_mobile: tourData.golf_reservation_mobile || "",
          
          // 투어별 특수 공지사항
          special_notices: typeof tourData.special_notices === 'string' 
            ? tourData.special_notices 
            : tourData.special_notices?.text || "",
          
          reservation_notices: tourData.reservation_notices || [
            { order: 1, title: "티오프 시간", content: "사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다." },
            { order: 2, title: "객실 배정", content: "예약 접수 순서대로 진행되오니 참고 부탁드립니다." },
            { order: 3, title: "식사 서비스", content: "불참 시에도 별도 환불이 불가하오니 양해 바랍니다." },
            { order: 4, title: "리무진 좌석", content: "가는 날 좌석은 오는 날에도 동일하게 이용해 주세요." }
          ],
          other_notices: tourData.other_notices || "※ 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.",
          document_settings: tourData.document_settings || {
            customer_schedule: true,
            customer_boarding: true,
            staff_boarding: true,
            room_assignment: true,
            tee_time: true,
            simplified: true
          }
        });
      }
      
      // 스텝진 정보 가져오기
      const { data: staffData, error: staffError } = await supabase
        .from("singsing_tour_staff")
        .select("*")
        .eq("tour_id", tourId)
        .order("display_order");
        
      if (!staffError && staffData) {
        setStaff(staffData);
      }
      
      // 투어 상품 정보 가져오기
      const { data: productsData } = await supabase
        .from("tour_products")
        .select("*");
        
      setProducts(productsData || []);
      setLoading(false);
    };
    
    if (tourId) fetchData();
  }, [tourId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith("document_settings.")) {
        const docType = name.split(".")[1];
        setForm({
          ...form,
          document_settings: {
            ...form.document_settings,
            [docType]: checked
          }
        });
      } else {
        setForm({ ...form, [name]: checked });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedProduct = products.find((p) => p.id === selectedId);
    if (selectedProduct) {
      setForm({
        ...form,
        tour_product_id: selectedId,
        accommodation: selectedProduct.hotel || "",
        includes: selectedProduct.included_items || form.includes,
        excludes: selectedProduct.excluded_items || form.excludes,
      });
    }
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
    const staffToRemove = staff[index];
    if (staffToRemove.id) {
      setDeletedStaffIds([...deletedStaffIds, staffToRemove.id]);
    }
    setStaff(staff.filter((_, i) => i !== index));
  };

  // 예약 안내사항 관리
  const addReservationNotice = () => {
    const newOrder = Math.max(...form.reservation_notices.map(n => n.order), 0) + 1;
    setForm({
      ...form,
      reservation_notices: [...form.reservation_notices, { order: newOrder, title: "", content: "" }]
    });
  };

  const updateReservationNotice = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...form.reservation_notices];
    updated[index][field] = value;
    setForm({ ...form, reservation_notices: updated });
  };

  const removeReservationNotice = (index: number) => {
    setForm({
      ...form,
      reservation_notices: form.reservation_notices.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    try {
      // 1. 투어 정보 업데이트
      const updateData = {
        title: form.title,
        start_date: form.start_date,
        end_date: form.end_date,
        tour_product_id: form.tour_product_id || null,
        accommodation: form.accommodation,
        price: form.price ? Number(form.price) : null,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        includes: form.includes,
        excludes: form.excludes,
        show_staff_info: form.show_staff_info,
        show_footer_message: form.show_footer_message,
        show_company_phones: form.show_company_phones,
        show_golf_phones: form.show_golf_phones,
        footer_message: form.footer_message,
        company_phone: form.company_phone,
        company_mobile: form.company_mobile,
        golf_reservation_phone: form.golf_reservation_phone,
        golf_reservation_mobile: form.golf_reservation_mobile,
        special_notices: form.special_notices || null,
        reservation_notices: form.reservation_notices.filter(n => n.title.trim() && n.content.trim()),
        other_notices: form.other_notices,
        document_settings: form.document_settings,
        updated_at: new Date().toISOString(),
      };
      
      const { error: tourError } = await supabase
        .from("singsing_tours")
        .update(updateData)
        .eq("id", tourId);
        
      if (tourError) throw tourError;
      
      // 2. 삭제할 스텝진 처리
      if (deletedStaffIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("singsing_tour_staff")
          .delete()
          .in("id", deletedStaffIds);
          
        if (deleteError) throw deleteError;
      }
      
      // 3. 스텝진 업데이트/추가
      const validStaff = staff.filter(s => s.name.trim() !== "");
      for (let i = 0; i < validStaff.length; i++) {
        const staffMember = validStaff[i];
        const staffData = {
          tour_id: tourId,
          name: staffMember.name,
          phone: staffMember.phone,
          role: staffMember.role,
          display_order: i + 1
        };
        
        if (staffMember.id) {
          // 기존 스텝진 업데이트
          const { error } = await supabase
            .from("singsing_tour_staff")
            .update(staffData)
            .eq("id", staffMember.id);
            
          if (error) throw error;
        } else {
          // 새 스텝진 추가
          const { error } = await supabase
            .from("singsing_tour_staff")
            .insert([staffData]);
            
          if (error) throw error;
        }
      }
      
      router.push("/admin/tours");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-8">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">투어 수정</h2>
      
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
              <span className="font-medium">여행상품 선택</span>
              <select 
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                value={form.tour_product_id} 
                onChange={handleProductChange}
              >
                <option value="">선택</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.golf_course} ({product.hotel})
                  </option>
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
              <span className="font-medium">포함사항</span>
              <textarea name="includes" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.includes} onChange={handleChange} />
            </label>
            
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">불포함사항</span>
              <textarea name="excludes" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.excludes} onChange={handleChange} />
            </label>
            
            {/* 예약 안내사항 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">예약 안내사항</span>
                <button
                  type="button"
                  onClick={addReservationNotice}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              </div>
              
              {form.reservation_notices.map((notice, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="제목 (예: 티오프 시간)"
                      value={notice.title}
                      onChange={(e) => updateReservationNotice(idx, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeReservationNotice(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <textarea
                    placeholder="내용"
                    value={notice.content}
                    onChange={(e) => updateReservationNotice(idx, 'content', e.target.value)}
                    className="w-full px-3 py-2 border rounded resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
            
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">기타 안내문구 (일정표 하단)</span>
              <textarea name="other_notices" value={form.other_notices} onChange={handleChange} className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[60px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
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
            
            {staff.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                스텝진 정보가 없습니다. 추가 버튼을 눌러 추가해주세요.
              </div>
            ) : (
              staff.map((member, index) => (
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
                  
                  <button
                    type="button"
                    onClick={() => removeStaff(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* 문서 설정 탭 */}
        {activeTab === "document" && (
          <div className="space-y-6">
            {/* 문서 생성 옵션 */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                문서 생성 옵션
              </h3>
              <div className="grid grid-cols-2 gap-3 pl-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="document_settings.customer_schedule"
                    checked={form.document_settings.customer_schedule}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">고객용 일정표</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="document_settings.customer_boarding"
                    checked={form.document_settings.customer_boarding}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">고객용 탑승안내서</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="document_settings.staff_boarding"
                    checked={form.document_settings.staff_boarding}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">스탭용 탑승안내서</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="document_settings.room_assignment"
                    checked={form.document_settings.room_assignment}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">객실 배정표</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="document_settings.tee_time"
                    checked={form.document_settings.tee_time}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">티타임표</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="document_settings.simplified"
                    checked={form.document_settings.simplified}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">간편 일정표</span>
                </label>
              </div>
            </div>

            {/* 표시 옵션 */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
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
            
            {/* 투어별 특수 공지사항 */}
            <label className="flex flex-col gap-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">투어별 특수 공지사항</span>
              <textarea
                name="special_notices"
                value={form.special_notices}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[120px] bg-white dark:bg-gray-800"
                placeholder="이 투어만의 특별한 공지사항이 있다면 입력하세요 (선택사항)"
              />
              <span className="text-sm text-gray-500">라운딩 주의사항은 여행상품에서 관리됩니다</span>
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

            {/* 문서별 공지사항 관리 - 제거됨 */}
            <div className="border-t pt-6">
              <p className="text-gray-600">문서별 공지사항은 투어 관리 &gt; 일정 관리에서 설정할 수 있습니다.</p>
            </div>
          </div>
        )}
        
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        
        <div className="flex gap-2 mt-4">
          <button 
            type="submit" 
            className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-700 focus:bg-blue-700" 
            disabled={saving}
          >
            {saving ? "저장 중..." : "변경사항 저장"}
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

export default TourEditPage;