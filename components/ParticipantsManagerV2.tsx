"use client";
import { useEffect, useState, ChangeEvent, FormEvent, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import { Search, UserPlus, Edit, Trash2, Check, X, Calendar, Eye, Download, Upload, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';

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
  isUpdating?: boolean; // 애니메이션 상태 관리용
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

const DEFAULT_COLUMNS = ["선택", "이름", "연락처", "팀", "투어", "탑승지", "객실", "참여횟수", "상태", "관리"];

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
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
  const [bulkEditField, setBulkEditField] = useState<string>("");
  const [bulkEditValue, setBulkEditValue] = useState<string>("");

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
    
    // 상태 순환: 확정 -> 미확정 -> 취소 -> 확정
    let newStatus;
    if (participant.status === "확정") {
      newStatus = "미확정";
    } else if (participant.status === "미확정") {
      newStatus = "취소";
    } else {
      newStatus = "확정";
    }
    
    const { error } = await supabase
      .from("singsing_participants")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (!error) fetchParticipants();
  };

  // 드롭다운으로 상태 변경
  const handleStatusChange = async (id: string, newStatus: string) => {
    // 애니메이션을 위한 상태 업데이트
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus, isUpdating: true } : p
    ));
    
    const { error } = await supabase
      .from("singsing_participants")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (!error) {
      // 성공 시 애니메이션 효과 후 데이터 새로고침
      setTimeout(() => {
        fetchParticipants();
      }, 500);
    } else {
      // 실패 시 원래 상태로 복구
      fetchParticipants();
    }
  };

  // 일괄 편집
  const handleBulkEdit = async () => {
    if (!bulkEditField || bulkEditValue === "") {
      alert("변경할 항목과 값을 선택해주세요.");
      return;
    }

    const updateData: any = {};
    updateData[bulkEditField] = bulkEditValue;

    const { error } = await supabase
      .from("singsing_participants")
      .update(updateData)
      .in("id", selectedIds);

    if (error) {
      setError(error.message);
    } else {
      alert(`${selectedIds.length}명의 ${bulkEditField === 'pickup_location' ? '탑승지' : 
             bulkEditField === 'team_name' ? '팀' : 
             bulkEditField === 'gender' ? '성별' : 
             bulkEditField}가 변경되었습니다.`);
      setShowBulkEditModal(false);
      setBulkEditField("");
      setBulkEditValue("");
      setSelectedIds([]);
      setSelectAll(false);
      fetchParticipants();
    }
  };

  // 체크박스 관련 함수
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredParticipants.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("삭제할 참가자를 선택해주세요.");
      return;
    }
    
    if (!window.confirm(`선택한 ${selectedIds.length}명의 참가자를 삭제하시겠습니까?`)) return;
    
    const { error } = await supabase
      .from("singsing_participants")
      .delete()
      .in("id", selectedIds);
    
    if (error) {
      setError(error.message);
    } else {
      setSelectedIds([]);
      setSelectAll(false);
      fetchParticipants();
    }
  };

  // 일괄 상태 변경
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) {
      alert("상태를 변경할 참가자를 선택해주세요.");
      return;
    }
    
    const { error } = await supabase
      .from("singsing_participants")
      .update({ status: newStatus })
      .in("id", selectedIds);
    
    if (error) {
      setError(error.message);
    } else {
      setSelectedIds([]);
      setSelectAll(false);
      fetchParticipants();
    }
  };

  // 엑셀 템플릿 다운로드
  const handleTemplateDownload = () => {
    const template = [
      {
        "이름": "홍길동",
        "전화번호": "01012345678",
        "이메일": "hong@example.com",
        "팀/동호회": "A팀",
        "성별": "남",
        "탑승지": boardingPlaces[0] || "서울",
        "참여횟수": 0,
        "그룹인원": 1,
        "동반자": "",
        "일괄결제": "X",
        "직책": "회원",
        "비상연락처": "",
        "상태": "확정",
        "참고사항": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "템플릿");

    // 현재 날짜로 파일명 생성
    const today = new Date().toISOString().split('T')[0];
    const filename = `참가자_업로드_템플릿_${today}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  // 엑셀 다운로드
  const handleExcelDownload = () => {
    const exportData = filteredParticipants.map(p => {
      const tour = tours.find(t => t.id === p.tour_id);
      return {
        "이름": p.name,
        "전화번호": p.phone || "",
        "이메일": p.email || "",
        "팀/동호회": p.team_name || "",
        "성별": p.gender || "",
        "투어": tour?.title || "",
        "투어기간": tour?.date || "",
        "탑승지": p.pickup_location || "",
        "객실": p.singsing_rooms?.room_number || "미배정",
        "참여횟수": p.join_count || 0,
        "그룹인원": p.group_size || 1,
        "동반자": p.companions?.join(", ") || "",
        "일괄결제": p.is_paying_for_group ? "O" : "X",
        "직책": p.role || "",
        "비상연락처": p.emergency_contact || "",
        "상태": p.status || "",
        "참고사항": p.note || ""
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "참가자목록");

    // 현재 날짜로 파일명 생성
    const today = new Date().toISOString().split('T')[0];
    const filename = tourId ? 
      `참가자목록_${tours.find(t => t.id === tourId)?.title}_${today}.xlsx` : 
      `참가자목록_전체_${today}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  // 엑셀 업로드
  const handleExcelUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      // 업로드할 투어 확인
      const uploadTourId = tourId || selectedTour?.id;
      if (!uploadTourId) {
        setError("투어를 먼저 선택해주세요.");
        setIsUploading(false);
        return;
      }

      // 데이터 매핑
      const mappedData = jsonData.map((row, index) => ({
        row: index + 2, // 엑셀 행 번호 (헤더 제외)
        name: row["이름"] || "",
        phone: normalizePhone(row["전화번호"] || ""),
        email: row["이메일"] || "",
        team_name: row["팀/동호회"] || "",
        gender: row["성별"] || "",
        pickup_location: row["탑승지"] || "",
        join_count: parseInt(row["참여횟수"]) || 0,
        group_size: parseInt(row["그룹인원"]) || 1,
        companions: row["동반자"] ? row["동반자"].split(",").map((c: string) => c.trim()) : [],
        is_paying_for_group: row["일괄결제"] === "O",
        role: row["직책"] || "",
        emergency_contact: normalizePhone(row["비상연락처"] || ""),
        status: row["상태"] || "확정",
        note: row["참고사항"] || "",
        tour_id: uploadTourId,
        validation: {
          isValid: true,
          errors: [] as string[]
        }
      }));

      // 유효성 검사 및 중복 체크
      const existingParticipants = participants.filter(p => p.tour_id === uploadTourId);
      
      mappedData.forEach(data => {
        // 필수 필드 검증
        if (!data.name) {
          data.validation.isValid = false;
          data.validation.errors.push("이름은 필수입니다");
        }
        
        // 전화번호 형식 검증
        if (data.phone && !/^0\d{9,10}$/.test(data.phone)) {
          data.validation.isValid = false;
          data.validation.errors.push("전화번호 형식이 올바르지 않습니다");
        }
        
        // 중복 체크 (이름 + 전화번호)
        const isDuplicate = existingParticipants.some(
          p => p.name === data.name && p.phone === data.phone
        );
        if (isDuplicate) {
          data.validation.isValid = false;
          data.validation.errors.push("이미 등록된 참가자입니다");
        }
        
        // 성별 검증
        if (data.gender && !["남", "여", ""].includes(data.gender)) {
          data.validation.isValid = false;
          data.validation.errors.push("성별은 '남' 또는 '여'만 가능합니다");
        }
        
        // 상태 검증
        if (data.status && !["확정", "미확정", "취소", ""].includes(data.status)) {
          data.validation.isValid = false;
          data.validation.errors.push("상태는 '확정', '미확정', '취소' 중 하나여야 합니다");
        }
        
        // 탑승지 검증
        if (data.pickup_location && boardingPlaces.length > 0 && !boardingPlaces.includes(data.pickup_location)) {
          data.validation.isValid = false;
          data.validation.errors.push(`탑승지는 다음 중 하나여야 합니다: ${boardingPlaces.join(", ")}`);
        }
      });

      const validData = mappedData.filter(d => d.validation.isValid);
      const invalidData = mappedData.filter(d => !d.validation.isValid);

      if (mappedData.length === 0) {
        setError("업로드할 참가자 데이터가 없습니다.");
        setIsUploading(false);
        return;
      }

      // 미리보기 모달 표시
      setUploadPreview(mappedData);
      setShowUploadModal(true);
      setIsUploading(false);
      
    } catch (error) {
      setError("엑셀 파일 처리 중 오류가 발생했습니다.");
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 업로드 확정
  const handleConfirmUpload = async () => {
    const validData = uploadPreview
      .filter(d => d.validation.isValid)
      .map(({ row, validation, ...data }) => data); // row와 validation 제외

    if (validData.length === 0) {
      setError("업로드할 유효한 데이터가 없습니다.");
      return;
    }

    setIsUploading(true);
    const { error } = await supabase
      .from("singsing_participants")
      .insert(validData);

    if (error) {
      setError(`업로드 실패: ${error.message}`);
    } else {
      alert(`${validData.length}명의 참가자가 추가되었습니다.`);
      setShowUploadModal(false);
      setUploadPreview([]);
      fetchParticipants();
    }
    setIsUploading(false);
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
        filtered = filtered.filter(p => p.status === "미확정");
        break;
      case "canceled":
        filtered = filtered.filter(p => p.status === "취소");
        break;
      case "vip":
        filtered = filtered.filter(p => (p.join_count || 0) >= 5);
        break;
      case "active":
        const activeTourIds = tours.filter(t => t.status === 'active').map(t => t.id);
        filtered = filtered.filter(p => activeTourIds.includes(p.tour_id));
        break;
      case "tour_canceled":
        const canceledTourIds = tours.filter(t => t.status === 'canceled').map(t => t.id);
        filtered = filtered.filter(p => canceledTourIds.includes(p.tour_id));
        break;
    }

    return filtered;
  };

  const filteredParticipants = getFilteredParticipants();

  // 선택된 항목이 현재 보이는 항목에 모두 포함되는지 확인
  useEffect(() => {
    const visibleIds = filteredParticipants.map(p => p.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    setSelectAll(allSelected);
  }, [selectedIds, filteredParticipants]);

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
    unconfirmed: statsParticipants.filter(p => p.status === "미확정").length,
    canceled: statsParticipants.filter(p => p.status === "취소").length,
    vip: statsParticipants.filter(p => (p.join_count || 0) >= 5).length,
    currentFiltered: filteredParticipants.length
  };

  const tabs = tourId ? [
    // 투어별 페이지에서는 active/canceled 탭 제외
    { id: 'all', label: '전체', count: stats.total },
    { id: 'confirmed', label: '확정', count: stats.confirmed },
    { id: 'unconfirmed', label: '미확정', count: stats.unconfirmed },
    { id: 'canceled', label: '취소', count: stats.canceled },
    { id: 'vip', label: 'VIP', count: stats.vip }
  ] : [
    // 전체 참가자 관리에서는 모든 탭 표시
    { id: 'all', label: '전체', count: stats.total },
    { id: 'confirmed', label: '확정', count: stats.confirmed },
    { id: 'unconfirmed', label: '미확정', count: stats.unconfirmed },
    { id: 'canceled', label: '취소', count: stats.canceled },
    { id: 'vip', label: 'VIP', count: stats.vip },
    { id: 'active', label: '운영 중 투어', count: participants.filter(p => tours.find(t => t.id === p.tour_id && t.status === 'active')).length },
    { id: 'tour_canceled', label: '취소된 투어', count: participants.filter(p => tours.find(t => t.id === p.tour_id && t.status === 'canceled')).length }
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

                {/* 액션 버튼들 */}
                <div className="flex items-center gap-2">
                  {/* 엑셀 템플릿 다운로드 */}
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                    onClick={handleTemplateDownload}
                    title="엑셀 템플릿 다운로드"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="hidden sm:inline">템플릿</span>
                  </button>

                  {/* 엑셀 다운로드 */}
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                    onClick={handleExcelDownload}
                    title="엑셀 다운로드"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">다운로드</span>
                  </button>

                  {/* 엑셀 업로드 */}
                  <label className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5" />
                    <span className="hidden sm:inline">{isUploading ? "업로드 중..." : "업로드"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  {/* 참가자 추가 */}
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    onClick={() => openModal()}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>참가자 추가</span>
                  </button>
                </div>
              </div>

              {/* 일괄 작업 버튼 - 선택된 항목이 있을 때만 표시 */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedIds.length}명 선택됨
                  </span>
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    onClick={() => handleBulkStatusChange("확정")}
                  >
                    일괄 확정
                  </button>
                  <button
                    className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                    onClick={() => handleBulkStatusChange("미확정")}
                  >
                    일괄 미확정
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    onClick={() => handleBulkStatusChange("취소")}
                  >
                    일괄 취소
                  </button>
                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    onClick={() => setShowBulkEditModal(true)}
                  >
                    일괄 편집
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    onClick={handleBulkDelete}
                  >
                    일괄 삭제
                  </button>
                </div>
              )}

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
                      {showColumns.includes("선택") && (
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      {showColumns.filter(col => col !== "선택").map(col => (
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
                            {showColumns.includes("선택") && (
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  checked={selectedIds.includes(participant.id)}
                                  onChange={() => handleSelectOne(participant.id)}
                                />
                              </td>
                            )}
                            
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
                                    <div className="font-medium text-gray-900">{tour.title}</div>
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
                                <div className="relative">
                                  <select
                                    value={participant.status || "확정"}
                                    onChange={(e) => handleStatusChange(participant.id, e.target.value)}
                                    className={`
                                      appearance-none rounded px-3 py-1.5 pr-8 text-sm font-medium cursor-pointer
                                      transition-all duration-300 ease-in-out transform
                                      ${
                                        participant.isUpdating 
                                          ? 'scale-105 ring-2 ring-blue-400 ring-opacity-50' 
                                          : 'scale-100'
                                      }
                                      ${
                                        participant.status === "확정"
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                          : participant.status === "취소"
                                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                      }
                                      focus:outline-none focus:ring-2 focus:ring-blue-500
                                    `}
                                  >
                                    <option value="확정">✅ 확정</option>
                                    <option value="미확정">⏳ 미확정</option>
                                    <option value="취소">❌ 취소</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="font-semibold text-blue-800">총 참가자:</span>{' '}
                  <span className="text-lg font-bold">{stats.total}</span>명
                </div>
                <div>
                  <span className="font-semibold text-green-700">확정:</span>{' '}
                  <span className="text-lg font-bold">{stats.confirmed}</span>명
                </div>
                <div>
                  <span className="font-semibold text-orange-700">미확정:</span>{' '}
                  <span className="text-lg font-bold">{stats.unconfirmed}</span>명
                </div>
                <div>
                  <span className="font-semibold text-gray-700">취소:</span>{' '}
                  <span className="text-lg font-bold">{stats.canceled}</span>명
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
                    미확정: {filteredParticipants.filter(p => p.status === "미확정").length}명
                  </span>
                  <span className="ml-4">
                    취소: {filteredParticipants.filter(p => p.status === "취소").length}명
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
                    미확정: {filteredParticipants.filter(p => p.status === "미확정").length}명
                  </span>
                  <span className="ml-4">
                    취소: {filteredParticipants.filter(p => p.status === "취소").length}명
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
                    상태
                  </label>
                  <select
                    name="status"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={form.status || '확정'}
                    onChange={handleChange}
                  >
                    <option value="확정">확정</option>
                    <option value="미확정">미확정</option>
                    <option value="취소">취소</option>
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

      {/* 업로드 미리보기 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">
                엑셀 업로드 미리보기
              </h3>
              <button 
                type="button" 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadPreview([]);
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-100 text-red-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  총 {uploadPreview.length}명 중
                </span>
                <span className="text-green-600 font-medium">
                  유효: {uploadPreview.filter(d => d.validation.isValid).length}명
                </span>
                <span className="text-red-600 font-medium">
                  오류: {uploadPreview.filter(d => !d.validation.isValid).length}명
                </span>
              </div>
            </div>

            {/* 오류 데이터 표시 */}
            {uploadPreview.filter(d => !d.validation.isValid).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-red-600 mb-2">오류 데이터</h4>
                <div className="bg-red-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">행</th>
                        <th className="text-left p-2">이름</th>
                        <th className="text-left p-2">전화번호</th>
                        <th className="text-left p-2">오류 내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadPreview.filter(d => !d.validation.isValid).map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{data.row}</td>
                          <td className="p-2">{data.name || "-"}</td>
                          <td className="p-2">{data.phone || "-"}</td>
                          <td className="p-2 text-red-600">
                            {data.validation.errors.join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 유효 데이터 표시 */}
            {uploadPreview.filter(d => d.validation.isValid).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-green-600 mb-2">업로드할 데이터</h4>
                <div className="bg-green-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">이름</th>
                        <th className="text-left p-2">전화번호</th>
                        <th className="text-left p-2">팀</th>
                        <th className="text-left p-2">탑승지</th>
                        <th className="text-left p-2">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadPreview.filter(d => d.validation.isValid).map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{data.name}</td>
                          <td className="p-2">{data.phone || "-"}</td>
                          <td className="p-2">{data.team_name || "-"}</td>
                          <td className="p-2">{data.pickup_location || "-"}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              data.status === "확정" 
                                ? 'bg-green-100 text-green-800' 
                                : data.status === "취소"
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {data.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadPreview([]);
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                onClick={handleConfirmUpload}
                disabled={uploadPreview.filter(d => d.validation.isValid).length === 0 || isUploading}
              >
                {isUploading ? "업로드 중..." : `${uploadPreview.filter(d => d.validation.isValid).length}명 업로드`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 편집 모달 */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">
                일괄 편집 ({selectedIds.length}명)
              </h3>
              <button 
                type="button" 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkEditField("");
                  setBulkEditValue("");
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  변경할 항목
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={bulkEditField}
                  onChange={(e) => {
                    setBulkEditField(e.target.value);
                    setBulkEditValue("");
                  }}
                >
                  <option value="">항목 선택</option>
                  <option value="team_name">팀/동호회</option>
                  <option value="pickup_location">탑승지</option>
                  <option value="gender">성별</option>
                  <option value="role">직책</option>
                </select>
              </div>

              {bulkEditField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    변경할 값
                  </label>
                  {bulkEditField === "pickup_location" ? (
                    <select
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                    >
                      <option value="">탑승지 선택</option>
                      {boardingPlaces.map(place => (
                        <option key={place} value={place}>{place}</option>
                      ))}
                    </select>
                  ) : bulkEditField === "gender" ? (
                    <select
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                    >
                      <option value="">성별 선택</option>
                      <option value="남">남</option>
                      <option value="여">여</option>
                    </select>
                  ) : bulkEditField === "role" ? (
                    <select
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                    >
                      <option value="">직책 선택</option>
                      {roleOptions.filter(r => r !== "기타").map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      placeholder="값을 입력하세요"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkEditField("");
                  setBulkEditValue("");
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleBulkEdit}
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsManagerV2;