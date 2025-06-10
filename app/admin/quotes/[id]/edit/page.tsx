"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
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
  Eye,
  Save
} from "lucide-react";
import Link from "next/link";

interface TourProduct {
  id: string;
  name: string;
  golf_course: string | null;
  hotel: string | null;
  courses: string[] | null;
}

export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tourProducts, setTourProducts] = useState<TourProduct[]>([]);
  
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
    quote_status: "draft" as 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected',
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
    fetchQuoteData();
  }, [quoteId]);

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

  const fetchQuoteData = async () => {
    try {
      const { data, error } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", quoteId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const quoteData = typeof data.quote_data === 'string' 
          ? JSON.parse(data.quote_data) 
          : data.quote_data;
          
        setFormData({
          title: data.title,
          tour_product_id: data.tour_product_id || "",
          start_date: data.start_date,
          end_date: data.end_date,
          price: data.price,
          max_participants: data.max_participants,
          customer_name: data.customer_name || "",
          customer_phone: data.customer_phone || "",
          customer_email: "",
          quote_expires_at: data.quote_expires_at || "",
          quote_status: data.quote_status || "draft",
          quote_notes: data.quote_notes || "",
          quote_data: quoteData || {
            participants: {
              estimated_count: data.max_participants,
              group_name: "",
              leader_name: "",
              leader_phone: ""
            },
            includeExclude: {
              includes: ["왕복 전용버스", "그린피 및 카트비", "숙박", "조식"],
              excludes: ["개인 경비", "캐디피", "중식 및 석식", "여행자 보험"]
            },
            schedules: [],
            additional_options: [],
            special_requests: ""
          }
        });
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      alert("견적서를 불러오는 중 오류가 발생했습니다.");
      router.push("/admin/quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = async (productId: string) => {
    setFormData(prev => ({ ...prev, tour_product_id: productId }));
    
    if (productId) {
      const product = tourProducts.find(p => p.id === productId);
      if (product) {
        setFormData(prev => ({
          ...prev,
          title: `${product.name} 견적서`
        }));
      }
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
    setSaving(true);

    try {
      const { error } = await supabase
        .from("singsing_tours")
        .update({
          title: formData.title,
          tour_product_id: formData.tour_product_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          price: formData.price,
          max_participants: formData.max_participants,
          customer_name: formData.customer_name || null,
          customer_phone: formData.customer_phone || null,
          quote_expires_at: formData.quote_expires_at,
          quote_status: formData.quote_status,
          quote_data: formData.quote_data,
          quote_notes: formData.quote_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) throw error;

      alert("견적서가 저장되었습니다.");
      router.push("/admin/quotes");
    } catch (error) {
      console.error("Error updating quote:", error);
      alert("견적서 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/quote/${quoteId}`;
    navigator.clipboard.writeText(url);
    alert('견적서 링크가 복사되었습니다.');
  };

  const duration = calculateDays();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">견적서 수정</h1>
              <p className="text-gray-600 mt-1">견적서 정보를 수정합니다.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/quote/${quoteId}`, '_blank')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                링크 복사
              </button>
            </div>
          </div>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  견적 상태
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.quote_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, quote_status: e.target.value as any }))}
                >
                  <option value="draft">작성중</option>
                  <option value="sent">발송됨</option>
                  <option value="viewed">열람됨</option>
                  <option value="accepted">수락됨</option>
                  <option value="rejected">거절됨</option>
                </select>
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
            <Link
              href="/admin/quotes"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}