"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import { Search, UserPlus, Edit, Trash2, Check, X, Calendar, Eye, Download, Upload, FileSpreadsheet, CheckSquare, Square, Ban, MessageSquare } from 'lucide-react';
import QuickMemo from "@/components/memo/QuickMemo";
import MemoViewer from "@/components/memo/MemoViewer";

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
  price: string | number;
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
  paymentSummary?: PaymentSummary; // 결제 요약 정보
  is_group_payer?: boolean; // 일괄결제자 여부
  memo_count?: number; // 메모 개수
  has_urgent_memo?: boolean; // 긴급 메모 여부
  has_pending_memo?: boolean; // 처리 대기 메모 여부
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

interface Payment {
  id: string;
  participant_id: string;
  payer_id: string;  // 결제자 ID
  amount: number;
  payment_status?: string;
  payment_method?: string;
}

interface PaymentSummary {
  totalAmount: number;
  payments: Payment[];
  payer_id?: string;
  payer_name?: string;
}

const DEFAULT_COLUMNS = ["선택", "이름", "연락처", "팀", "투어", "탑승지", "객실", "참여횟수", "결제상태", "상태", "메모", "관리"];

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
  const [showMemoModal, setShowMemoModal] = useState<string | null>(null);
  const [selectedParticipantForMemo, setSelectedParticipantForMemo] = useState<{id: string, name: string, tourId: string} | null>(null);

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
    
    // 참가자 정보 조회
    let query = supabase.from("singsing_participants").select("*, singsing_rooms:room_id(room_type, room_number)");
    if (tourId) query = query.eq("tour_id", tourId);
    const { data: participantsData, error } = await query.order("created_at", { ascending: true });
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    
    // 결제 정보 조회
    let paymentQuery = supabase.from("singsing_payments").select("*");
    if (tourId) paymentQuery = paymentQuery.eq("tour_id", tourId);
    const { data: paymentsData } = await paymentQuery;
    
    // 메모 정보 조회
    let memoQuery = supabase.from("singsing_memos").select("participant_id, status, priority");
    if (tourId) memoQuery = memoQuery.eq("tour_id", tourId);
    const { data: memosData } = await memoQuery;
    
    // 참가자별 메모 개수 및 상태 계산
    const memoStats: Record<string, { total: number; pending: number; urgent: number }> = {};
    if (memosData) {
      memosData.forEach(memo => {
        if (!memoStats[memo.participant_id]) {
          memoStats[memo.participant_id] = { total: 0, pending: 0, urgent: 0 };
        }
        memoStats[memo.participant_id].total++;
        if (memo.status === 'pending' || memo.status === 'follow_up') {
          memoStats[memo.participant_id].pending++;
        }
        if (memo.priority === 2) {
          memoStats[memo.participant_id].urgent++;
        }
      });
    }
    
    // 각 참가자에 대한 결제 정보와 일괄결제자 여부 설정
    if (participantsData && paymentsData) {
      const participantsWithPayment = participantsData.map(participant => {
        // 해당 참가자의 모든 결제 내역 찾기 (환불 제외)
        const participantPayments = paymentsData.filter(p => 
          p.participant_id === participant.id && 
          p.payment_status !== 'refunded' &&
          p.payment_status !== 'cancelled'
        );
        
        // 총 결제 금액 계산
        const totalAmount = participantPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        // 결제자 정보 가져오기 (가장 최근 결제의 결제자)
        const latestPayment = participantPayments[participantPayments.length - 1];
        const payerId = latestPayment?.payer_id;
        const payerName = payerId ? participantsData.find(p => p.id === payerId)?.name : undefined;
        
        // 일괄결제자 여부 확인
        const isGroupPayer = paymentsData.filter(p => p.payer_id === participant.id).length > 1;
        
        return {
          ...participant,
          paymentSummary: participantPayments.length > 0 ? {
            totalAmount,
            payments: participantPayments,
            payer_id: payerId,
            payer_name: payerName
            } : undefined,
            is_group_payer: isGroupPayer,  // 일괄결제자 여부 추가
        memo_count: memoStats[participant.id]?.total || 0,
        has_urgent_memo: (memoStats[participant.id]?.urgent || 0) > 0,
        has_pending_memo: (memoStats[participant.id]?.pending || 0) > 0
        };
      });
      setParticipants(participantsWithPayment as Participant[]);
    } else {
      setParticipants((participantsData || []) as Participant[]);
    }
    
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
      const currentSize = form.group_size || 1;
      
      // 그룹 인원수를 줄이는 경우 경고
      if (size < currentSize && form.companions && form.companions.some(c => c)) {
        const hasCompanionData = form.companions.slice(size - 1).some(c => c && c.trim() !== '');
        if (hasCompanionData) {
          const confirmDelete = window.confirm(
            `그룹 인원수를 ${currentSize}명에서 ${size}명으로 줄이면 ` +
            `마지막 ${currentSize - size}명의 동반자 정보가 삭제됩니다. 계속하시겠습니까?`
          );
          if (!confirmDelete) {
            return; // 취소하면 변경하지 않음
          }
        }
      }
      
      const newCompanions = Array(Math.max(0, size - 1)).fill("");
      // 기존 동반자 정보 보존
      if (size > currentSize && form.companions) {
        form.companions.forEach((companion, index) => {
          if (index < newCompanions.length) {
            newCompanions[index] = companion;
          }
        });
      } else if (size < currentSize && form.companions) {
        // 줄어든 경우 앞쪽만 보존
        form.companions.slice(0, size - 1).forEach((companion, index) => {
          newCompanions[index] = companion;
        });
      }
      
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
      
      // 동반자 배열 크기 조정
      const groupSize = participant.group_size || 1;
      let companions = participant.companions || [];
      
      // 그룹 크기에 맞게 동반자 배열 조정
      if (groupSize > 1) {
        const companionCount = groupSize - 1;
        if (companions.length < companionCount) {
          // 배열이 작으면 빈 문자열로 채우기
          companions = [...companions, ...Array(companionCount - companions.length).fill('')];
        } else if (companions.length > companionCount) {
          // 배열이 크면 잘라내기
          companions = companions.slice(0, companionCount);
        }
      } else {
        companions = [];
      }
      
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
        group_size: groupSize,
        is_paying_for_group: participant.is_paying_for_group || false,
        companions: companions,
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
    
    // 로컬 상태만 업데이트 (페이지 위치 유지)
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    
    const { error } = await supabase
      .from("singsing_participants")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      // 실패 시 원래 상태로 복구
      setParticipants(prev => prev.map(p => 
        p.id === id ? { ...p, status: participant.status } : p
      ));
      setError(error.message);
    }
  };

  // 드롭다운으로 상태 변경
  const handleStatusChange = async (id: string, newStatus: string) => {
    // 로컬 상태만 업데이트 (페이지 위치 유지)
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    
    const { error } = await supabase
      .from("singsing_participants")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      // 실패 시 원래 상태로 복구
      const participant = participants.find(p => p.id === id);
      if (participant) {
        setParticipants(prev => prev.map(p => 
          p.id === id ? { ...p, status: participant.status } : p
        ));
      }
      setError(error.message);
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
      case "paid":
        filtered = filtered.filter(p => p.paymentSummary && p.paymentSummary.totalAmount > 0);
        break;
      case "unpaid":
        filtered = filtered.filter(p => !p.paymentSummary || !p.paymentSummary.totalAmount || p.paymentSummary.totalAmount === 0);
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

  // 통계 계산 - 실시간 업데이트를 위해 useMemo 사용
  const stats = React.useMemo(() => {
    const getParticipantsForStats = () => {
      if (tourId) {
        return participants.filter(p => p.tour_id === tourId);
      }
      return participants;
    };
    
    const statsParticipants = getParticipantsForStats();
    const paidCount = statsParticipants.filter(p => p.paymentSummary && p.paymentSummary.totalAmount > 0).length;
    const unpaidCount = statsParticipants.filter(p => !p.paymentSummary || !p.paymentSummary.totalAmount || p.paymentSummary.totalAmount === 0).length;
    
    return {
      total: statsParticipants.length,
      confirmed: statsParticipants.filter(p => p.status === "확정").length,
      unconfirmed: statsParticipants.filter(p => p.status === "미확정").length,
      canceled: statsParticipants.filter(p => p.status === "취소").length,
      vip: statsParticipants.filter(p => (p.join_count || 0) >= 5).length,
      paid: paidCount,
      unpaid: unpaidCount,
      paymentRate: statsParticipants.length > 0 ? Math.round((paidCount / statsParticipants.length) * 100) : 0,
      currentFiltered: filteredParticipants.length
    };
  }, [participants, filteredParticipants, tourId]);

  const tabs = tourId ? [
    // 투어별 페이지에서는 active/canceled 탭 제외
    { id: 'all', label: '전체', count: stats.total },
    { id: 'confirmed', label: '확정', count: stats.confirmed },
    { id: 'unconfirmed', label: '미확정', count: stats.unconfirmed },
    { id: 'canceled', label: '취소', count: stats.canceled },
    { id: 'paid', label: '결제완료', count: stats.paid },
    { id: 'unpaid', label: '미결제', count: stats.unpaid },
    { id: 'vip', label: 'VIP', count: stats.vip }
  ] : [
    // 전체 참가자 관리에서도 '운영 중 투어', '취소된 투어' 탭을 제거
    { id: 'all', label: '전체', count: stats.total },
    { id: 'confirmed', label: '확정', count: stats.confirmed },
    { id: 'unconfirmed', label: '미확정', count: stats.unconfirmed },
    { id: 'canceled', label: '취소', count: stats.canceled },
    { id: 'paid', label: '결제완료', count: stats.paid },
    { id: 'unpaid', label: '미결제', count: stats.unpaid },
    { id: 'vip', label: 'VIP', count: stats.vip }
  ];

  // tourId가 있을 때 (투어별 페이지)
  const renderTourSpecificHeader = () => {
    const currentTour = tours.find(t => t.id === tourId);
    if (!currentTour) return null;
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{currentTour.title}</h2>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">날짜:</span> {currentTour.date}
          </div>
          <div>
            <span className="font-medium">가격:</span> {currentTour.price ? `${Number(currentTour.price).toLocaleString()}원` : '-'}
          </div>
          {currentTour.status === 'canceled' && (
            <span className="text-red-600 text-sm font-medium">
              • 취소됨
            </span>
          )}
          {currentTour.isPrivate && (
            <span className="text-blue-600 text-sm font-medium">
              • 단독투어
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
            <div className="admin-card mb-4">
              <div className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* 투어 선택 - tourId가 없을 때만 (전체 참가자 관리) */}
                  {!tourId && (
                    <div className="relative">
                      <select
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                      className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* 엑셀 템플릿 다운로드 */}
                  <button
                    className="bg-white text-gray-700 px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={handleTemplateDownload}
                    title="엑셀 템플릿 다운로드"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">템플릿</span>
                  </button>

                  {/* 엑셀 다운로드 */}
                  <button
                    className="bg-white text-gray-700 px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={handleExcelDownload}
                    title="엑셀 다운로드"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">다운로드</span>
                  </button>

                  {/* 엑셀 업로드 */}
                  <label className="bg-white text-gray-700 px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{isUploading ? "업로드 중..." : "업로드"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  {/* 참가자 추가 - Primary Action */}
                  <button
                    className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => openModal()}
                    title="참가자 추가"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium text-sm">참가자 추가</span>
                  </button>
                </div>
              </div>

              {/* 일괄 작업 버튼 - 선택된 항목이 있을 때만 표시 */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700 font-medium">
                    {selectedIds.length}명 선택됨
                  </span>
                  <div className="w-px h-5 bg-gray-300 mx-2" />
                  <button
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => handleBulkStatusChange("확정")}
                  >
                    일괄 확정
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => handleBulkStatusChange("미확정")}
                  >
                    일괄 미확정
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => handleBulkStatusChange("취소")}
                  >
                    일괄 취소
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => setShowBulkEditModal(true)}
                  >
                    일괄 편집
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-2" />
                  <button
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    onClick={handleBulkDelete}
                  >
                    일괄 삭제
                  </button>
                </div>
              )}

              {/* 탭 */}
              <div className="flex border-b border-gray-200">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`px-4 py-3 font-medium text-sm transition-all duration-200 relative ${
                      activeTab === tab.id 
                        ? 'text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    <span className={`ml-1.5 text-xs ${
                      activeTab === tab.id ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
              </div>
            </div>

            {/* 테이블 */}
            <div className="admin-card overflow-hidden">
              <div className="table-scroll-container">
                <table className="w-full divide-y divide-gray-200 compact-table">
                  <thead className="bg-gray-50">
                    <tr>
                      {showColumns.includes("선택") && (
                        <th className="px-3 py-3 text-left w-10">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      {showColumns.filter(col => col !== "선택").map(col => (
                        <th key={col} className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                          col === "이름" ? "min-w-[140px] w-[200px]" :
                          col === "연락처" ? "min-w-[110px] w-[130px]" :
                          col === "팀" ? "min-w-[70px] w-[100px]" :
                          col === "투어" ? "min-w-[160px] w-[220px]" :
                          col === "탑승지" ? "min-w-[70px] w-[90px]" :
                          col === "객실" ? "min-w-[60px] w-[80px]" :
                          col === "참여횟수" ? "min-w-[70px] w-[90px]" :
                          col === "결제상태" ? "min-w-[90px] w-[110px]" :
                          col === "상태" ? "min-w-[90px] w-[110px]" :
                          col === "관리" ? "min-w-[70px] w-[90px]" : ""
                        }`}>
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
                              <td className="px-3 py-3">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  checked={selectedIds.includes(participant.id)}
                                  onChange={() => handleSelectOne(participant.id)}
                                />
                              </td>
                            )}
                            
                            {showColumns.includes("이름") && (
                              <td className="px-3 py-3 whitespace-nowrap">
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
                                    <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                      {participant.group_size}명
                                    </span>
                                  )}
                                  {/* 본인이 일괄결제자인 경우에만 표시 */}
                                  {participant.is_group_payer && (
                                  <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                  일괄결제
                                  </span>
                                  )}
                                    {/* 메모 상태 표시 */}
                  {participant.has_urgent_memo && (
                    <span className="ml-1" title="긴급 메모">🚨</span>
                  )}
                  {!participant.has_urgent_memo && participant.has_pending_memo && (
                    <span className="ml-1" title="처리 대기 메모">📝</span>
                  )}
                </div>
                              </td>
                            )}
                            
                            {showColumns.includes("연락처") && (
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {participant.phone ? participant.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : ""}
                              </td>
                            )}
                            
                            {showColumns.includes("팀") && (
                              <td className="px-3 py-3 whitespace-nowrap">
                                {participant.team_name ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {participant.team_name}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            
                            {showColumns.includes("투어") && (
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {tour ? (
                                  <div>
                                    <div className="font-medium text-gray-900">{tour.title}</div>
                                    <div className="text-xs text-gray-500">{tour.date}</div>
                                    {tour.status === 'canceled' && (
                                      <span className="text-red-600 text-xs font-medium mt-0.5 inline-block">
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
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {participant.pickup_location ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {participant.pickup_location}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            
                            {showColumns.includes("객실") && (
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {participant.singsing_rooms?.room_number || "미배정"}
                              </td>
                            )}
                            
                            {showColumns.includes("참여횟수") && (
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <span className={`font-medium ${(participant.join_count || 0) >= 5 ? 'text-blue-600' : 'text-gray-700'}`}>
                                    {participant.join_count || 0}회
                                  </span>
                                  {(participant.join_count || 0) >= 5 && (
                                    <span className="ml-2 text-yellow-600 font-bold text-sm">
                                      VIP
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            
                            {showColumns.includes("결제상태") && (
                              <td className="px-3 py-3 whitespace-nowrap">
                                {participant.paymentSummary && participant.paymentSummary.totalAmount > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      ✅ 결제완료
                                    </span>
                                    {/* 결제자가 본인이 아닌 경우 표시 */}
                                    {participant.paymentSummary.payer_id !== participant.id && participant.paymentSummary.payer_id && (
                                      <span className="text-xs text-gray-600">
                                        (결제자: {participant.paymentSummary.payer_name || '-'})
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-600">
                                      {participant.paymentSummary.totalAmount.toLocaleString()}원
                                    </span>
                                    {/* 여러 건 결제인 경우 표시 */}
                                    {participant.paymentSummary.payments.length > 1 && (
                                      <span className="text-xs text-gray-500">
                                        ({participant.paymentSummary.payments.length}건)
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    미결제
                                  </span>
                                )}
                              </td>
                            )}
                            
                            {showColumns.includes("상태") && (
                              <td className="px-3 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => toggleConfirmation(participant.id)}
                                  className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium transition-colors gap-1.5
                                    ${participant.status === "확정"
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : participant.status === "취소"
                                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'}
                                  `}
                                >
                                  {participant.status === "확정" && <Check className="w-4 h-4 mr-1" />}
                                  {participant.status === "미확정" && <X className="w-4 h-4 mr-1" />}
                                  {participant.status === "취소" && <Ban className="w-4 h-4 mr-1 text-gray-600" />}
                                  {participant.status === "확정" && "확정"}
                                  {participant.status === "미확정" && "미확정"}
                                  {participant.status === "취소" && "취소"}
                                </button>
                              </td>
                            )}
                            
                            {showColumns.includes("메모") && (
                              <td className="px-3 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <QuickMemo 
                                    participantId={participant.id}
                                    tourId={participant.tour_id}
                                    participantName={participant.name}
                                    onSave={fetchParticipants}
                                  />
                                  {(participant.memo_count ?? 0) > 0 && (
                                    <MemoViewer
                                      participantId={participant.id}
                                      participantName={participant.name}
                                      tourId={participant.tour_id}
                                      memoCount={participant.memo_count || 0}
                                      onUpdate={fetchParticipants} // 메모 변경 시 참가자 목록 업데이트
                                    />
                                  )}
                                </div>
                              </td>
                            )}
                            
                            {showColumns.includes("관리") && (
                              <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                                  title="수정"
                                  onClick={() => openModal(participant)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  title="삭제"
                                  onClick={() => handleDelete(participant.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
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
            <div className="mt-6 admin-card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  참가자 현황 요약 {tourId ? '' : (selectedTour ? `(${selectedTour.title})` : '(전체)')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">총 참가자:</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}<span className="text-lg font-medium">명</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">확정:</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}<span className="text-lg font-medium">명</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">미확정:</p>
                    <p className="text-2xl font-bold text-red-600">{stats.unconfirmed}<span className="text-lg font-medium">명</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">취소:</p>
                    <p className="text-2xl font-bold text-gray-500">{stats.canceled}<span className="text-lg font-medium">명</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">VIP (5회 이상):</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.vip}<span className="text-lg font-medium">명</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">결제완료:</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.paid}<span className="text-lg font-medium">명</span>
                      <span className="text-sm text-gray-500 ml-1">({stats.paymentRate}%)</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">미결제:</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.unpaid}<span className="text-lg font-medium">명</span></p>
                  </div>
                </div>
                {/* 현재 필터링된 목록의 통계 - tourId가 있을 때는 필터 시만 표시 */}
                {((tourId && (search || activeTab !== 'all')) || (!tourId && (selectedTour || search || activeTab !== 'all'))) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      현재 표시된 목록: <span className="font-semibold text-gray-900">{stats.currentFiltered}</span>명
                      <span className="mx-2">|</span>
                      확정: <span className="font-semibold text-green-600">{filteredParticipants.filter(p => p.status === "확정").length}</span>
                      <span className="mx-2">·</span>
                      미확정: <span className="font-semibold text-red-600">{filteredParticipants.filter(p => p.status === "미확정").length}</span>
                      <span className="mx-2">·</span>
                      취소: <span className="font-semibold text-gray-500">{filteredParticipants.filter(p => p.status === "취소").length}</span>
                    </p>
                  </div>
                )}
              </div>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    동반자 정보
                  </label>
                  {(form.group_size || 0) > 1 ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {/* 일괄 결제 옵션 */}
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="is_paying_for_group"
                          name="is_paying_for_group"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                          checked={form.is_paying_for_group || false}
                          onChange={handleChange}
                        />
                        <label htmlFor="is_paying_for_group" className="ml-2 block text-sm font-medium text-gray-900">
                          그룹 일괄 결제 (예약자가 그룹 전체 결제)
                        </label>
                      </div>

                      {/* 동반자 입력 필드 */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">동반자 이름 (선택사항)</p>
                        <div className="grid grid-cols-1 gap-2">
                          {Array.from({ length: (form.group_size || 1) - 1 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder={`동반자 ${index + 1} 이름`}
                                className="flex-1 border border-gray-300 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                value={(form.companions && form.companions[index]) || ''}
                                onChange={(e) => handleCompanionChange(index, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newCompanions = [...(form.companions || [])];
                                  newCompanions[index] = '';
                                  setForm({ ...form, companions: newCompanions });
                                }}
                                className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="동반자 이름 지우기"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 일괄 결제 안내 */}
                      {form.is_paying_for_group && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start">
                            <span className="text-blue-600 mt-0.5 mr-2">💳</span>
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                일괄결제 안내
                              </p>
                              <p className="text-xs text-blue-700 leading-relaxed">
                                예약자({form.name || '본인'})가 위 동반자들의 비용을 함께 결제합니다.
                                <br />
                                총 {form.group_size}명의 투어 비용 ({(() => {
                                  const tour = tours.find(t => t.id === (form.tour_id || tourId));
                                  if (tour && tour.price) {
                                    const price = typeof tour.price === 'string' ? parseInt(tour.price) : tour.price;
                                    return `${(price * (form.group_size || 1)).toLocaleString()}원`;
                                  }
                                  return '금액 미정';
                                })()})이 예약자에게 청구됩니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-3">
                        * 동반자 이름은 선택사항입니다. 입력하지 않아도 그룹 인원수는 반영됩니다.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">
                        그룹 인원수를 2명 이상으로 설정하면 동반자 정보를 입력할 수 있습니다.
                      </p>
                    </div>
                  )}

                </div>

                <div className="md:col-span-2">
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
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={closeModal}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
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
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadPreview([]);
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
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
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
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