"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Clock,
  CheckCircle,
  Info,
  Plus,
  X,
  Copy,
  Eye
} from "lucide-react";
import Link from "next/link";
import { generatePublicUrl } from "@/utils/publicLink";

interface TourProduct {
  id: string;
  name: string;
  golf_course: string | null;
  hotel: string | null;
  courses: string[] | null;
  included_items?: string | null;
  excluded_items?: string | null;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tourProducts, setTourProducts] = useState<TourProduct[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    // 기본 정보
    title: "",
    tour_product_id: "",
    start_date: "",
    end_date: "",
    price: 0,
    max_participants: 20,
    
    // 고객 정보
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    
    // 견적 정보
    quote_expires_at: "",
    quote_notes: "",
    
    // 견적 상세 데이터
    quote_data: {
      participants: {
        estimated_count: 20,
        group_name: "",
        leader_name: "",
        leader_phone: ""
      },
      includeExclude: {
        includes: [
          "왕복 전용버스",
          "그린피 및 카트비",
          "숙박",
          "조식"
        ],
        excludes: [
          "개인 경비",
          "캐디피",
          "중식 및 석식",
          "여행자 보험"
        ]
      },
      schedules: [] as any[],
      additional_options: [] as string[],
      special_requests: ""
    }
  });

  useEffect(() => {
    fetchTourProducts();
    // 기본 만료일을 7일 후로 설정
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    setFormData(prev => ({
      ...prev,
      quote_expires_at: expiryDate.toISOString().split('T')[0]
    }));
  }, []);

  const fetchTourProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("tour_products")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setTourProducts(data || []);
    } catch (error) {
      console.error("Error fetching tour products:", error);
    }
  };

  const handleProductChange = async (productId: string) => {
    setFormData(prev => ({ ...prev, tour_product_id: productId }));
    
    if (productId) {
      const product = tourProducts.find(p => p.id === productId);
      if (product) {
        // 포함 사항 처리 - 쉼표로 구분하거나, 줄바꿈으로 구분된 경우도 처리
        let includes: string[] = [];
        if (product.included_items) {
          // 쉼표 또는 줄바꿈으로 분리
          includes = product.included_items
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
        
        // 포함 사항이 없으면 기본값 사용
        if (includes.length === 0) {
          includes = [
            "왕복 전용버스",
            "그린피 및 카트비",
            "숙박",
            "조식"
          ];
        }
        
        // 불포함 사항 처리
        let excludes: string[] = [];
        if (product.excluded_items) {
          excludes = product.excluded_items
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
        
        // 불포함 사항이 없으면 기본값 사용
        if (excludes.length === 0) {
          excludes = [
            "개인 경비",
            "캐디피",
            "중식 및 석식",
            "여행자 보험"
          ];
        }
        
        setFormData(prev => ({
          ...prev,
          title: `${product.name} 견적서`,
          quote_data: {
            ...prev.quote_data,
            includeExclude: {
              includes,
              excludes
            }
          }
        }));
      }
    } else {
      // 상품 선택 해제 시 기본값으로 복원
      setFormData(prev => ({
        ...prev,
        title: "",
        quote_data: {
          ...prev.quote_data,
          includeExclude: {
            includes: [
              "왕복 전용버스",
              "그린피 및 카트비",
              "숙박",
              "조식"
            ],
            excludes: [
              "개인 경비",
              "캐디피",
              "중식 및 석식",
              "여행자 보험"
            ]
          }
        }
      }));
    }
  };

  const handleIncludeAdd = () => {
    const newItem = prompt("포함 사항을 입력하세요:");
    if (newItem) {
      setFormData(prev => ({
        ...prev,
        quote_data: {
          ...prev.quote_data,
          includeExclude: {
            ...prev.quote_data.includeExclude,
            includes: [...prev.quote_data.includeExclude.includes, newItem]
          }
        }
      }));
    }
  };

  const handleExcludeAdd = () => {
    const newItem = prompt("불포함 사항을 입력하세요:");
    if (newItem) {
      setFormData(prev => ({
        ...prev,
        quote_data: {
          ...prev.quote_data,
          includeExclude: {
            ...prev.quote_data.includeExclude,
            excludes: [...prev.quote_data.includeExclude.excludes, newItem]
          }
        }
      }));
    }
  };

  const removeInclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quote_data: {
        ...prev.quote_data,
        includeExclude: {
          ...prev.quote_data.includeExclude,
          includes: prev.quote_data.includeExclude.includes.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const removeExclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quote_data: {
        ...prev.quote_data,
        includeExclude: {
          ...prev.quote_data.includeExclude,
          excludes: prev.quote_data.includeExclude.excludes.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return { nights: 0, days: 0 };
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { nights: days - 1, days };
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 견적서 데이터로 투어 생성
      const { data, error } = await supabase
        .from("singsing_tours")
        .insert({
          title: formData.title,
          tour_product_id: formData.tour_product_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          price: formData.price,
          max_participants: formData.max_participants,
          customer_name: formData.customer_name || null,
          customer_phone: formData.customer_phone || null,
          quote_expires_at: formData.quote_expires_at,
          // quote_status: formData.quote_status, // 데이터베이스에 해당 컴럼이 없음
          quote_data: formData.quote_data,
          quote_notes: formData.quote_notes || null
        })
        .select()
        .single();

      if (error) throw error;

      // 공개 링크 생성
      if (data) {
        const publicUrl = generatePublicUrl();
        const { error: linkError } = await supabase
          .from("public_document_links")
          .insert({
            tour_id: data.id,
            document_type: 'quote',
            public_url: publicUrl,
            expires_at: formData.quote_expires_at,
            is_active: true
          });

        if (linkError) {
          console.error("링크 생성 오류:", linkError);
        }
      }

      alert("견적서가 생성되었습니다.");
      router.push("/admin/quotes");
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("견적서 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // 미리보기를 위한 임시 데이터 저장
    localStorage.setItem('quotePreviewData', JSON.stringify(formData));
    setPreviewOpen(true);
  };

  const duration = calculateDays();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            견적서 목록으로
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">새 견적서 작성</h1>
          <p className="text-gray-600 mt-1">고객에게 발송할 견적서를 작성합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              기본 정보
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  투어 상품 선택
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.tour_product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                >
                  <option value="">직접 입력</option>
                  {tourProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.golf_course})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  견적서 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 2025년 6월 제주도 골프투어 견적서"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출발일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  도착일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  min={formData.start_date}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1인 요금 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="900000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예상 인원
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.quote_data.participants.estimated_count}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    max_participants: parseInt(e.target.value) || 20,
                    quote_data: {
                      ...prev.quote_data,
                      participants: {
                        ...prev.quote_data.participants,
                        estimated_count: parseInt(e.target.value) || 20
                      }
                    }
                  }))}
                />
              </div>
            </div>

            {duration.days > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>{duration.nights}박 {duration.days}일</strong> 일정 • 
                  총 예상 금액: <strong>{(formData.price * formData.quote_data.participants.estimated_count).toLocaleString()}원</strong>
                </p>
              </div>
            )}
          </div>

          {/* 고객 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              고객 정보
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  고객명
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="홍길동"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="010-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  단체명
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.quote_data.participants.group_name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    quote_data: {
                      ...prev.quote_data,
                      participants: {
                        ...prev.quote_data.participants,
                        group_name: e.target.value
                      }
                    }
                  }))}
                  placeholder="○○ 동호회"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  총무
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.quote_data.participants.leader_name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    quote_data: {
                      ...prev.quote_data,
                      participants: {
                        ...prev.quote_data.participants,
                        leader_name: e.target.value
                      }
                    }
                  }))}
                  placeholder="김총무"
                />
              </div>
            </div>
          </div>

          {/* 포함/불포함 사항 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              포함/불포함 사항
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">포함 사항</h3>
                  <button
                    type="button"
                    onClick={handleIncludeAdd}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 inline" /> 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.quote_data.includeExclude.includes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeInclude(index)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">불포함 사항</h3>
                  <button
                    type="button"
                    onClick={handleExcludeAdd}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 inline" /> 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.quote_data.includeExclude.excludes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeExclude(index)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 견적 설정 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              견적 설정
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  견적 유효기간 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.quote_expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, quote_expires_at: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              

            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                추가 안내사항
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={formData.quote_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, quote_notes: e.target.value }))}
                placeholder="견적서에 포함될 추가 안내사항을 입력하세요."
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              미리보기
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "생성 중..." : "견적서 생성"}
            </button>
          </div>
        </form>
      </div>

      {/* 미리보기 모달 */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">견적서 미리보기</h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ height: 'calc(90vh - 60px)' }}>
              <iframe
                src="/quote/preview"
                className="w-full h-full"
                style={{ minHeight: '800px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}