"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import { Search, UserPlus, Edit, Trash2, Check, X, Calendar, Eye } from 'lucide-react';

// 공통 ParticipantsManager Props
interface ParticipantsManagerProps {
  tourId?: string; // 있으면 해당 투어만, 없으면 전체
  showColumns?: string[]; // 표시할 컬럼 커스텀
  onChange?: () => void; // 외부에서 데이터 변경 감지
}

interface Tour {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  status: 'active' | 'canceled';
  isPrivate?: boolean;
  note?: string;
}

interface Participant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  team_name?: string;
  note?: string;
  status: string;
  tour_id: string;
  room_id?: string | null;
  room_name?: string | null;
  singsing_rooms?: {
    room_type: string;
    room_number: string;
  };
  gender?: string;
  emergency_contact?: string;
  join_count?: number;
  group_size?: number;
  is_paying_for_group?: boolean;
  companions?: string[];
  pickup_location?: string;
  role?: string;
  created_at?: string;
  [key: string]: any;
}

interface ParticipantForm {
  name: string;
  phone: string;
  email?: string;
  team_name?: string;
  note?: string;
  status: string;
  role: string;
  gender: string;
  emergency_contact?: string;
  join_count?: number;
  group_size?: number;
  is_paying_for_group?: boolean;
  companions?: string[];
  pickup_location?: string;
  tour_id?: string;
}

const DEFAULT_COLUMNS = ["이름", "연락처", "팀", "투어", "탑승지", "객실", "참여횟수", "상태", "관리"];

