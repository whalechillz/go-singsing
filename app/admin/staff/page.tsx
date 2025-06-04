"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit2, Trash2, Search, Phone, User, UserCheck } from "lucide-react";

type Staff = {
  id: string;
  tour_id: string;
  name: string;
  phone: string;
  role: string;
  order: number;
  user_id?: string;
  created_at: string;
  tour?: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

type Tour = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
};

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterTour, setFilterTour] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    tour_id: "",
    name: "",
    phone: "",
    role: "기사",
    order: 1
  });

  // 데이터 불러오기
  const fetchData = async () => {
    setLoading(true);
    try {
      // 스태프 목록 가져오기
      const { data: staffData, error: staffError } = await supabase
        .from("singsing_tour_staff")
        .select(`
          *,
          tour:tour_id (
            id,
            title,
            start_date,
            end_date
          ),
          user:user_id (
            id,
            name,
            email,
            role
          )
        `)
        .order("created_at", { ascending: false });

      if (staffError) throw staffError;
      
      // 투어 목록 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from("singsing_tours")
        .select("id, title, start_date, end_date")
        .gte("end_date", new Date().toISOString().split('T')[0])
        .order("start_date", { ascending: true });

      if (tourError) throw tourError;

      setStaffList(staffData || []);
      setTours(tourData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 스태프 저장
  const handleSave = async () => {
    try {
      if (editingStaff) {
        // 수정
        const { error } = await supabase
          .from("singsing_tour_staff")
          .update({
            tour_id: formData.tour_id,
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
            order: formData.order
          })
          .eq("id", editingStaff.id);

        if (error) throw error;
        
        // singsing_tours 테이블도 업데이트 (기사인 경우)
        if (formData.role === "기사") {
          await supabase
            .from("singsing_tours")
            .update({
              driver_name: formData.name,
              driver_phone: formData.phone
            })
            .eq("id", formData.tour_id);
        }
      } else {
        // 추가
        const { error } = await supabase
          .from("singsing_tour_staff")
          .insert({
            tour_id: formData.tour_id,
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
            order: formData.order
          });

        if (error) throw error;
        
        // singsing_tours 테이블도 업데이트 (기사인 경우)
        if (formData.role === "기사") {
          await supabase
            .from("singsing_tours")
            .update({
              driver_name: formData.name,
              driver_phone: formData.phone
            })
            .eq("id", formData.tour_id);
        }
      }

      alert("저장되었습니다.");
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving staff:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 스태프 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("singsing_tour_staff")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("삭제되었습니다.");
      fetchData();
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      tour_id: "",
      name: "",
      phone: "",
      role: "기사",
      order: 1
    });
    setEditingStaff(null);
  };

  // 수정 모드
  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      tour_id: staff.tour_id,
      name: staff.name,
      phone: staff.phone,
      role: staff.role || "기사",
      order: staff.order || 1
    });
    setShowModal(true);
  };

  // 필터링된 스태프 목록
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.phone.includes(searchTerm);
    const matchesRole = !filterRole || staff.role === filterRole;
    const matchesTour = !filterTour || staff.tour_id === filterTour;
    
    return matchesSearch && matchesRole && matchesTour;
  });

  // 역할별 그룹화
  const staffByRole = filteredStaff.reduce((acc, staff) => {
    const role = staff.role || "기타";
    if (!acc[role]) acc[role] = [];
    acc[role].push(staff);
    return acc;
  }, {} as Record<string, Staff[]>);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">스태프 관리</h1>
        <p className="text-gray-600 mt-1">투어별 스태프(기사, 가이드 등)를 관리합니다.</p>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="이름 또는 전화번호 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 역할</option>
            <option value="기사">기사</option>
            <option value="가이드">가이드</option>
            <option value="인솔자">인솔자</option>
            <option value="기타">기타</option>
          </select>

          <select
            value={filterTour}
            onChange={(e) => setFilterTour(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 투어</option>
            {tours.map(tour => (
              <option key={tour.id} value={tour.id}>
                {tour.title} ({new Date(tour.start_date).toLocaleDateString()})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            스태프 추가
          </button>
        </div>
      </div>

      {/* 스태프 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(staffByRole).map(([role, staffs]) => (
            <div key={role} className="bg-white rounded-lg shadow">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-lg text-gray-800">{role}</h3>
              </div>
              <div className="divide-y">
                {staffs.map(staff => (
                  <div key={staff.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {staff.user_id ? (
                            <UserCheck className="w-6 h-6 text-blue-600" />
                          ) : (
                            <User className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{staff.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4" />
                            {staff.phone}
                          </p>
                          {staff.tour && (
                            <p className="text-sm text-gray-500 mt-1">
                              {staff.tour.title} ({new Date(staff.tour.start_date).toLocaleDateString()})
                            </p>
                          )}
                          {staff.user && (
                            <p className="text-xs text-green-600 mt-1">
                              시스템 계정 연결됨: {staff.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? "스태프 수정" : "스태프 추가"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  투어 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tour_id}
                  onChange={(e) => setFormData({ ...formData, tour_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">투어를 선택하세요</option>
                  {tours.map(tour => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title} ({new Date(tour.start_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

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
                  역할 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="기사">기사</option>
                  <option value="가이드">가이드</option>
                  <option value="인솔자">인솔자</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  순서
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
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
                {editingStaff ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}