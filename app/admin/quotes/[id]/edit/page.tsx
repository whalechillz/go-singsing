"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import React from "react";
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
  Save,
  Share2,
  MapPin,
  Trash2,
  Route,
  Navigation,
  Coffee,
  Utensils,
  Camera,
  Bus,
  ChevronRight,
  ChevronDown,
  Edit2,
  ShoppingCart,
  MoreHorizontal,
  Activity
} from "lucide-react";
import Link from "next/link";
import { generatePublicUrl, getPublicLinkUrl, getInternalQuoteUrl } from "@/utils/publicLink";

interface TourProduct {
  id: string;
  name: string;
  golf_course: string | null;
  hotel: string | null;
  courses: string[] | null;
  included_items?: string | null;
  excluded_items?: string | null;
}

interface Attraction {
  id: string;
  name: string;
  type: string;
  category: string;
  created_at?: string;
  duration?: number;
}

interface TouristAttraction {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
  address?: string;
  description?: string;
  image_url?: string;
  features?: string[];
  is_active: boolean;
  boarding_info?: string;
}

interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  attraction_id?: string;
  attraction?: Attraction | TouristAttraction;
  spot_id?: string;
  spot?: TouristAttraction;
  duration?: string;
  note?: string;
}

interface DaySchedule {
  day: number;
  date: string;
  title: string;
  items: ScheduleItem[];
}

// 카테고리 설정
const categoryConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string;
}> = {
  'boarding': { label: '탑승지', icon: Bus, color: 'blue' },
  'tourist_spot': { label: '관광명소', icon: Camera, color: 'blue' },
  'rest_area': { label: '휴게소', icon: Coffee, color: 'gray' },
  'restaurant': { label: '맛집', icon: Utensils, color: 'orange' },
  'shopping': { label: '쇼핑', icon: ShoppingCart, color: 'purple' },
  'activity': { label: '액티비티', icon: Activity, color: 'green' },
  'mart': { label: '마트', icon: ShoppingCart, color: 'indigo' },
  'golf_round': { label: '골프 라운드', icon: Activity, color: 'emerald' },
  'club_meal': { label: '클럽식', icon: Utensils, color: 'rose' },
  'others': { label: '기타', icon: MoreHorizontal, color: 'slate' }
};

