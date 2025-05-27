"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  CreditCard, 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Receipt,
  DollarSign,
  UserPlus,
  AlertCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  FileText,
  Download,
  ChevronDown,
  Calculator,
  Calendar
} from 'lucide-react';

interface PaymentManagerProps {
  tourId?: string;
}

interface Payment {
  id: string;
  tour_id: string;
  participant_id: string;
  payer_id: string;
  payment_method: string;
  amount: number;
  is_group_payment: boolean;
  receipt_type: string;
  receipt_requested: boolean;
  payment_type?: string;
  payment_status?: string;
  payment_date?: string;
  note: string;
  created_at: string;
  participant?: Participant;
  payer?: Participant;
  group_members?: Participant[];
}

interface Participant {
  id: string;
  name: string;
  phone: string;
  team_name?: string;
  is_paying_for_group?: boolean;
  companions?: string[];
  group_size?: number;
  tour_id?: string;
}

interface Tour {
  id: string;
  title: string;
  price: string | number;
  start_date: string;
  end_date: string;
}

const PaymentManagerV3: React.FC<PaymentManagerProps> = ({ tourId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [refundingPayment, setRefundingPayment] = useState<Payment | null>(null);
  const [selectedTourId, setSelectedTourId] = useState(tourId || "");
  const [amountInputMode, setAmountInputMode] = useState<'preset' | 'custom'>('preset');
  const [customPercentage, setCustomPercentage] = useState(30);
  const [form, setForm] = useState({
    tour_id: tourId || "",
    participant_id: "",
    payer_id: "",
    payment_method: "bank",
    amount: 0,
    is_group_payment: false,
    receipt_type: "",
    receipt_requested: false,
    payment_type: "deposit",
    payment_status: "completed",
    payment_date: new Date().toISOString().split('T')[0],
    note: "",
    group_member_ids: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, [selectedTourId]);

  const fetchData = async () => {
    setLoading(true);
    
    // 현재 선택된 투어 ID 저장
    const currentTourId = selectedTourId;
    
    // 투어 정보 가져오기
    const { data: toursData } = await supabase
      .from("singsing_tours")
      .select("id, title, price, start_date, end_date")
      .order("start_date", { ascending: false });
    
    if (toursData) setTours(toursData);

    // 참가자 정보 가져오기
    let participantsQuery = supabase
      .from("singsing_participants")
      .select("*");
    
    if (selectedTourId) {
      participantsQuery = participantsQuery.eq("tour_id", selectedTourId);
    }
    
    const { data: participantsData } = await participantsQuery
      .order("name", { ascending: true });
    
    if (participantsData) setParticipants(participantsData);

    // 결제 정보 가져오기
    let paymentsQuery = supabase
      .from("singsing_payments")
      .select("*");
    
    if (selectedTourId) {
      paymentsQuery = paymentsQuery.eq("tour_id", selectedTourId);
    }
    
    const { data: paymentsData } = await paymentsQuery
      .order("created_at", { ascending: false });
    
    if (paymentsData) {
      // 참가자 정보와 결합
      const enrichedPayments = paymentsData.map(payment => {
        const participant = participantsData?.find(p => p.id === payment.participant_id);
        const payer = participantsData?.find(p => p.id === payment.payer_id);
        
        // 그룹 결제인 경우 그룹 멤버 찾기
        let group_members: Participant[] = [];
        if (payment.is_group_payment && payer) {
          const relatedPayments = paymentsData.filter(p => 
            p.payer_id === payment.payer_id && 
            p.tour_id === payment.tour_id &&
            p.payment_type === payment.payment_type &&
            p.payment_status !== 'cancelled'
          );
          
          group_members = relatedPayments
            .map(rp => participantsData?.find(p => p.id === rp.participant_id))
            .filter(Boolean) as Participant[];
        }
        
        return {
          ...payment,
          participant,
          payer,
          group_members
        };
      });
      
      setPayments(enrichedPayments);
    }
    
    setLoading(false);
    
    // 선택된 투어 유지
    if (currentTourId) {
      setSelectedTourId(currentTourId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 결제 금액 검증
    if (!editingPayment && form.participant_id) {
      const participant = participants.find(p => p.id === form.participant_id);
      const tour = tours.find(t => t.id === form.tour_id);
      if (participant && tour) {
        const tourPrice = Number(tour.price);
        const existingPayments = payments.filter(p => 
          p.participant_id === form.participant_id && 
          p.payment_status !== 'cancelled' && 
          p.payment_status !== 'refunded'
        );
        const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalAfterPayment = totalPaid + form.amount;
        
        if (totalAfterPayment > tourPrice) {
          const remaining = tourPrice - totalPaid;
          alert(`결제 금액이 투어 가격을 초과합니다.\n\n투어 가격: ${tourPrice.toLocaleString()}원\n기납부액: ${totalPaid.toLocaleString()}원\n잔여금액: ${remaining.toLocaleString()}원\n\n최대 ${remaining.toLocaleString()}원까지만 결제 가능합니다.`);
          return;
        }
      }
    }
    
    // 일괄결제인 경우 각 참가자별 검증
    if (!editingPayment && form.is_group_payment && form.group_member_ids.length > 0) {
      const tour = tours.find(t => t.id === form.tour_id);
      if (tour) {
        const tourPrice = Number(tour.price);
        let hasExceeded = false;
        let exceededMembers: string[] = [];
        
        for (const memberId of form.group_member_ids) {
          const existingPayments = payments.filter(p => 
            p.participant_id === memberId && 
            p.payment_status !== 'cancelled' && 
            p.payment_status !== 'refunded'
          );
          const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
          const totalAfterPayment = totalPaid + form.amount;
          
          if (totalAfterPayment > tourPrice) {
            hasExceeded = true;
            const participant = participants.find(p => p.id === memberId);
            if (participant) {
              exceededMembers.push(`${participant.name} (잔액: ${(tourPrice - totalPaid).toLocaleString()}원)`);
            }
          }
        }
        
        if (hasExceeded) {
          alert(`다음 참가자들의 결제 금액이 투어 가격을 초과합니다:\n\n${exceededMembers.join('\n')}\n\n결제 금액을 조정해주세요.`);
          return;
        }
      }
    }
    
    // 수정 모드일 때
    if (editingPayment) {
      // 일괄결제 수정인 경우
      if (form.is_group_payment && form.group_member_ids.length > 0) {
        // 기존의 같은 그룹 결제들을 모두 찾아서 업데이트
        const relatedPayments = payments.filter(p => 
          p.payer_id === editingPayment.payer_id && 
          p.tour_id === editingPayment.tour_id &&
          p.payment_type === editingPayment.payment_type &&
          p.created_at === editingPayment.created_at && // 같은 시점에 생성된 결제들
          p.payment_status !== 'cancelled'
        );
        
        // 모든 관련 결제 업데이트
        const updatePromises = relatedPayments.map(payment => 
          supabase.from("singsing_payments").update({
            payment_method: form.payment_method,
            amount: form.amount,
            receipt_type: form.receipt_type,
            receipt_requested: form.receipt_requested,
            payment_status: form.payment_status,
            payment_date: form.payment_date,
            note: form.note
          }).eq("id", payment.id)
        );
        
        await Promise.all(updatePromises);
      } else {
        // 개별 결제 수정
        const payload = {
          tour_id: form.tour_id,
          participant_id: form.participant_id,
          payer_id: form.payer_id || form.participant_id,
          payment_method: form.payment_method,
          amount: form.amount,
          is_group_payment: false,
          receipt_type: form.receipt_type,
          receipt_requested: form.receipt_requested,
          payment_type: form.payment_type,
          payment_status: form.payment_status,
          payment_date: form.payment_date,
          note: form.note
        };
        
        await supabase
          .from("singsing_payments")
          .update(payload)
          .eq("id", editingPayment.id);
      }
    } else {
      // 새로운 결제 추가
      if (form.is_group_payment && form.group_member_ids.length > 0) {
        // 그룹 결제 처리
        const perPersonAmount = form.amount; // 입력한 금액을 그대로 사용
        
        // 각 그룹 멤버에 대해 결제 레코드 생성
        const paymentPromises = form.group_member_ids.map(memberId => 
          supabase.from("singsing_payments").insert({
            tour_id: form.tour_id,
            participant_id: memberId,
            payer_id: form.payer_id,
            payment_method: form.payment_method,
            amount: perPersonAmount,
            is_group_payment: true,
            receipt_type: form.receipt_type,
            receipt_requested: form.receipt_requested,
            payment_type: form.payment_type,
            payment_status: form.payment_status,
            payment_date: form.payment_date,
            note: form.note
          })
        );
        
        await Promise.all(paymentPromises);
      } else {
        // 개별 결제 처리
        const payload = {
          tour_id: form.tour_id,
          participant_id: form.participant_id,
          payer_id: form.payer_id || form.participant_id,
          payment_method: form.payment_method,
          amount: form.amount,
          is_group_payment: false,
          receipt_type: form.receipt_type,
          receipt_requested: form.receipt_requested,
          payment_type: form.payment_type,
          payment_status: form.payment_status,
          payment_date: form.payment_date,
          note: form.note
        };
        
        await supabase
          .from("singsing_payments")
          .insert(payload);
      }
    }
    
    setShowModal(false);
    resetForm();
    await fetchData();
    // 선택된 투어 유지
    if (selectedTourId) {
      setSelectedTourId(selectedTourId);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingPayment) return;
    
    await supabase
      .from("singsing_payments")
      .update({ 
        payment_status: 'refunded',
        note: `환불 처리: ${form.note || '환불 요청'}`
      })
      .eq("id", refundingPayment.id);
    
    setShowRefundModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    await supabase
      .from("singsing_payments")
      .delete()
      .eq("id", id);
    
    fetchData();
  };

  const resetForm = () => {
    setForm({
      tour_id: selectedTourId || "",
      participant_id: "",
      payer_id: "",
      payment_method: "bank",
      amount: 0,
      is_group_payment: false,
      receipt_type: "",
      receipt_requested: false,
      payment_type: "deposit",
      payment_status: "completed",
      payment_date: new Date().toISOString().split('T')[0],
      note: "",
      group_member_ids: []
    });
    setEditingPayment(null);
    setAmountInputMode('preset');
    setCustomPercentage(30);
  };

  const calculateAmount = (tourPrice: number, percentage: number) => {
    return Math.floor(tourPrice * (percentage / 100));
  };

  // 빠른 금액 설정 버튼
  const quickAmountButtons = [
    { label: '10만원+', action: 'add', amount: 100000 },
    { label: '5만원+', action: 'add', amount: 50000 },
    { label: '1만원+', action: 'add', amount: 10000 }
  ];

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3" /> 완료
        </span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" /> 대기
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <X className="w-3 h-3" /> 취소
        </span>;
      case 'refunded':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <RefreshCw className="w-3 h-3" /> 환불
        </span>;
      default:
        return null;
    }
  };

  const getPaymentTypeBadge = (type?: string) => {
    switch (type) {
      case 'deposit':
        return <span className="text-xs font-medium text-blue-600">계약금</span>;
      case 'balance':
        return <span className="text-xs font-medium text-orange-600">잔금</span>;
      case 'full':
        return <span className="text-xs font-medium text-green-600">전액</span>;
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter(payment => {
    // 투어 필터링
    if (selectedTourId && payment.tour_id !== selectedTourId) {
      return false;
    }
    
    // 검색 필터링
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = (
        payment.participant?.name.toLowerCase().includes(searchLower) ||
        payment.participant?.phone.includes(search) ||
        payment.payer?.name.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }
    
    // 탭 필터링
    switch (activeTab) {
      case "deposit":
        return payment.payment_type === 'deposit';
      case "balance":
        return payment.payment_type === 'balance';
      case "completed":
        return payment.payment_status === 'completed';
      case "pending":
        return payment.payment_status === 'pending';
      case "refunded":
        return payment.payment_status === 'refunded';
      default:
        return true;
    }
  });

  // 통계 계산 (선택된 투어 필터링 적용)
  const filteredPaymentsForStats = selectedTourId 
    ? payments.filter(p => p.tour_id === selectedTourId)
    : payments;
    
  const stats = {
    total: filteredPaymentsForStats.length,
    totalAmount: filteredPaymentsForStats.filter(p => p.payment_status !== 'refunded').reduce((sum, p) => sum + p.amount, 0),
    depositAmount: filteredPaymentsForStats.filter(p => p.payment_type === 'deposit' && p.payment_status !== 'refunded').reduce((sum, p) => sum + p.amount, 0),
    balanceAmount: filteredPaymentsForStats.filter(p => p.payment_type === 'balance' && p.payment_status !== 'refunded').reduce((sum, p) => sum + p.amount, 0),
    completedCount: filteredPaymentsForStats.filter(p => p.payment_status === 'completed').length,
    pendingCount: filteredPaymentsForStats.filter(p => p.payment_status === 'pending').length,
    refundedCount: filteredPaymentsForStats.filter(p => p.payment_status === 'refunded').length,
    refundedAmount: filteredPaymentsForStats.filter(p => p.payment_status === 'refunded').reduce((sum, p) => sum + p.amount, 0)
  };

  // 참가자별 결제 현황 계산 (선택된 투어로 필터링)
  const filteredParticipants = selectedTourId 
    ? participants.filter(p => p.tour_id === selectedTourId)
    : participants;
    
  const participantPaymentStatus = filteredParticipants.map(participant => {
    const participantPayments = payments.filter(p => p.participant_id === participant.id && p.payment_status !== 'refunded');
    const depositPayments = participantPayments.filter(p => p.payment_type === 'deposit');
    const balancePayments = participantPayments.filter(p => p.payment_type === 'balance');
    const fullPayments = participantPayments.filter(p => p.payment_type === 'full');
    const totalPaid = participantPayments.reduce((sum, p) => sum + p.amount, 0);
    const tourPrice = Number(tours.find(t => t.id === participant.tour_id)?.price || 0);
    
    return {
      participant,
      depositAmount: depositPayments.reduce((sum, p) => sum + p.amount, 0),
      balanceAmount: balancePayments.reduce((sum, p) => sum + p.amount, 0),
      fullAmount: fullPayments.reduce((sum, p) => sum + p.amount, 0),
      totalPaid,
      tourPrice,
      remainingAmount: tourPrice - totalPaid,
      isFullyPaid: totalPaid >= tourPrice,
      hasDeposit: depositPayments.length > 0,
      hasBalance: balancePayments.length > 0,
      hasFull: fullPayments.length > 0
    };
  });

  const unpaidCount = participantPaymentStatus.filter(p => p.totalPaid === 0).length;
  const partiallyPaidCount = participantPaymentStatus.filter(p => p.totalPaid > 0 && p.totalPaid < p.tourPrice).length;
  const fullyPaidCount = participantPaymentStatus.filter(p => p.isFullyPaid).length;
  
  // 미납 금액 계산 수정 - 실제 예상 매출에서 총 수입을 뺀 값
  const totalExpectedRevenue = selectedTourId && tours.find(t => t.id === selectedTourId)
    ? Number(tours.find(t => t.id === selectedTourId)?.price || 0) * filteredParticipants.length
    : participantPaymentStatus.reduce((sum, p) => sum + p.tourPrice, 0);
  const totalUnpaidAmount = totalExpectedRevenue - stats.totalAmount;

  const tabs = [
    { id: 'all', label: '전체', count: stats.total },
    { id: 'deposit', label: '계약금', count: filteredPaymentsForStats.filter(p => p.payment_type === 'deposit').length },
    { id: 'balance', label: '잔금', count: filteredPaymentsForStats.filter(p => p.payment_type === 'balance').length },
    { id: 'completed', label: '완료', count: stats.completedCount },
    { id: 'pending', label: '대기', count: stats.pendingCount },
    { id: 'refunded', label: '환불', count: stats.refundedCount },
  ];

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };
  
  // 천단위 콤마 표시 함수
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div>
      {/* 투어 요약 정보 */}
      {selectedTourId && tours.find(t => t.id === selectedTourId) && (() => {
        const selectedTour = tours.find(t => t.id === selectedTourId);
        
        return (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTour?.title}
                </h3>
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {selectedTour?.start_date && selectedTour?.end_date && (
                    <span className="text-blue-700 font-medium">
                      {formatDate(selectedTour.start_date)} ~ {formatDate(selectedTour.end_date)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">수금 진행률</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((stats.totalAmount / totalExpectedRevenue) * 100))}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round((stats.totalAmount / totalExpectedRevenue) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 상단 컨트롤 */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="p-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              {/* 투어 선택 */}
              <select
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTourId}
                onChange={(e) => setSelectedTourId(e.target.value)}
              >
                <option value="">전체 투어</option>
                {tours.map(tour => {
                  return (
                    <option key={tour.id} value={tour.id}>
                      {tour.title} ({formatDate(tour.start_date)}~{formatDate(tour.end_date)}) - {Number(tour.price).toLocaleString()}원
                    </option>
                  );
                })}
              </select>
              
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="이름, 전화번호로 검색..."
                  className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* 엑셀 다운로드 */}
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200">
                <Download className="w-5 h-5" />
                <span>엑셀 다운로드</span>
              </button>
              
              {/* 결제 추가 버튼 */}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-5 h-5" />
                <span>결제 추가</span>
              </button>
            </div>
          </div>
          
          {/* 탭 */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-3 font-medium text-sm transition-all duration-200 relative whitespace-nowrap ${
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

      {/* 참가자별 결제 현황 */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              결제 현황
            </h3>
            {selectedTourId && tours.find(t => t.id === selectedTourId) && (
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                2박3일 순천버스핑 ({formatDate(tours.find(t => t.id === selectedTourId)!.start_date)} 출발)
              </div>
            )}
          </div>
          
          {/* 첫 번째 줄: 상품가, 총수입, 계약금, 잔금 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">상품가</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedTourId && tours.find(t => t.id === selectedTourId) 
                      ? Number(tours.find(t => t.id === selectedTourId)?.price || 0).toLocaleString() 
                      : '---'}원
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    총 인원: {filteredParticipants.length}명
                  </p>
                </div>
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 수입</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalAmount.toLocaleString()}원</p>
                  {selectedTourId && tours.find(t => t.id === selectedTourId) && (() => {
                    const collectionRate = totalExpectedRevenue > 0 ? Math.round((stats.totalAmount / totalExpectedRevenue) * 100) : 0;
                    return <p className="text-xs text-gray-500 mt-1">수금률: {collectionRate}%</p>;
                  })()}
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">계약금</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.depositAmount.toLocaleString()}원</p>
                  <p className="text-xs text-gray-500 mt-1">{filteredPaymentsForStats.filter(p => p.payment_type === 'deposit' && p.payment_status !== 'refunded').length}건</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">잔금</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.balanceAmount.toLocaleString()}원</p>
                  <p className="text-xs text-gray-500 mt-1">{filteredPaymentsForStats.filter(p => p.payment_type === 'balance' && p.payment_status !== 'refunded').length}건</p>
                </div>
                <Calculator className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
          
          {/* 두 번째 줄: 완납, 미수금, 환불, 미납 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">완납</p>
                  <p className="text-2xl font-bold text-green-900">{fullyPaidCount}명</p>
                  <p className="text-xs text-green-600 mt-1">
                    {participantPaymentStatus.filter(p => p.isFullyPaid).reduce((sum, p) => sum + p.totalPaid, 0).toLocaleString()}원
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">미수금</p>
                  <p className="text-2xl font-bold text-orange-900">{partiallyPaidCount}명</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {participantPaymentStatus.filter(p => p.totalPaid > 0 && !p.isFullyPaid).reduce((sum, p) => sum + p.remainingAmount, 0).toLocaleString()}원
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">환불</p>
                  <p className="text-2xl font-bold text-red-900">{stats.refundedCount}건</p>
                  <p className="text-xs text-red-600 mt-1">{stats.refundedAmount.toLocaleString()}원</p>
                </div>
                <RefreshCw className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">미납</p>
                  <p className="text-2xl font-bold text-gray-900">{unpaidCount}명</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {totalUnpaidAmount.toLocaleString()}원
                  </p>
                </div>
                <X className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
          
          {/* 세 번째 줄: 참가자 요약 및 예상 매출 */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">완납</p>
                <p className="text-lg font-bold text-green-700">{fullyPaidCount}명</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">부분납부</p>
                <p className="text-lg font-bold text-orange-700">{partiallyPaidCount}명</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">미납</p>
                <p className="text-lg font-bold text-red-700">{unpaidCount}명</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">예상 매출</p>
                <p className="text-lg font-bold text-gray-900">{totalExpectedRevenue.toLocaleString()}원</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 목록 */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">참가자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 정보</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">구분</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">영수증</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.participant?.name || '-'}
                        </div>
                        {payment.participant?.phone && (
                          <div className="text-sm text-gray-500">
                            {payment.participant.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          {payment.is_group_payment ? (
                            <>
                              <span className="font-medium text-gray-900">
                                {payment.payer?.name || '-'}
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                일괄결제
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-700">개별결제</span>
                          )}
                        </div>
                        <div className="text-gray-500 mt-1">
                          {payment.payment_method === 'bank' && '계좌이체'}
                          {payment.payment_method === 'card' && '카드'}
                          {payment.payment_method === 'cash' && '현금'}
                        </div>
                        {payment.payment_status === 'refunded' && payment.note && (
                          <div className="text-xs text-red-600 mt-1">
                            {payment.note}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {payment.amount.toLocaleString()}원
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getPaymentTypeBadge(payment.payment_type)}
                    </td>
                    <td className="px-4 py-3">
                      {getPaymentStatusBadge(payment.payment_status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {payment.receipt_requested ? (
                        <div className="flex items-center gap-1">
                          <Receipt className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            {payment.receipt_type || '요청'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {payment.payment_status !== 'refunded' && (
                          <>
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setEditingPayment(payment);
                                let groupMemberIds: string[] = [];
                                if (payment.is_group_payment && payment.payer_id) {
                                  groupMemberIds = payments
                                    .filter(p => 
                                      p.payer_id === payment.payer_id && 
                                      p.tour_id === payment.tour_id &&
                                      p.payment_type === payment.payment_type &&
                                      p.payment_status !== 'cancelled'
                                    )
                                    .map(p => p.participant_id);
                                }
                                
                                setForm({
                                  tour_id: payment.tour_id,
                                  participant_id: payment.participant_id,
                                  payer_id: payment.payer_id,
                                  payment_method: payment.payment_method || 'bank',
                                  amount: payment.amount,
                                  is_group_payment: payment.is_group_payment,
                                  receipt_type: payment.receipt_type || '',
                                  receipt_requested: payment.receipt_requested,
                                  payment_type: payment.payment_type || 'deposit',
                                  payment_status: payment.payment_status || 'completed',
                                  payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
                                  note: payment.note || '',
                                  group_member_ids: groupMemberIds
                                });
                                setShowModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {payment.payment_status === 'completed' && (
                              <button
                                className="text-orange-600 hover:text-orange-800"
                                onClick={() => {
                                  setRefundingPayment(payment);
                                  setShowRefundModal(true);
                                }}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(payment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 결제 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingPayment ? '결제 정보 수정' : '새 결제 추가'}
              </h3>
              <button onClick={() => {
                setShowModal(false);
                resetForm();
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* 투어 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    투어 *
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.tour_id}
                    onChange={(e) => {
                      const tourId = e.target.value;
                      setForm({ ...form, tour_id: tourId });
                    }}
                    required
                    disabled={!!editingPayment}
                  >
                    <option value="">투어 선택</option>
                    {tours.map(tour => {
                      return (
                        <option key={tour.id} value={tour.id}>
                          {tour.title} ({formatDate(tour.start_date)}~{formatDate(tour.end_date)}) - {Number(tour.price).toLocaleString()}원
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 결제 구분 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결제 구분 *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment_type"
                        value="deposit"
                        checked={form.payment_type === 'deposit'}
                        onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                      />
                      <span className="ml-2">계약금</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment_type"
                        value="balance"
                        checked={form.payment_type === 'balance'}
                        onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                      />
                      <span className="ml-2">잔금</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment_type"
                        value="full"
                        checked={form.payment_type === 'full'}
                        onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                      />
                      <span className="ml-2">전액</span>
                    </label>
                  </div>
                </div>

                {/* 결제 유형 */}
                {!editingPayment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      결제 유형
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="group_payment"
                          checked={!form.is_group_payment}
                          onChange={() => setForm({ ...form, is_group_payment: false })}
                        />
                        <span className="ml-2">개별 결제</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="group_payment"
                          checked={form.is_group_payment}
                          onChange={() => setForm({ ...form, is_group_payment: true })}
                        />
                        <span className="ml-2">일괄 결제</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* 수정 모드에서 일괄결제인 경우 안내 메시지 */}
                {editingPayment && form.is_group_payment && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>일괄결제 수정</strong>: 이 그룹의 모든 결제 내역이 함께 수정됩니다.
                    </p>
                    {(() => {
                      const relatedPayments = payments.filter(p => 
                        p.payer_id === editingPayment.payer_id && 
                        p.tour_id === editingPayment.tour_id &&
                        p.payment_type === editingPayment.payment_type &&
                        p.created_at === editingPayment.created_at &&
                        p.payment_status !== 'cancelled'
                      );
                      return (
                        <p className="text-xs text-yellow-700 mt-1">
                          영향받는 참가자: {relatedPayments.map(p => p.participant?.name).filter(Boolean).join(', ')}
                        </p>
                      );
                    })()}
                  </div>
                )}

                {/* 개별 결제 */}
                {!form.is_group_payment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      참가자 *
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.participant_id}
                      onChange={(e) => setForm({ ...form, participant_id: e.target.value })}
                      required
                    >
                      <option value="">참가자 선택</option>
                      {participants
                        .filter(p => !form.tour_id || p.tour_id === form.tour_id)
                        .map(participant => (
                          <option key={participant.id} value={participant.id}>
                            {participant.name} {participant.phone ? `(${participant.phone})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* 일괄 결제 */}
                {form.is_group_payment && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        결제자 (대표자) *
                      </label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={form.payer_id}
                        onChange={(e) => {
                          const payerId = e.target.value;
                          setForm({ ...form, payer_id: payerId });
                          
                          // 선택한 결제자가 그룹 일괄 결제로 설정되어 있으면 자동으로 그룹 멤버 선택
                          const payer = participants.find(p => p.id === payerId);
                          if (payer && payer.is_paying_for_group && payer.group_size && payer.group_size > 1) {
                            const tourParticipants = participants.filter(p => 
                              p.tour_id === payer.tour_id
                            );
                            
                            const groupMembers: string[] = [payerId];
                            
                            if (payer.companions && payer.companions.length > 0) {
                              payer.companions.forEach(companionName => {
                                if (companionName && companionName.trim()) {
                                  const companion = tourParticipants.find(p => 
                                    p.name === companionName.trim()
                                  );
                                  if (companion) {
                                    groupMembers.push(companion.id);
                                  }
                                }
                              });
                            }
                            
                            // 부족한 인원 채우기
                            if (groupMembers.length < (payer.group_size || 1)) {
                              const payerIndex = tourParticipants.findIndex(p => p.id === payerId);
                              if (payerIndex !== -1) {
                                for (let i = 1; groupMembers.length < (payer.group_size || 1) && (payerIndex + i) < tourParticipants.length; i++) {
                                  const nextParticipant = tourParticipants[payerIndex + i];
                                  if (nextParticipant && !groupMembers.includes(nextParticipant.id)) {
                                    groupMembers.push(nextParticipant.id);
                                  }
                                }
                              }
                            }
                            
                            setForm(prev => ({ ...prev, group_member_ids: groupMembers }));
                          }
                        }}
                        required
                      >
                        <option value="">결제자 선택</option>
                        {participants
                          .filter(p => !form.tour_id || p.tour_id === form.tour_id)
                          .map(participant => (
                            <option key={participant.id} value={participant.id}>
                              {participant.name} {participant.phone ? `(${participant.phone})` : ''}
                              {participant.is_paying_for_group && participant.group_size && participant.group_size > 1 && 
                                ` [그룹 ${participant.group_size}명]`
                              }
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        그룹 멤버 선택 *
                      </label>
                      
                      {form.payer_id && (() => {
                        const payer = participants.find(p => p.id === form.payer_id);
                        if (payer && payer.is_paying_for_group && payer.group_size && payer.group_size > 1) {
                          return (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg text-sm">
                              <p className="font-medium text-blue-900 mb-1">💡 참가자 관리에서 설정한 그룹 정보</p>
                              <p className="text-blue-700">
                                {payer.name}님이 총 {payer.group_size}명의 일괄 결제로 설정되어 있습니다.
                                {payer.companions && payer.companions.filter(c => c).length > 0 && (
                                  <>
                                    <br />
                                    동반자: {payer.companions.filter(c => c).join(', ')}
                                  </>
                                )}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                        {participants
                          .filter(p => !form.tour_id || p.tour_id === form.tour_id)
                          .map(participant => (
                            <label key={participant.id} className="flex items-center py-1">
                              <input
                                type="checkbox"
                                value={participant.id}
                                checked={form.group_member_ids.includes(participant.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setForm({
                                      ...form,
                                      group_member_ids: [...form.group_member_ids, participant.id]
                                    });
                                  } else {
                                    setForm({
                                      ...form,
                                      group_member_ids: form.group_member_ids.filter(id => id !== participant.id)
                                    });
                                  }
                                }}
                              />
                              <span className="ml-2">
                                {participant.name} {participant.phone ? `(${participant.phone})` : ''}
                                {participant.id === form.payer_id && (
                                  <span className="ml-2 text-xs text-green-600 font-medium">
                                    (결제자)
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        선택된 인원: <span className="font-medium">{form.group_member_ids.length}명</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 결제 방법 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결제 방법
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  >
                    <option value="bank">계좌이체</option>
                    <option value="card">카드</option>
                    <option value="cash">현금</option>
                  </select>
                </div>

                {/* 금액 설정 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    금액 설정
                  </label>
                  
                  {/* 빠른 금액 버튼 */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {quickAmountButtons.slice(0, 3).map(btn => (
                      <button
                        key={btn.label}
                        type="button"
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50`}
                        onClick={() => {
                          if (btn.action === 'add' && btn.amount) {
                            setForm({ ...form, amount: form.amount + btn.amount });
                          }
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* 현재 금액 표시 및 초기화 버튼 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-center">
                      <span className="text-sm text-gray-600">현재 금액: </span>
                      <span className="text-lg font-bold text-gray-900">{form.amount.toLocaleString()}원</span>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium"
                      onClick={() => setForm({ ...form, amount: 0 })}
                    >
                      초기화
                    </button>
                  </div>

                  {/* 비율 입력 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">투어 가격의</span>
                    <input
                      type="number"
                      className="w-20 border rounded px-2 py-1 text-center"
                      value={customPercentage}
                      onChange={(e) => {
                        const percentage = Number(e.target.value);
                        setCustomPercentage(percentage);
                        const tour = tours.find(t => t.id === form.tour_id);
                        if (tour && percentage > 0) {
                          const amount = calculateAmount(Number(tour.price), percentage);
                          setForm({ ...form, amount });
                        }
                      }}
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-gray-600">%</span>
                    <button
                      type="button"
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                      onClick={() => {
                        const tour = tours.find(t => t.id === form.tour_id);
                        if (tour && customPercentage > 0) {
                          const amount = calculateAmount(Number(tour.price), customPercentage);
                          setForm({ ...form, amount });
                        }
                      }}
                    >
                      계산
                    </button>
                  </div>

                  {/* 직접 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      금액 직접 입력
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.amount ? formatNumber(form.amount) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setForm({ ...form, amount: Number(value) });
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0') {
                          e.target.value = '';
                        }
                      }}
                      placeholder="금액을 입력하세요"
                    />
                    {form.tour_id && (() => {
                      const tour = tours.find(t => t.id === form.tour_id);
                      const tourPrice = Number(tour?.price || 0);
                      if (tourPrice > 0 && form.amount > 0) {
                        const percentage = Math.round((form.amount / tourPrice) * 100);
                        return (
                          <p className="mt-1 text-sm text-gray-500">
                            투어 가격 {tourPrice.toLocaleString()}원의 {percentage}%
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* 결제 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결제 상태
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.payment_status}
                    onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                  >
                    <option value="completed">완료</option>
                    <option value="pending">대기</option>
                    <option value="cancelled">취소</option>
                  </select>
                </div>

                {/* 결제일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결제일
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.payment_date}
                    onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                  />
                </div>

                {/* 영수증 */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.receipt_requested}
                      onChange={(e) => setForm({ ...form, receipt_requested: e.target.checked })}
                    />
                    <span className="ml-2">영수증 발행 요청</span>
                  </label>
                  {form.receipt_requested && (
                    <select
                      className="w-full border rounded-lg px-3 py-2 mt-2"
                      value={form.receipt_type}
                      onChange={(e) => setForm({ ...form, receipt_type: e.target.value })}
                    >
                      <option value="">영수증 종류 선택</option>
                      <option value="tax_invoice">세금계산서</option>
                      <option value="cash_receipt">현금영수증</option>
                      <option value="simple_receipt">간이영수증</option>
                    </select>
                  )}
                </div>

                {/* 메모 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    메모
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="추가 메모사항"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-white text-gray-700 border rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPayment ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 환불 모달 */}
      {showRefundModal && refundingPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">환불 처리</h3>
              <button onClick={() => setShowRefundModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRefund}>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>주의:</strong> 환불 처리는 취소할 수 없습니다.
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">참가자</p>
                  <p className="font-medium">{refundingPayment.participant?.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">환불 금액</p>
                  <p className="font-medium text-red-600">
                    {refundingPayment.amount.toLocaleString()}원
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    환불 사유 및 환불 계좌 정보
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="환불 사유를 입력하세요&#10;예) 개인 사정으로 취소&#10;환불 계좌: 신한 홍길동 110-123-456789"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    환불 계좌 정보를 함께 입력하면 환불 처리에 도움이 됩니다.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-white text-gray-700 border rounded-lg hover:bg-gray-50"
                  onClick={() => setShowRefundModal(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  환불 처리
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagerV3;