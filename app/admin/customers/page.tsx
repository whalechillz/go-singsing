"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Plus, Edit2, Trash2, Upload, Download, 
  Phone, Mail, Calendar, Tag, Filter, X,
  UserCheck, UserX, Star, MessageSquare
} from "lucide-react";

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
    tags: [] as string[]
  });

  // 데이터 불러오기
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      // 필터 적용
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }
      if (filterType) {
        query = query.eq("customer_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 검색어 필터링
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(customer => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // 태그 필터링
      if (filterTags.length > 0) {
        filteredData = filteredData.filter(customer =>
          filterTags.some(tag => customer.tags?.includes(tag))
        );
      }

      setCustomers(filteredData);

      // 통계 계산
      const stats = {
        total: filteredData.length,
        active: filteredData.filter(c => c.status === "active").length,
        vip: filteredData.filter(c => c.customer_type === "vip").length,
        marketing_agreed: filteredData.filter(c => c.marketing_agreed).length
      };
      setStats(stats);

    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filterStatus, filterType, filterTags, searchTerm]);

  // 고객 저장
  const handleSave = async () => {
    try {
      // 전화번호 형식 검증
      const phoneRegex = /^010-?\d{4}-?\d{4}$/;
      if (!phoneRegex.test(formData.phone.replace(/-/g, ""))) {
        alert("올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)");
        return;
      }

      const customerData = {
        ...formData,
        phone: formData.phone.replace(/-/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"),
        marketing_agreed_at: formData.marketing_agreed ? new Date().toISOString() : null,
        kakao_friend_at: formData.kakao_friend ? new Date().toISOString() : null
      };

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
      tags: []
    });
    setEditingCustomer(null);
  };

  // 수정 모드
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      birth_date: customer.birth_date || "",
      gender: customer.gender || "",
      marketing_agreed: customer.marketing_agreed,
      kakao_friend: customer.kakao_friend,
      status: customer.status,
      customer_type: customer.customer_type || "regular",
      notes: customer.notes || "",
      tags: customer.tags || []
    });
    setShowModal(true);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  투어 이력
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
                        {customer.tags?.map(tag => (
                          <span key={tag} className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <Phone className="w-4 h-4 mr-1" />
                        {customer.phone}
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
                      {customer.last_tour_date && (
                        <div className="text-gray-500 text-xs">
                          마지막: {new Date(customer.last_tour_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-0000-0000"
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
                  <option value="new">신규</option>
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

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  태그
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
                    placeholder="태그 입력 후 Enter"
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