const ParticipantsManagerV2: React.FC<ParticipantsManagerProps> = ({ tourId, showColumns = DEFAULT_COLUMNS, onChange }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<ParticipantForm>({ 
    name: "", 
    phone: "", 
    email: "",
    team_name: "", 
    note: "", 
    status: "확정", 
    role: "", 
    gender: "",
    emergency_contact: "",
    join_count: 0,
    group_size: 1,
    is_paying_for_group: false,
    companions: [],
    pickup_location: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const roleOptions = ["총무", "회장", "회원", "부회장", "서기", "기타"];
  const [customRole, setCustomRole] = useState("");

  // 탑승지 데이터 가져오기
  const [boardingPlaces, setBoardingPlaces] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchBoardingPlaces = async () => {
      if (tourId) {
        // 투어별 페이지: 해당 투어의 탑승 스케줄에서 가져오기
        const { data } = await supabase
          .from("singsing_boarding_schedules")
          .select("singsing_boarding_places:place_id(name)")
          .eq("tour_id", tourId);
        
        if (data) {
          const places = data
            .map((schedule: any) => schedule.singsing_boarding_places?.name)
            .filter(Boolean)
            .filter((value, index, self) => self.indexOf(value) === index); // 중복 제거
          setBoardingPlaces(places as string[]);
        }
      } else {
        // 전체 참가자 관리: 모든 탑승지 가져오기
        const { data } = await supabase
          .from("singsing_boarding_places")
          .select("name")
          .order("name", { ascending: true });
        
        if (data) {
          setBoardingPlaces(data.map(place => place.name));
        }
      }
    };
    
    fetchBoardingPlaces();
  }, [tourId]);

  // 투어 데이터 가져오기
  const fetchTours = async () => {
    const { data, error } = await supabase
      .from("singsing_tours")
      .select("*")
      .order("start_date", { ascending: true });
    
    if (!error && data) {
      // 투어 데이터를 Tour 인터페이스에 맞게 변환
      const formattedTours: Tour[] = data.map(t => {
        // 투어명: title 필드 사용
        const title = t.title || "투어";
        
        return {
          id: t.id,
          title: title,
          date: `${new Date(t.start_date).toLocaleDateString('ko-KR')}~${new Date(t.end_date).toLocaleDateString('ko-KR')}`,
          location: t.location || "",
          price: t.price || "0",
          status: t.is_active !== false ? 'active' : 'canceled',
          isPrivate: t.is_private || false,
          note: t.note || ""
        };
      });
      setTours(formattedTours);
    }
  };

  const fetchParticipants = async () => {
    setLoading(true);
    setError("");
    let query = supabase.from("singsing_participants").select("*, singsing_rooms:room_id(room_type, room_number)");
    if (tourId) query = query.eq("tour_id", tourId);
    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setParticipants((data || []) as Participant[]);
    setLoading(false);
  };

  useEffect(() => { 
    fetchTours();
    fetchParticipants(); 
  }, [tourId]);

  useEffect(() => {
    if (onChange) onChange();
  }, [participants]);

  const normalizePhone = (input: string) => {
    let phone = input.replace(/[^0-9]/g, "");
    if (phone.length === 10 && !phone.startsWith("0")) phone = "0" + phone;
    if (phone.length > 11) phone = phone.slice(0, 11);
    return phone;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    
    if (name === "phone" || name === "emergency_contact") {
      value = normalizePhone(value);
    }
    
    if (name === "role" && value === "기타") {
      setCustomRole("");
    }
    
    if (name === "group_size") {
      const size = parseInt(value) || 1;
      const newCompanions = Array(Math.max(0, size - 1)).fill("");
      setForm({ ...form, [name]: size, companions: newCompanions });
      return;
    }
    
    if (e.target.type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCompanionChange = (index: number, value: string) => {
    const newCompanions = [...(form.companions || [])];
    newCompanions[index] = value;
    setForm({ ...form, companions: newCompanions });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (!form.name) {
      setError("이름은 필수입니다.");
      return;
    }
    
    if (!tourId && !form.tour_id) {
      setError("투어를 선택해주세요.");
      return;
    }
    
    const phone = form.phone ? normalizePhone(form.phone) : "";
    const role = form.role === "기타" ? customRole : form.role;
    
    // DB에 필드가 없을 경우를 대비한 안전한 payload 생성
    const payload: any = { 
      name: form.name,
      phone: phone, 
      email: form.email,
      team_name: form.team_name,
      note: form.note,
      status: form.status,
      role: role,
      gender: form.gender,
      emergency_contact: form.emergency_contact,
      join_count: form.join_count,
      pickup_location: form.pickup_location,
      tour_id: tourId || form.tour_id,
      group_size: form.group_size,
      is_paying_for_group: form.is_paying_for_group,
      companions: form.companions?.filter(c => c.trim() !== "") || []
    };
    
    if (editingId) {
      const { error } = await supabase.from("singsing_participants").update(payload).eq("id", editingId);
      if (error) setError(error.message);
      else {
        closeModal();
        fetchParticipants();
      }
    } else {
      const { error } = await supabase.from("singsing_participants").insert([payload]);
      if (error) setError(error.message);
      else {
        closeModal();
        fetchParticipants();
      }
    }
  };

  const openModal = (participant?: Participant) => {
    if (participant) {
      setEditingId(participant.id);
      setForm({
        name: participant.name,
        phone: participant.phone,
        email: participant.email || "",
        team_name: participant.team_name || "",
        note: participant.note || "",
        status: participant.status || "확정",
        role: participant.role || "",
        gender: participant.gender || "",
        emergency_contact: participant.emergency_contact || "",
        join_count: participant.join_count || 0,
        group_size: participant.group_size || 1,
        is_paying_for_group: participant.is_paying_for_group || false,
        companions: participant.companions || [],
        pickup_location: participant.pickup_location || "",
        tour_id: participant.tour_id || tourId || "" // tourId 추가
      });
      if (participant.role && !roleOptions.includes(participant.role)) {
        setCustomRole(participant.role);
      }
    } else {
      setEditingId(null);
      setForm({
        name: "",
        phone: "",
        email: "",
        team_name: "",
        note: "",
        status: "확정",
        role: "",
        gender: "",
        emergency_contact: "",
        join_count: 0,
        group_size: 1,
        is_paying_for_group: false,
        companions: [],
        pickup_location: "",
        tour_id: tourId || "" // 투어별 페이지에서는 tourId 자동 설정
      });
      setCustomRole("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      team_name: "",
      note: "",
      status: "확정",
      role: "",
      gender: "",
      emergency_contact: "",
      join_count: 0,
      group_size: 1,
      is_paying_for_group: false,
      companions: [],
      pickup_location: ""
    });
    setCustomRole("");
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_participants").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchParticipants();
  };

  const toggleConfirmation = async (id: string) => {
    const participant = participants.find(p => p.id === id);
    if (!participant) return;
    
    const newStatus = participant.status === "확정" ? "대기" : "확정";
    const { error } = await supabase
      .from("singsing_participants")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (!error) fetchParticipants();
  };

  // 필터링 로직
  const getFilteredParticipants = () => {
    let filtered = participants;

    // 투어 필터 - tourId가 있으면 해당 투어만, 없으면 selectedTour 사용
    if (tourId) {
      filtered = filtered.filter(p => p.tour_id === tourId);
    } else if (selectedTour) {
      filtered = filtered.filter(p => p.tour_id === selectedTour.id);
    }

    // 검색어 필터
    if (search) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search) ||
        p.team_name?.toLowerCase().includes(search.toLowerCase()) ||
        (p.companions && p.companions.some(c => c.toLowerCase().includes(search.toLowerCase())))
      );
    }

    // 탭 필터
    switch (activeTab) {
      case "confirmed":
        filtered = filtered.filter(p => p.status === "확정");
        break;
      case "unconfirmed":
        filtered = filtered.filter(p => p.status !== "확정");
        break;
      case "vip":
        filtered = filtered.filter(p => (p.join_count || 0) >= 5);
        break;
      case "active":
        const activeTourIds = tours.filter(t => t.status === 'active').map(t => t.id);
        filtered = filtered.filter(p => activeTourIds.includes(p.tour_id));
        break;
      case "canceled":
        const canceledTourIds = tours.filter(t => t.status === 'canceled').map(t => t.id);
        filtered = filtered.filter(p => canceledTourIds.includes(p.tour_id));
        break;
    }

    return filtered;
  };

  const filteredParticipants = getFilteredParticipants();

  // 통계 계산 - tourId가 있으면 해당 투어만, 없으면 전체
  const getParticipantsForStats = () => {
    if (tourId) {
      return participants.filter(p => p.tour_id === tourId);
    }
    return participants;
  };
  
  const statsParticipants = getParticipantsForStats();
  const stats = {
    total: statsParticipants.length,
    confirmed: statsParticipants.filter(p => p.status === "확정").length,
    unconfirmed: statsParticipants.filter(p => p.status !== "확정").length,
    vip: statsParticipants.filter(p => (p.join_count || 0) >= 5).length,
    currentFiltered: filteredParticipants.length
  };

  const tabs = tourId ? [
    // 투어별 페이지에서는 active/canceled 탭 제외
    { id: 'all', label: '전체', count: stats.total },
    { id: 'confirmed', label: '확정', count: stats.confirmed },
    { id: 'unconfirmed', label: '미확정', count: stats.unconfirmed },
    { id: 'vip', label: 'VIP', count: stats.vip }
  ] : [
    // 전체 참가자 관리에서는 모든 탭 표시
    { id: 'all', label: '전체', count: stats.total },
    { id: 'confirmed', label: '확정', count: stats.confirmed },
    { id: 'unconfirmed', label: '미확정', count: stats.unconfirmed },
    { id: 'vip', label: 'VIP', count: stats.vip },
    { id: 'active', label: '운영 중 투어', count: participants.filter(p => tours.find(t => t.id === p.tour_id && t.status === 'active')).length },
    { id: 'canceled', label: '취소된 투어', count: participants.filter(p => tours.find(t => t.id === p.tour_id && t.status === 'canceled')).length }
  ];

  // tourId가 있을 때 (투어별 페이지)
  const renderTourSpecificHeader = () => {
    const currentTour = tours.find(t => t.id === tourId);
    if (!currentTour) return null;
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold text-blue-900">{currentTour.title}</h2>
        <div className="flex flex-wrap gap-4 mt-2">
          <p className="text-sm text-blue-700">
            <span className="font-medium">날짜:</span> {currentTour.date}
          </p>
          <p className="text-sm text-blue-700">
            <span className="font-medium">지역:</span> {currentTour.location || '-'}
          </p>
          <p className="text-sm text-blue-700">
            <span className="font-medium">가격:</span> {currentTour.price ? `${Number(currentTour.price).toLocaleString()}원` : '-'}
          </p>
          {currentTour.status === 'canceled' && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              취소됨
            </span>
          )}
          {currentTour.isPrivate && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
              단독투어
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Main content */}
      <div>
        {loading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 투어별 페이지일 때만 투어 정보 표시 */}
            {tourId && renderTourSpecificHeader()}
            
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* 투어 선택 - tourId가 없을 때만 (전체 참가자 관리) */}
                  {!tourId && (
                    <div className="relative">
                      <select
                        className="bg-white border rounded-lg px-4 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                        onChange={(e) => {
                          const tourId = e.target.value;
                          const tour = tours.find(t => t.id === tourId);
                          setSelectedTour(tour || null);
                        }}
                        value={selectedTour?.id || ''}
                      >
                        <option value="">전체 투어</option>
                        {tours.map(tour => (
                          <option key={tour.id} value={tour.id}>
                            {tour.title} ({tour.date})
                          </option>
                        ))}
                      </select>
                      <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  )}

                  {/* 검색 */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름, 전화번호, 팀 검색..."
                      className="bg-white border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 w-64"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* 참가자 추가 버튼 */}
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  onClick={() => openModal()}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>참가자 추가</span>
                </button>
              </div>

              {/* 탭 */}
              <div className="flex border-b">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* 테이블 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {showColumns.map(col => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={showColumns.length} className="px-6 py-4 text-center text-gray-500">
                          조건에 맞는 참가자가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((participant) => {
                        const tour = tours.find(t => t.id === participant.tour_id);
                        
                        return (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            {showColumns.includes("이름") && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="font-medium text-gray-900">{participant.name}</div>
                                    {participant.companions && participant.companions.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        동반자: {participant.companions.filter(c => c).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                  {(participant.group_size || 0) > 1 && (
                                    <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                      {participant.group_size}명
                                    </span>
                                  )}
                                  {participant.is_paying_for_group && (
                                    <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                      일괄결제
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            
                            {showColumns.includes("연락처") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {participant.phone ? participant.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : ""}
                              </td>
                            )}
                            
                            {showColumns.includes("팀") && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                {participant.team_name ? (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {participant.team_name}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            
                            {showColumns.includes("투어") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {tour ? (
                                  <div>
                                    <div className="font-medium text-gray-900">{tour.location}</div>
                                    <div className="text-xs text-gray-500">{tour.date}</div>
                                    {tour.status === 'canceled' && (
                                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
                                        취소됨
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            
                            {showColumns.includes("탑승지") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {participant.pickup_location ? (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {participant.pickup_location}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            
                            {showColumns.includes("객실") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {participant.singsing_rooms?.room_number || "미배정"}
                              </td>
                            )}
                            
                            {showColumns.includes("참여횟수") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <span className={`font-medium ${(participant.join_count || 0) >= 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                                    {participant.join_count || 0}회
                                  </span>
                                  {(participant.join_count || 0) >= 5 && (
                                    <span className="ml-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                      VIP
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            
                            {showColumns.includes("상태") && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors duration-200 ${
                                    participant.status === "확정"
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                  onClick={() => toggleConfirmation(participant.id)}
                                >
                                  {participant.status === "확정" ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>확정</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3" />
                                      <span>미확정</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            )}
                            
                            {showColumns.includes("관리") && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                  title="수정"
                                  onClick={() => openModal(participant)}
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  title="삭제"
                                  onClick={() => handleDelete(participant.id)}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 통계 요약 */}
            <div className="mt-6 text-sm text-gray-700 bg-white p-4 rounded-lg shadow-md">
              <div className="font-bold text-gray-900 mb-3 border-b pb-2">
                참가자 현황 요약 {tourId ? '' : (selectedTour ? `(${selectedTour.title})` : '(전체)')}
              </div>
              {!tourId && selectedTour && (
                <div className="text-gray-600 text-sm mb-3">투어 기간: {selectedTour.date}</div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-semibold text-blue-800">총 참가자:</span>{' '}
                  <span className="text-lg font-bold">{stats.total}</span>명
                </div>
                <div>
                  <span className="font-semibold text-green-700">확정:</span>{' '}
                  <span className="text-lg font-bold">{stats.confirmed}</span>명
                </div>
                <div>
                  <span className="font-semibold text-red-700">미확정:</span>{' '}
                  <span className="text-lg font-bold">{stats.unconfirmed}</span>명
                </div>
                <div>
                  <span className="font-semibold text-amber-700">VIP (5회 이상):</span>{' '}
                  <span className="text-lg font-bold">{stats.vip}</span>명
                </div>
              </div>
              {/* 현재 필터링된 목록의 통계 - tourId가 있을 때는 필터 시만 표시 */}
              {!tourId && (selectedTour || search || activeTab !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-600">
                  현재 목록 (<span className="font-medium">{stats.currentFiltered}</span>명)
                  <span className="ml-4">
                    확정: {filteredParticipants.filter(p => p.status === "확정").length}명
                  </span>
                  <span className="ml-4">
                    미확정: {filteredParticipants.filter(p => p.status !== "확정").length}명
                  </span>
                </div>
              )}
              {tourId && (search || activeTab !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-600">
                  현재 목록 (<span className="font-medium">{stats.currentFiltered}</span>명)
                  <span className="ml-4">
                    확정: {filteredParticipants.filter(p => p.status === "확정").length}명
                  </span>
                  <span className="ml-4">
                    미확정: {filteredParticipants.filter(p => p.status !== "확정").length}명
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? '참가자 정보 수정' : '새 참가자 추가'}
                </h3>
                <button type="button" className="text-gray-500 hover:text-gray-700" onClick={closeModal}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-100 text-red-800 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="숫자만 입력 (선택사항)"
                    maxLength={11}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.email || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    팀/동호회
                  </label>
                  <input
                    type="text"
                    name="team_name"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.team_name || ''}
                    onChange={handleChange}
                  />
                </div>

                {!tourId && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      투어 *
                    </label>
                    <select
                      name="tour_id"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={form.tour_id || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">투어 선택</option>
                      <optgroup label="운영 중">
                        {tours.filter(t => t.status === 'active').map(tour => (
                          <option key={tour.id} value={tour.id}>
                            {tour.title} ({tour.date}) - {tour.price}원
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="취소됨">
                        {tours.filter(t => t.status === 'canceled').map(tour => (
                          <option key={tour.id} value={tour.id} disabled>
                            {tour.title} ({tour.date}) - 취소됨
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    성별
                  </label>
                  <select
                    name="gender"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.gender || ''}
                    onChange={handleChange}
                  >
                    <option value="">선택</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    탑승지
                  </label>
                  <select
                    name="pickup_location"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.pickup_location || ''}
                    onChange={handleChange}
                  >
                    <option value="">탑승지 선택</option>
                    {boardingPlaces.map(place => (
                      <option key={place} value={place}>{place}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비상 연락처
                  </label>
                  <input
                    type="text"
                    name="emergency_contact"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.emergency_contact || ''}
                    onChange={handleChange}
                    placeholder="숫자만 입력"
                    maxLength={11}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    참여 횟수
                  </label>
                  <input
                    type="number"
                    name="join_count"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.join_count || 0}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    그룹 인원수
                  </label>
                  <input
                    type="number"
                    name="group_size"
                    min="1"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.group_size || 1}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">본인 포함 총 인원수</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직책
                  </label>
                  <select
                    name="role"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.role || ''}
                    onChange={handleChange}
                  >
                    <option value="">직책 선택</option>
                    {roleOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {form.role === "기타" && (
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="직책 직접 입력"
                    />
                  )}
                </div>

                <div className="md:col-span-2 flex flex-col gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_paying_for_group"
                      name="is_paying_for_group"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                      checked={form.is_paying_for_group || false}
                      onChange={handleChange}
                    />
                    <label htmlFor="is_paying_for_group" className="ml-2 block text-sm text-gray-900">
                      그룹 일괄 결제 (예약자가 그룹 전체 결제)
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    동반자 정보
                  </label>
                  {(form.group_size || 0) > 1 && (
                    <div className="border rounded-lg p-3 mb-3 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">동반자 이름 (선택사항)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Array.from({ length: (form.group_size || 1) - 1 }).map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            placeholder={`동반자 ${index + 1} 이름`}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={(form.companions && form.companions[index]) || ''}
                            onChange={(e) => handleCompanionChange(index, e.target.value)}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        동반자 정보는 선택사항이며, 이름만 입력하셔도 됩니다.
                      </p>
                    </div>
                  )}

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    참고사항
                  </label>
                  <textarea
                    name="note"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows={3}
                    value={form.note || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={closeModal}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? '정보 수정' : '참가자 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsManagerV2;