export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tourProducts, setTourProducts] = useState<TourProduct[]>([]);
  const [documentLink, setDocumentLink] = useState<any>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [touristAttractions, setTouristAttractions] = useState<TouristAttraction[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<{dayIndex: number, itemIndex: number, item: ScheduleItem} | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule'>('basic');
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  
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
      schedules: [] as DaySchedule[],
      additional_options: [] as string[],
      special_requests: ""
    }
  });

  useEffect(() => {
    fetchTourProducts();
    fetchQuoteData();
    fetchAttractions();
    fetchTouristAttractions();
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

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error("Error fetching attractions:", error);
    }
  };

  const fetchTouristAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from("tourist_attractions")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      setTouristAttractions(data || []);
    } catch (error) {
      console.error("Error fetching tourist attractions:", error);
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
      
      // 공개 링크 정보 가져오기
      const { data: linkData } = await supabase
        .from("public_document_links")
        .select("*")
        .eq("tour_id", quoteId)
        .eq("document_type", "quote")
        .single();
      
      if (linkData) {
        setDocumentLink(linkData);
      }
      
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
        
        // 일정이 있으면 자동으로 일정 탭 확장
        if (quoteData?.schedules?.length > 0) {
          setExpandedDays(quoteData.schedules.map((_: any, index: number) => index));
        }
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

  // 일정 관련 함수들
  const initializeSchedules = () => {
    if (!formData.start_date || !formData.end_date) return;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const schedules: DaySchedule[] = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      schedules.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        title: `${i + 1}일차`,
        items: []
      });
    }
    
    setFormData(prev => ({
      ...prev,
      quote_data: {
        ...prev.quote_data,
        schedules
      }
    }));
    
    // 모든 일정을 확장
    setExpandedDays(schedules.map((_, index) => index));
  };

  const addScheduleItem = (dayIndex: number, item: TouristAttraction | Attraction) => {
    const newItem: ScheduleItem = {
      time: "09:00",
      title: item.name,
      spot_id: 'id' in item ? item.id : undefined,
      spot: 'category' in item ? item : undefined,
      attraction_id: 'type' in item ? item.id : undefined,
      attraction: 'type' in item ? item : undefined
    };
    
    setFormData(prev => {
      const newSchedules = [...prev.quote_data.schedules];
      if (!newSchedules[dayIndex].items) {
        newSchedules[dayIndex].items = [];
      }
      newSchedules[dayIndex].items.push(newItem);
      
      return {
        ...prev,
        quote_data: {
          ...prev.quote_data,
          schedules: newSchedules
        }
      };
    });
  };

  const removeScheduleItem = (dayIndex: number, itemIndex: number) => {
    setFormData(prev => {
      const newSchedules = [...prev.quote_data.schedules];
      newSchedules[dayIndex].items.splice(itemIndex, 1);
      
      return {
        ...prev,
        quote_data: {
          ...prev.quote_data,
          schedules: newSchedules
        }
      };
    });
  };

  const updateScheduleItem = (dayIndex: number, itemIndex: number, updates: Partial<ScheduleItem>) => {
    setFormData(prev => {
      const newSchedules = [...prev.quote_data.schedules];
      newSchedules[dayIndex].items[itemIndex] = {
        ...newSchedules[dayIndex].items[itemIndex],
        ...updates
      };
      
      return {
        ...prev,
        quote_data: {
          ...prev.quote_data,
          schedules: newSchedules
        }
      };
    });
  };

  const moveScheduleItem = (dayIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const newSchedules = [...prev.quote_data.schedules];
      const items = [...newSchedules[dayIndex].items];
      const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      
      // Swap items
      [items[itemIndex], items[targetIndex]] = [items[targetIndex], items[itemIndex]];
      newSchedules[dayIndex].items = items;
      
      return {
        ...prev,
        quote_data: {
          ...prev.quote_data,
          schedules: newSchedules
        }
      };
    });
  };

  const toggleDayExpansion = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
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
          quote_data: formData.quote_data,
          quote_notes: formData.quote_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) throw error;

      // 공개 링크가 있는 경우 만료일 업데이트
      if (documentLink) {
        await supabase
          .from("public_document_links")
          .update({ expires_at: formData.quote_expires_at })
          .eq("id", documentLink.id);
      }

      alert("견적서가 저장되었습니다.");
      router.push("/admin/quotes");
    } catch (error) {
      console.error("Error updating quote:", error);
      alert("견적서 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePublicLink = async () => {
    try {
      const publicUrl = generatePublicUrl();
      const { data, error } = await supabase
        .from("public_document_links")
        .insert({
          tour_id: quoteId,
          document_type: 'quote',
          public_url: publicUrl,
          expires_at: formData.quote_expires_at,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setDocumentLink(data);
        alert('공개 링크가 생성되었습니다.');
      }
    } catch (error) {
      console.error("Error creating public link:", error);
      alert('공개 링크 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCopyLink = (isPublicLink: boolean = false) => {
    let url;
    if (isPublicLink && documentLink?.public_url) {
      // 공개 링크 (/q/ 경로 사용 - 견적서)
      url = getPublicLinkUrl(documentLink.public_url, true);
    } else {
      // 일반 공유 링크
      url = getInternalQuoteUrl(quoteId);
    }
    navigator.clipboard.writeText(url);
    alert(isPublicLink ? '고객용 공개 링크가 복사되었습니다.' : '내부용 링크가 복사되었습니다.');
  };

  const getIconForItem = (item: ScheduleItem) => {
    const category = item.spot?.category || item.attraction?.category || 'others';
    const Icon = categoryConfig[category]?.icon || MoreHorizontal;
    
    // 정적 클래스 맵핑
    const colorClasses: Record<string, string> = {
      'blue': 'text-blue-500',
      'gray': 'text-gray-500',
      'orange': 'text-orange-500',
      'purple': 'text-purple-500',
      'green': 'text-green-500',
      'indigo': 'text-indigo-500',
      'emerald': 'text-emerald-500',
      'rose': 'text-rose-500',
      'slate': 'text-slate-500'
    };
    
    const colorClass = colorClasses[categoryConfig[category]?.color || 'gray'] || 'text-gray-500';
    return <Icon className={`w-4 h-4 ${colorClass}`} />;
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
      <div className="max-w-6xl mx-auto p-6">
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
              {!documentLink && (
                <button
                  onClick={handleCreatePublicLink}
                  className="px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  공개 링크 생성
                </button>
              )}

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
              <button
                onClick={() => handleCopyLink(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                title="내부 관리용 링크 (ID 노출)"
              >
                <Share2 className="w-4 h-4" />
                내부 링크 복사
              </button>
              {documentLink && (
                <button
                  onClick={() => handleCopyLink(true)}
                  className="px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                  title="고객에게 전달하는 보안 링크 (만료일 설정 가능)"
                >
                  <Copy className="w-4 h-4" />
                  고객용 공개 링크 복사
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              기본 정보
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              일정 관리
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* 공개 링크 정보 */}
              {documentLink && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-gray-600" />
                    공개 링크 정보
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">공개 링크</p>
                          <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200">
                            {window.location.origin}/q/{documentLink.public_url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(true)}
                          className="ml-4 p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="공개 링크 복사"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">상태</label>
                        <p className="font-medium">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            documentLink.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {documentLink.is_active ? '활성' : '비활성'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">생성일</label>
                        <p className="font-medium">
                          {new Date(documentLink.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">만료일</label>
                        <p className="font-medium">
                          {documentLink.expires_at 
                            ? new Date(documentLink.expires_at).toLocaleDateString('ko-KR')
                            : '무제한'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">조회수</label>
                        <p className="font-medium">{documentLink.view_count || 0}회</p>
                      </div>
                    </div>
                    
                    {documentLink.first_viewed_at && (
                      <div className="text-sm text-gray-500">
                        처음 확인: {new Date(documentLink.first_viewed_at).toLocaleString('ko-KR')}
                        {documentLink.last_viewed_at && documentLink.last_viewed_at !== documentLink.first_viewed_at && (
                          <> · 마지막 확인: {new Date(documentLink.last_viewed_at).toLocaleString('ko-KR')}</>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={async () => {
                          const isActive = documentLink.is_active;
                          const action = isActive ? '비활성화' : '활성화';
                          
                          if (confirm(`링크를 ${action}하시겠습니까?`)) {
                            const { error } = await supabase
                              .from("public_document_links")
                              .update({ is_active: !isActive })
                              .eq("id", documentLink.id);
                            
                            if (!error) {
                              alert(`링크가 ${action}되었습니다.`);
                              setDocumentLink({ ...documentLink, is_active: !isActive });
                            } else {
                              console.error('Error updating link status:', error);
                              alert(`링크 ${action} 중 오류가 발생했습니다.`);
                            }
                          }
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                          documentLink.is_active 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        링크 {documentLink.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const newExpiryDate = prompt('새 만료일을 입력하세요 (YYYY-MM-DD)', formData.quote_expires_at);
                          if (newExpiryDate) {
                            const { error } = await supabase
                              .from("public_document_links")
                              .update({ expires_at: newExpiryDate })
                              .eq("id", documentLink.id);
                            
                            if (!error) {
                              alert('만료일이 업데이트되었습니다.');
                              setDocumentLink({ ...documentLink, expires_at: newExpiryDate });
                            }
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        만료일 수정
                      </button>
                    </div>
                  </div>
                </div>
              )}