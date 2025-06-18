        <button
          type="button"
          className={`pb-2 px-1 font-medium ${activeTab === "marketing" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("marketing")}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          마케팅 콘텐츠
        </button>"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, X, Users, Phone, FileText, Settings, Info, Sparkles, Bell } from "lucide-react";
import MarketingContentManager from "@/components/admin/MarketingContentManager";
import SpecialNoticesManager from "@/components/admin/SpecialNoticesManager";

type StaffMember = {
  id?: string;
  name: string;
  phone: string;
  role: string;
  display_order?: number;
};

type TourForm = {
  title: string;
  start_date: string;
  end_date: string;
  tour_product_id: string;
  price: string;
  max_participants: string;
  current_participants?: string;
  marketing_participant_count?: string;
  is_closed?: boolean;
  closed_reason?: string;
  
  // 일정 관련 필드
  departure_location: string;
  itinerary: string;
  included_items: string;
  notes: string;
  
  // 문서 표시 옵션
  show_staff_info: boolean;
  show_footer_message: boolean;
  show_company_phone: boolean;
  show_golf_phones: boolean;
  
  // 푸터 및 연락처
  footer_message: string;
  company_phone: string;
  company_mobile: string; // 임시로 다시 추가
  golf_reservation_phone: string;
  golf_reservation_mobile: string;
  
  // 주의사항
  other_notices: string;
  document_settings: {
    customer_schedule: boolean;
    customer_boarding: boolean;
    staff_boarding: boolean;
    room_assignment: boolean;
    tee_time: boolean;
    simplified: boolean;
  };
  
  // 문서별 전화번호 표시 설정
  phone_display_settings: {
    customer_schedule: {
      show_company_phone: boolean;
      show_driver_phone: boolean;
      show_guide_phone: boolean;
      show_golf_phone: boolean;
    };
    customer_boarding: {
      show_company_phone: boolean;
      show_driver_phone: boolean;
      show_guide_phone: boolean;
    };
    staff_boarding: {
      show_company_phone: boolean;
      show_driver_phone: boolean;
      show_guide_phone: boolean;
      show_manager_phone: boolean;
    };
    room_assignment: {
      show_company_phone: boolean;
      show_driver_phone: boolean;
      show_guide_phone: boolean;
    };
    room_assignment_staff: {
      show_company_phone: boolean;
      show_driver_phone: boolean;
      show_guide_phone: boolean;
      show_manager_phone: boolean;
    };
    tee_time: {
      show_company_phone: boolean;
      show_golf_phone: boolean;
    };
    simplified: {
      show_company_phone: boolean;
    };
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
    price: "",
    max_participants: "",
    
    // 일정 관련 필드
    departure_location: "",
    itinerary: "",
    included_items: "",
    notes: "",
    
    // 문서 표시 옵션 (기본값)
    show_staff_info: true,
    show_footer_message: true,
    show_company_phone: true,
    show_golf_phones: true,
    
    // 푸터 및 연락처 (기본값)
    footer_message: "♡ 즐거운 하루 되시길 바랍니다. ♡",
    company_phone: "031-215-3990",
    company_mobile: "010-3332-9020", // 임시 기본값
    golf_reservation_phone: "",
    golf_reservation_mobile: "",
    
    // 기타 안내문구
    other_notices: "※ 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.",
    document_settings: {
      customer_schedule: true,
      customer_boarding: true,
      staff_boarding: true,
      room_assignment: true,
      tee_time: true,
      simplified: true
    },
    
    // 문서별 전화번호 표시 설정 (기본값)
    phone_display_settings: {
      customer_schedule: {
        show_company_phone: true,
        show_driver_phone: false,
        show_guide_phone: false,
        show_golf_phone: false
      },
      customer_boarding: {
        show_company_phone: true,
        show_driver_phone: true,
        show_guide_phone: false
      },
      staff_boarding: {
        show_company_phone: true,
        show_driver_phone: true,
        show_guide_phone: true,
        show_manager_phone: true
      },
      room_assignment: {
        show_company_phone: true,
        show_driver_phone: true,
        show_guide_phone: false
      },
      room_assignment_staff: {
        show_company_phone: true,
        show_driver_phone: true,
        show_guide_phone: true,
        show_manager_phone: true
      },
      tee_time: {
        show_company_phone: true,
        show_golf_phone: true
      },
      simplified: {
        show_company_phone: true
      }
    }
  });
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [deletedStaffIds, setDeletedStaffIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"basic" | "staff" | "document" | "marketing" | "notices">("basic");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [specialNotices, setSpecialNotices] = useState<any[]>([]);

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
        // special_notices 초기화
        setSpecialNotices(tourData.special_notices || []);
        
        setForm({
          title: tourData.title || "",
          start_date: tourData.start_date ? tourData.start_date.substring(0, 10) : "",
          end_date: tourData.end_date ? tourData.end_date.substring(0, 10) : "",
          tour_product_id: tourData.tour_product_id || "",
          price: tourData.price?.toString() || "",
          max_participants: tourData.max_participants?.toString() || "",
          current_participants: tourData.current_participants?.toString() || "0",
          marketing_participant_count: tourData.marketing_participant_count?.toString() || tourData.current_participants?.toString() || "0",
          is_closed: tourData.is_closed || false,
          closed_reason: tourData.closed_reason || "",
          
          // 일정 관련 필드
          departure_location: tourData.departure_location || "",
          itinerary: tourData.itinerary || "",
          included_items: tourData.included_items || "",
          notes: tourData.notes || "",
          
          // 문서 표시 옵션
          show_staff_info: tourData.show_staff_info ?? true,
          show_footer_message: tourData.show_footer_message ?? true,
          show_company_phone: tourData.show_company_phone ?? true,
          show_golf_phones: tourData.show_golf_phones ?? true,
          
          // 푸터 및 연락처
          footer_message: tourData.footer_message || "♡ 즐거운 하루 되시길 바랍니다. ♡",
          company_phone: tourData.company_phone || "031-215-3990",
          company_mobile: tourData.company_mobile || "010-3332-9020", // 임시
          golf_reservation_phone: tourData.golf_reservation_phone || "",
          golf_reservation_mobile: tourData.golf_reservation_mobile || "",
          
          // 기타 안내문구
          other_notices: tourData.other_notices || "※ 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.",
          document_settings: tourData.document_settings || {
            customer_schedule: true,
            customer_boarding: true,
            staff_boarding: true,
            room_assignment: true,
            tee_time: true,
            simplified: true
          },
          
          // 전화번호 표시 설정
          phone_display_settings: tourData.phone_display_settings || {
            customer_schedule: {
              show_company_phone: true,
              show_driver_phone: false,
              show_guide_phone: false,
              show_golf_phone: false
            },
            customer_boarding: {
              show_company_phone: true,
              show_driver_phone: true,
              show_guide_phone: false
            },
            staff_boarding: {
              show_company_phone: true,
              show_driver_phone: true,
              show_guide_phone: true,
              show_manager_phone: true
            },
            room_assignment: {
              show_company_phone: true,
              show_driver_phone: true,
              show_guide_phone: false
            },
            room_assignment_staff: {
              show_company_phone: true,
              show_driver_phone: true,
              show_guide_phone: true,
              show_manager_phone: true
            },
            tee_time: {
              show_company_phone: true,
              show_golf_phone: true
            },
            simplified: {
              show_company_phone: true
            }
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
      
      // 선택된 상품 정보 설정
      if (tourData?.tour_product_id && productsData) {
        const product = productsData.find(p => p.id === tourData.tour_product_id);
        setSelectedProduct(product);
      }
      
      // 실제 참가자 수 계산 (각 참가자는 1명으로 계산)
      const { count: participantCount } = await supabase
        .from("singsing_participants")
        .select("id", { count: 'exact', head: true })
        .eq("tour_id", tourId);
        
      if (participantCount !== null) {
        setForm(prev => ({
          ...prev,
          current_participants: participantCount.toString()
        }));
      }
      
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
      } else if (name.startsWith("phone_display_settings.")) {
        const parts = name.split(".");
        const docType = parts[1];
        const phoneType = parts[2];
        setForm({
          ...form,
          phone_display_settings: {
            ...form.phone_display_settings,
            [docType]: {
              ...form.phone_display_settings[docType as keyof typeof form.phone_display_settings],
              [phoneType]: checked
            }
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
    const product = products.find((p) => p.id === selectedId);
    setSelectedProduct(product);
    setForm({
      ...form,
      tour_product_id: selectedId
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
    const staffToRemove = staff[index];
    if (staffToRemove.id) {
      setDeletedStaffIds([...deletedStaffIds, staffToRemove.id]);
    }
    setStaff(staff.filter((_, i) => i !== index));
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
        price: form.price ? Number(form.price) : null,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        marketing_participant_count: form.marketing_participant_count ? Number(form.marketing_participant_count) : null,
        is_closed: form.is_closed || false,
        closed_reason: form.is_closed ? form.closed_reason : null,
        closed_at: form.is_closed ? new Date().toISOString() : null,
        
        // 특별공지사항 추가
        special_notices: specialNotices,
        
        // 일정 관련 필드
        departure_location: form.departure_location,
        itinerary: form.itinerary,
        included_items: form.included_items,
        notes: form.notes,
        
        show_staff_info: form.show_staff_info,
        show_footer_message: form.show_footer_message,
        show_company_phone: form.show_company_phone,
        show_golf_phones: form.show_golf_phones,
        footer_message: form.footer_message,
        company_phone: form.company_phone,
        company_mobile: form.company_mobile || "010-3332-9020", // 임시
        golf_reservation_phone: form.golf_reservation_phone,
        golf_reservation_mobile: form.golf_reservation_mobile,
        other_notices: form.other_notices,
        document_settings: form.document_settings,
        phone_display_settings: form.phone_display_settings, // 추가
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
        <button
          type="button"
          className={`pb-2 px-1 font-medium ${activeTab === "marketing" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("marketing")}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          마케팅 콘텐츠
        </button>
        <button
          type="button"
          className={`pb-2 px-1 font-medium ${activeTab === "notices" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("notices")}
        >
          <Bell className="w-4 h-4 inline mr-1" />
          긴급공지
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
                required
              >
                <option value="">선택</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.golf_course} ({product.hotel})
                  </option>
                ))}
              </select>
            </label>
            
            {/* 선택된 여행상품 정보 미리보기 */}
            {selectedProduct && (
              <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-gray-700">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  선택된 여행상품 정보
                </h4>
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium">골프장:</span> {selectedProduct.golf_course}</p>
                  <p><span className="font-medium">숙소:</span> {selectedProduct.hotel}</p>
                  {selectedProduct.course && (
                    <p><span className="font-medium">코스:</span> {selectedProduct.course}</p>
                  )}
                  {selectedProduct.includes && (
                    <div>
                      <span className="font-medium">포함사항:</span>
                      <p className="ml-4 mt-1">{selectedProduct.includes}</p>
                    </div>
                  )}
                  {selectedProduct.excludes && (
                    <div>
                      <span className="font-medium">불포함사항:</span>
                      <p className="ml-4 mt-1">{selectedProduct.excludes}</p>
                    </div>
                  )}
                  {selectedProduct.reservation_notices && selectedProduct.reservation_notices.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="font-medium">예약 안내사항:</span>
                      <div className="ml-4 mt-1 space-y-1">
                        {selectedProduct.reservation_notices.map((notice: any, idx: number) => (
                          <div key={idx}>
                            <span className="font-medium text-xs">{notice.title}:</span>
                            <span className="text-xs ml-1">{notice.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <label className="flex flex-col gap-1 flex-1 text-gray-700 dark:text-gray-300">
                <span className="font-medium">투어 가격</span>
                <input name="price" type="number" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.price} onChange={handleChange} required />
                <span className="text-xs text-gray-500">여행상품 가격과 다를 경우 입력</span>
              </label>
              <label className="flex flex-col gap-1 flex-1 text-gray-700 dark:text-gray-300">
                <span className="font-medium">최대 인원</span>
                <input name="max_participants" type="number" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={form.max_participants} onChange={handleChange} required />
              </label>
            </div>
            
            {/* 참가자 수 및 마감 설정 */}
            <div className="border border-yellow-200 bg-yellow-50 dark:bg-gray-800 dark:border-yellow-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                참가자 수 관리
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">실제 참가자</span>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {form.current_participants || '0'}명
                      <span className="text-sm font-normal text-gray-500"> / {form.max_participants}명</span>
                    </p>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">마케팅 표시 인원</span>
                    <input
                      name="marketing_participant_count"
                      type="number"
                      value={form.marketing_participant_count || ''}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
                      placeholder="실제 참가자 수와 다르게 표시할 수 있습니다"
                    />
                  </label>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">💡 마케팅 표시 인원 사용법</p>
                  <p className="text-xs">고객용 페이지에서 참가자 수를 실제보다 많거나 적게 표시하여 마케팅 효과를 높일 수 있습니다.</p>
                  <p className="text-xs mt-1">예: 실제 16명 → 마케팅 표시 20명 (인기 있어 보이게)</p>
                  <p className="text-xs">예: 실제 2명 → 마케팅 표시 8명 (최소 인원 충족 보이게)</p>
                </div>
                <div className="border-t pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">투어 마감 설정</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_closed"
                        checked={form.is_closed || false}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-red-600">투어 마감</span>
                    </label>
                  </div>
                  {form.is_closed && (
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600">마감 사유</span>
                      <input
                        name="closed_reason"
                        type="text"
                        value={form.closed_reason || ''}
                        onChange={handleChange}
                        placeholder="예: 조기 마감, 취소, 연기 등"
                        className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            
            {/* 일정 관련 필드 추가 */}
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">출발 장소</span>
              <input 
                name="departure_location" 
                type="text" 
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                value={form.departure_location} 
                onChange={handleChange} 
                placeholder="예: 서울 강남 신논현역 9번 출구"
              />
            </label>
            
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">상세 일정</span>
              <textarea 
                name="itinerary" 
                value={form.itinerary} 
                onChange={handleChange} 
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                placeholder="1일차: \n- 06:00 출발\n- 12:00 골프장 도착\n..." 
              />
            </label>
            
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">포함 사항</span>
              <textarea 
                name="included_items" 
                value={form.included_items} 
                onChange={handleChange} 
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[80px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                placeholder="- 왕복 리무진 버스\n- 숙박 (2인 1실)\n- 식사\n- 그린피..." 
              />
            </label>
            
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">기타 안내 사항</span>
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={handleChange} 
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 min-h-[60px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                placeholder="추가 안내 사항을 입력하세요" 
              />
            </label>
            
            <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">일정표 하단 안내문구</span>
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
        
        {/* 마케팅 콘텐츠 탭 */}
        {activeTab === "marketing" && (
          <div className="-mx-8 -my-4">
            <MarketingContentManager
              tourId={tourId}
              tourProductId={form.tour_product_id}
              contentType="tour_specific"
            />
          </div>
        )}
        
        {/* 긴급공지사항 탭 */}
        {activeTab === "notices" && (
          <div className="-mx-8 -my-4">
            <SpecialNoticesManager
              tourId={tourId}
              notices={specialNotices}
              onUpdate={setSpecialNotices}
              tourStartDate={form.start_date}
            />
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
                    name="show_company_phone"
                    checked={form.show_company_phone}
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
                {/* 회사 업무핸드폰은 설정 관리에서 관리
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
                */}
                <div className="text-sm text-gray-600">
                  <p>업무 핸드폰은 설정 관리에서 통합 관리됩니다.</p>
                  <p className="text-xs text-gray-500 mt-1">설정 → 담당자 직통 핸드폰</p>
                </div>
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

            {/* 문서별 전화번호 표시 설정 */}
            <div className="space-y-3 border-t pt-6">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                문서별 전화번호 표시 설정
              </h3>
              
              {/* 고객용 일정표 */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">고객용 일정표</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.customer_schedule.show_company_phone"
                      checked={form.phone_display_settings.customer_schedule.show_company_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>회사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.customer_schedule.show_driver_phone"
                      checked={form.phone_display_settings.customer_schedule.show_driver_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>기사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.customer_schedule.show_guide_phone"
                      checked={form.phone_display_settings.customer_schedule.show_guide_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>가이드 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.customer_schedule.show_golf_phone"
                      checked={form.phone_display_settings.customer_schedule.show_golf_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>골프장 전화번호</span>
                  </label>
                </div>
              </div>
              
              {/* 고객용 탑승안내 */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">고객용 탑승안내</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.customer_boarding.show_company_phone"
                      checked={form.phone_display_settings.customer_boarding.show_company_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>회사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.customer_boarding.show_driver_phone"
                      checked={form.phone_display_settings.customer_boarding.show_driver_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>기사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.customer_boarding.show_guide_phone"
                      checked={form.phone_display_settings.customer_boarding.show_guide_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>가이드 전화번호</span>
                  </label>
                </div>
              </div>
              
              {/* 스탭용 탑승안내 */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">스탭용 탑승안내</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.staff_boarding.show_company_phone"
                      checked={form.phone_display_settings.staff_boarding.show_company_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>회사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.staff_boarding.show_driver_phone"
                      checked={form.phone_display_settings.staff_boarding.show_driver_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>기사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.staff_boarding.show_guide_phone"
                      checked={form.phone_display_settings.staff_boarding.show_guide_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>가이드 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.staff_boarding.show_manager_phone"
                      checked={form.phone_display_settings.staff_boarding.show_manager_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>매니저 전화번호</span>
                  </label>
                </div>
              </div>
              
              {/* 객실 배정표 (고객용) */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">객실 배정표 (고객용)</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.room_assignment.show_company_phone"
                      checked={form.phone_display_settings.room_assignment.show_company_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>회사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.room_assignment.show_driver_phone"
                      checked={form.phone_display_settings.room_assignment.show_driver_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>기사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.room_assignment.show_guide_phone"
                      checked={form.phone_display_settings.room_assignment.show_guide_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>가이드 전화번호</span>
                  </label>
                </div>
              </div>
              
              {/* 객실 배정표 (스탭용) */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">객실 배정표 (스탭용)</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.room_assignment_staff.show_company_phone"
                      checked={form.phone_display_settings.room_assignment_staff.show_company_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>회사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.room_assignment_staff.show_driver_phone"
                      checked={form.phone_display_settings.room_assignment_staff.show_driver_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>기사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.room_assignment_staff.show_guide_phone"
                      checked={form.phone_display_settings.room_assignment_staff.show_guide_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>가이드 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.room_assignment_staff.show_manager_phone"
                      checked={form.phone_display_settings.room_assignment_staff.show_manager_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>매니저 전화번호</span>
                  </label>
                </div>
              </div>
              
              {/* 티타임표 */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">티타임표</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.tee_time.show_company_phone"
                      checked={form.phone_display_settings.tee_time.show_company_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>회사 전화번호</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.tee_time.show_golf_phone"
                      checked={form.phone_display_settings.tee_time.show_golf_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>골프장 전화번호</span>
                  </label>
                </div>
              </div>
              
              {/* 간편 일정표 */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">간편 일정표</h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="phone_display_settings.simplified.show_company_phone"
                      checked={form.phone_display_settings.simplified.show_company_phone}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>회사 전화번호</span>
                  </label>
                </div>
              </div>
            </div>
            
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