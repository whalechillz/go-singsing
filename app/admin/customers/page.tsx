"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Edit2, Trash2, Upload, Download, 
  Phone, Mail, Calendar, Tag, Filter, X,
  UserCheck, UserX, Star, MessageSquare,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import { formatPhoneNumber, normalizePhoneNumber, handlePhoneInputChange } from "@/lib/phoneUtils";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  marketing_agreed: boolean;
  marketing_agreed_at?: string | null;
  kakao_friend: boolean;
  kakao_friend_at?: string | null;
  status: string;
  customer_type?: string | null;
  first_tour_date?: string | null;
  last_tour_date?: string | null;
  total_tour_count: number;
  total_payment_amount: number;
  source?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  position?: string | null;
  activity_platform?: string | null;
  referral_source?: string | null;
  last_contact_at?: string | null;
  unsubscribed?: boolean;
  unsubscribed_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(1000); // 페이지당 1000개
  const [totalPages, setTotalPages] = useState(1);
  
  // 정렬 상태
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // 통계
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    vip: 0,
    marketing_agreed: 0
  });

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    gender: "",
    marketing_agreed: false,
    kakao_friend: false,
    status: "active",
    customer_type: "regular",
    notes: "",
    tags: [] as string[],
    position: "",
    activity_platform: "",
    referral_source: "",
    first_tour_date: "",
    last_tour_date: "",
    last_tour_location: "",
    last_contact_at: "",
    unsubscribed: false,
    unsubscribed_reason: "",
  });

  // 데이터 불러오기
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // 통계는 별도로 가져오기 (전체 개수)
      let statsQuery = supabase
        .from("customers")
        .select("*", { count: 'exact', head: true });

      if (filterStatus) {
        statsQuery = statsQuery.eq("status", filterStatus);
      }
      if (filterType) {
        statsQuery = statsQuery.eq("customer_type", filterType);
      }

      const { count: totalCount } = await statsQuery;

      // 활성 고객 수
      let activeQuery = supabase
        .from("customers")
        .select("*", { count: 'exact', head: true })
        .eq("status", "active");
      
      if (filterType) {
        activeQuery = activeQuery.eq("customer_type", filterType);
      }
      const { count: activeCount } = await activeQuery;

      // VIP 고객 수
      let vipQuery = supabase
        .from("customers")
        .select("*", { count: 'exact', head: true })
        .eq("customer_type", "vip");
      
      if (filterStatus) {
        vipQuery = vipQuery.eq("status", filterStatus);
      }
      const { count: vipCount } = await vipQuery;

      // 마케팅 동의 고객 수
      let marketingQuery = supabase
        .from("customers")
        .select("*", { count: 'exact', head: true })
        .eq("marketing_agreed", true);
      
      if (filterStatus) {
        marketingQuery = marketingQuery.eq("status", filterStatus);
      }
      if (filterType) {
        marketingQuery = marketingQuery.eq("customer_type", filterType);
      }
      const { count: marketingCount } = await marketingQuery;

      // 검색어가 있으면 서버 사이드에서 검색, 없으면 전체 조회
      // 먼저 검색 결과 개수 확인 (페이지네이션 계산용)
      let countQuery = supabase
        .from("customers")
        .select("*", { count: 'exact', head: true });

      if (filterStatus) {
        countQuery = countQuery.eq("status", filterStatus);
      }
      if (filterType) {
        countQuery = countQuery.eq("customer_type", filterType);
      }
      if (searchTerm) {
        // 서버 사이드 검색
        countQuery = countQuery.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { count: filteredCount } = await countQuery;
      const totalPagesCount = filteredCount ? Math.ceil(filteredCount / pageSize) : 1;
      setTotalPages(totalPagesCount);

      // 고객 목록 가져오기 (페이지네이션 및 정렬 적용)
      let query = supabase
        .from("customers")
        .select("*");
      
      // 정렬 필드에 따라 다르게 처리
      if (sortField === "tags") {
        // tags는 배열이므로 클라이언트 사이드에서 정렬
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order(sortField, { ascending: sortDirection === "asc" });
      }
      
      query = query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      // 필터 적용
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }
      if (filterType) {
        query = query.eq("customer_type", filterType);
      }

      // 검색어가 있으면 서버 사이드에서 검색
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 태그 필터링 및 정렬 (클라이언트 사이드 - 태그는 배열이므로)
      let filteredData = data || [];
      if (filterTags.length > 0) {
        filteredData = filteredData.filter(customer =>
          filterTags.some(tag => customer.tags?.includes(tag))
        );
      }

      // tags 정렬은 클라이언트 사이드에서 처리
      if (sortField === "tags") {
        filteredData.sort((a, b) => {
          const aTags = a.tags && a.tags.length > 0 ? a.tags[0] : "";
          const bTags = b.tags && b.tags.length > 0 ? b.tags[0] : "";
          if (sortDirection === "asc") {
            return aTags.localeCompare(bTags);
          } else {
            return bTags.localeCompare(aTags);
          }
        });
      }

      setCustomers(filteredData);

      // 통계 설정 (전체 개수 사용)
      setStats({
        total: totalCount || 0,
        active: activeCount || 0,
        vip: vipCount || 0,
        marketing_agreed: marketingCount || 0
      });

    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filterStatus, filterType, filterTags, searchTerm, currentPage, sortField, sortDirection]);

  // 검색어나 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType, sortField]);

  // 고객 저장
  const handleSave = async () => {
    try {
      // 전화번호 정규화 및 검증
      const normalizedPhone = normalizePhoneNumber(formData.phone);
      if (normalizedPhone.length !== 11 || !normalizedPhone.startsWith('010')) {
        alert("올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)");
        return;
      }

      // notes에 최근 투어지 추가 (기존 notes 유지)
      let notes = formData.notes || "";
      if (formData.last_tour_location) {
        const tourLocationNote = `최근 투어지: ${formData.last_tour_location}`;
        if (notes && !notes.includes(tourLocationNote)) {
          notes = notes.includes("최근 투어지:") 
            ? notes.replace(/최근 투어지:[^|]*/, tourLocationNote)
            : `${notes} | ${tourLocationNote}`;
        } else if (!notes) {
          notes = tourLocationNote;
        }
      }

      const customerData = {
        ...formData,
        phone: normalizedPhone,
        first_tour_date: formData.first_tour_date || null,
        last_tour_date: formData.last_tour_date || null,
        notes: notes || null,
        marketing_agreed_at: formData.marketing_agreed ? new Date().toISOString() : null,
        kakao_friend_at: formData.kakao_friend ? new Date().toISOString() : null,
        last_contact_at: formData.last_contact_at ? new Date(formData.last_contact_at).toISOString() : null,
        unsubscribed: formData.unsubscribed || false,
        unsubscribed_reason: formData.unsubscribed ? formData.unsubscribed_reason : null,
      };
      
      // last_tour_location은 notes에 포함되므로 제거
      delete (customerData as any).last_tour_location;

      if (editingCustomer) {
        // 수정
        const { error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", editingCustomer.id);

        if (error) throw error;
      } else {
        // 추가
        const { error } = await supabase
          .from("customers")
          .insert({ ...customerData, source: "manual" });

        if (error) throw error;
      }

      alert("저장되었습니다.");
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      if (error.code === '23505') {
        alert("이미 등록된 전화번호입니다.");
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    }
  };

  // 고객 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("삭제되었습니다.");
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      birth_date: "",
      gender: "",
      marketing_agreed: false,
      kakao_friend: false,
      status: "active",
      customer_type: "regular",
      notes: "",
      tags: [],
      position: "",
      activity_platform: "",
      referral_source: "",
      first_tour_date: "",
      last_tour_date: "",
      last_tour_location: "",
      last_contact_at: "",
      unsubscribed: false,
      unsubscribed_reason: "",
    });
    setEditingCustomer(null);
  };

  // 수정 모드
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    
    // notes에서 최근 투어지 추출 (형식: "최근 투어지: ...")
    let lastTourLocation = "";
    if (customer.notes) {
      const tourLocationMatch = customer.notes.match(/최근 투어지:\s*([^|]+)/);
      if (tourLocationMatch) {
        lastTourLocation = tourLocationMatch[1].trim();
      }
    }
    
    setFormData({
      name: customer.name,
      phone: formatPhoneNumber(customer.phone),
      email: customer.email || "",
      birth_date: customer.birth_date || "",
      gender: customer.gender || "",
      marketing_agreed: customer.marketing_agreed,
      kakao_friend: customer.kakao_friend,
      status: customer.status,
      customer_type: customer.customer_type || "regular",
      notes: customer.notes || "",
      tags: customer.tags || [],
      position: customer.position || "",
      activity_platform: customer.activity_platform || "",
      referral_source: customer.referral_source || "",
      first_tour_date: customer.first_tour_date || "",
      last_tour_date: customer.last_tour_date || "",
      last_tour_location: lastTourLocation,
      last_contact_at: customer.last_contact_at ? new Date(customer.last_contact_at).toISOString().slice(0, 16) : "",
      unsubscribed: customer.unsubscribed || false,
      unsubscribed_reason: customer.unsubscribed_reason || "",
    });
    setShowModal(true);
  };

  // 정렬 핸들러
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로
  };

  // 정렬 아이콘 렌더링
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 inline ml-1 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 inline ml-1 text-blue-600" />
    );
  };

  // 태그 추가
  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  // 태그 제거
  const removeTag = (tag: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(t => t !== tag) 
    });
  };

  // 엑셀 파일 업로드 처리
  const handleFileUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      setUploadMessage("파일 업로드 중...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/customers/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("업로드 실패");
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadMessage(result.message);
        setUploadProgress(100);
        
        // 2초 후 모달 닫고 목록 새로고침
        setTimeout(() => {
          setShowImportModal(false);
          setUploadProgress(0);
          setUploadMessage("");
          fetchCustomers();
        }, 2000);
      } else {
        throw new Error(result.error || "업로드 실패");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("업로드 중 오류가 발생했습니다.");
      setUploadProgress(0);
    }
  };

  // 일괄 상태 변경
  const handleBulkStatusChange = async (status: string) => {
    if (selectedCustomers.length === 0) {
      alert("선택된 고객이 없습니다.");
      return;
    }

    if (!confirm(`선택된 ${selectedCustomers.length}명의 고객 상태를 변경하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from("customers")
        .update({ status })
        .in("id", selectedCustomers);

      if (error) throw error;

      alert("상태가 변경되었습니다.");
      setSelectedCustomers([]);
      fetchCustomers();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">고객 데이터베이스</h1>
        <p className="text-gray-600 mt-1">전체 고객 정보를 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 고객</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}명</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 고객</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}명</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">VIP 고객</p>
              <p className="text-2xl font-bold text-purple-600">{stats.vip}명</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">마케팅 동의</p>
              <p className="text-2xl font-bold text-blue-600">{stats.marketing_agreed}명</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="이름, 전화번호, 이메일 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="blocked">차단</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 유형</option>
            <option value="vip">VIP</option>
            <option value="regular">일반</option>
            <option value="new">신규</option>
          </select>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            엑셀 업로드
          </button>

          <button
            onClick={async () => {
              const params = new URLSearchParams();
              if (filterStatus) params.append("status", filterStatus);
              if (filterType) params.append("customer_type", filterType);
              
              window.location.href = `/api/customers/export?${params.toString()}`;
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            내보내기
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            고객 추가
          </button>
        </div>

        {/* 선택된 고객 일괄 처리 */}
        {selectedCustomers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedCustomers.length}명 선택됨
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusChange("active")}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                활성화
              </button>
              <button
                onClick={() => handleBulkStatusChange("inactive")}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                비활성화
              </button>
              <button
                onClick={() => setSelectedCustomers([])}
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                선택 해제
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 고객 목록 테이블 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === customers.length && customers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers(customers.map(c => c.id));
                      } else {
                        setSelectedCustomers([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객정보
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("position")}
                >
                  <div className="flex items-center">
                    직급
                    {getSortIcon("position")}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("tags")}
                  title="모임명은 tags 필드에 저장됩니다"
                >
                  <div className="flex items-center">
                    모임명 (tags)
                    {getSortIcon("tags")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("last_tour_date")}
                >
                  <div className="flex items-center">
                    투어 이력
                    {getSortIcon("last_tour_date")}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("last_contact_at")}
                >
                  <div className="flex items-center">
                    최근 연락
                    {getSortIcon("last_contact_at")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수신거부
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마케팅
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCustomers([...selectedCustomers, customer.id]);
                        } else {
                          setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.customer_type === "vip" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            VIP
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {customer.position ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {customer.position}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {customer.tags && customer.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <Phone className="w-4 h-4 mr-1" />
                        {formatPhoneNumber(customer.phone)}
                      </div>
                      {customer.email && (
                        <div className="flex items-center text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        총 {customer.total_tour_count}회
                      </div>
                      {customer.first_tour_date && (
                        <div className="text-gray-500 text-xs">
                          최초: {new Date(customer.first_tour_date).toLocaleDateString()}
                        </div>
                      )}
                      {customer.last_tour_date && (
                        <div className="text-gray-500 text-xs">
                          마지막: {new Date(customer.last_tour_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.last_contact_at ? (
                        new Date(customer.last_contact_at).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.unsubscribed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        수신거부
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        수신동의
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {customer.marketing_agreed && (
                        <span className="text-green-600" title="마케팅 동의">
                          <MessageSquare className="w-4 h-4" />
                        </span>
                      )}
                      {customer.kakao_friend && (
                        <span className="text-yellow-600" title="카카오 친구">
                          <Star className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                        customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'}`}>
                      {customer.status === 'active' ? '활성' : 
                       customer.status === 'inactive' ? '비활성' : '차단'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && stats.total > 0 && (
        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-700">
            {((currentPage - 1) * pageSize + 1)}-{Math.min(currentPage * pageSize, stats.total)} / {stats.total}명
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCustomer ? "고객 정보 수정" : "고객 추가"}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneInputChange(e.target.value, (value) => setFormData({ ...formData, phone: value }))}
                  onBlur={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setFormData({ ...formData, phone: formatted });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-0000-0000"
                  maxLength={13}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  생년월일
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  성별
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택안함</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  고객 유형
                </label>
                <select
                  value={formData.customer_type}
                  onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="regular">일반</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="blocked">차단</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  직급
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택안함</option>
                  <option value="총무">총무</option>
                  <option value="회장">회장</option>
                  <option value="방장">방장</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  활동 플랫폼
                </label>
                <select
                  value={formData.activity_platform}
                  onChange={(e) => setFormData({ ...formData, activity_platform: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택안함</option>
                  <option value="밴드">밴드</option>
                  <option value="당근마켓">당근마켓</option>
                  <option value="모임(오프라인)">모임(오프라인)</option>
                  <option value="카카오톡">카카오톡</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  유입경로
                </label>
                <select
                  value={formData.referral_source}
                  onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택안함</option>
                  <option value="네이버블로그">네이버블로그</option>
                  <option value="홈페이지">홈페이지</option>
                  <option value="네이버검색">네이버검색</option>
                  <option value="구글검색">구글검색</option>
                  <option value="지인추천">지인추천</option>
                  <option value="페이스북 광고">페이스북 광고</option>
                  <option value="인스타그램 광고">인스타그램 광고</option>
                  <option value="카카오톡 채널">카카오톡 채널</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최초 문의일
                </label>
                <input
                  type="date"
                  value={formData.first_tour_date}
                  onChange={(e) => setFormData({ ...formData, first_tour_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최근 투어일
                </label>
                <input
                  type="date"
                  value={formData.last_tour_date}
                  onChange={(e) => setFormData({ ...formData, last_tour_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최근 투어지
                </label>
                <input
                  type="text"
                  value={formData.last_tour_location}
                  onChange={(e) => setFormData({ ...formData, last_tour_location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 순천파인힐스CC, 화순+나주"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최근 연락
                </label>
                <input
                  type="datetime-local"
                  value={formData.last_contact_at}
                  onChange={(e) => setFormData({ ...formData, last_contact_at: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.unsubscribed}
                    onChange={(e) => setFormData({ ...formData, unsubscribed: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">수신거부</span>
                </label>
                {formData.unsubscribed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수신거부 사유
                    </label>
                    <textarea
                      value={formData.unsubscribed_reason}
                      onChange={(e) => setFormData({ ...formData, unsubscribed_reason: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="수신거부 사유를 입력하세요"
                    />
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  모임명 (태그)
                  <span className="ml-2 text-xs text-gray-500 font-normal">(여러 모임명을 태그로 추가할 수 있습니다)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="모임명 입력 후 Enter (예: 일삼일사회, 변연화팀)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.marketing_agreed}
                    onChange={(e) => setFormData({ ...formData, marketing_agreed: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">마케팅 수신 동의</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.kakao_friend}
                    onChange={(e) => setFormData({ ...formData, kakao_friend: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">카카오 친구 추가</span>
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="고객에 대한 메모를 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCustomer ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 엑셀 업로드 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">엑셀 파일 업로드</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                고객 정보가 포함된 엑셀 파일을 업로드하세요.
              </p>
              <p className="text-xs text-gray-500">
                필수 컬럼: 이름, 전화번호<br />
                선택 컬럼: 이메일, 생년월일, 성별, 메모, 마케팅동의, 카카오친구
              </p>
              <div className="mt-3">
                <a
                  href="/api/customers/template"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  템플릿 다운로드
                </a>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                파일을 드래그하거나 클릭하여 선택
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                id="excel-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
              <label
                htmlFor="excel-upload" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                파일 선택
              </label>
            </div>

            {/* 업로드 진행 상황 */}
            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {uploadMessage}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setUploadProgress(0);
                  setUploadMessage("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
