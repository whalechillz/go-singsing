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
  UserPlus
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
  status?: string;
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
}

interface Tour {
  id: string;
  title: string;
  price: number;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ tourId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState({
    tour_id: tourId || "",
    participant_id: "",
    payer_id: "",
    payment_method: "deposit",
    amount: 0,
    is_group_payment: false,
    receipt_type: "",
    receipt_requested: false,
    status: "pending",
    note: "",
    group_member_ids: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    
    // 투어 정보 가져오기
    const { data: toursData } = await supabase
      .from("singsing_tours")
      .select("id, title, price")
      .order("start_date", { ascending: false });
    
    if (toursData) setTours(toursData);

    // 참가자 정보 가져오기
    let participantsQuery = supabase
      .from("singsing_participants")
      .select("*");
    
    if (tourId) {
      participantsQuery = participantsQuery.eq("tour_id", tourId);
    }
    
    const { data: participantsData } = await participantsQuery
      .order("name", { ascending: true });
    
    if (participantsData) setParticipants(participantsData);

    // 결제 정보 가져오기
    let paymentsQuery = supabase
      .from("singsing_payments")
      .select("*");
    
    if (tourId) {
      paymentsQuery = paymentsQuery.eq("tour_id", tourId);
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
          // 같은 결제자로 묶인 다른 결제들 찾기
          const relatedPayments = paymentsData.filter(p => 
            p.payer_id === payment.payer_id && 
            p.tour_id === payment.tour_id
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.is_group_payment && form.group_member_ids.length > 0) {
      // 그룹 결제 처리
      const tourPrice = tours.find(t => t.id === form.tour_id)?.price || 0;
      const perPersonAmount = tourPrice;
      
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
        note: form.note
      };
      
      if (editingPayment) {
        await supabase
          .from("singsing_payments")
          .update(payload)
          .eq("id", editingPayment.id);
      } else {
        await supabase
          .from("singsing_payments")
          .insert(payload);
      }
    }
    
    setShowModal(false);
    resetForm();
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
      tour_id: tourId || "",
      participant_id: "",
      payer_id: "",
      payment_method: "deposit",
      amount: 0,
      is_group_payment: false,
      receipt_type: "",
      receipt_requested: false,
      status: "pending",
      note: "",
      group_member_ids: []
    });
    setEditingPayment(null);
  };

  const filteredPayments = payments.filter(payment => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        payment.participant?.name.toLowerCase().includes(searchLower) ||
        payment.participant?.phone.includes(search) ||
        payment.payer?.name.toLowerCase().includes(searchLower)
      );
    }
    
    switch (activeTab) {
      case "group":
        return payment.is_group_payment;
      case "individual":
        return !payment.is_group_payment;
      case "receipt":
        return payment.receipt_requested;
      default:
        return true;
    }
  });

  // 통계 계산
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    groupPayments: payments.filter(p => p.is_group_payment).length,
    individualPayments: payments.filter(p => !p.is_group_payment).length,
    receiptRequested: payments.filter(p => p.receipt_requested).length
  };

  const tabs = [
    { id: 'all', label: '전체', count: stats.total },
    { id: 'group', label: '일괄결제', count: stats.groupPayments },
    { id: 'individual', label: '개별결제', count: stats.individualPayments },
    { id: 'receipt', label: '영수증 요청', count: stats.receiptRequested }
  ];

  return (
    <div>
      {/* 상단 컨트롤 */}
      <div className="admin-card mb-4">
        <div className="p-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              {/* 투어 선택 */}
              {!tourId && (
                <select
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.tour_id}
                  onChange={(e) => setForm({ ...form, tour_id: e.target.value })}
                >
                  <option value="">전체 투어</option>
                  {tours.map(tour => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title} ({tour.price.toLocaleString()}원)
                    </option>
                  ))}
                </select>
              )}
              
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
            
            {/* 결제 추가 버튼 */}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-5 h-5" />
              <span>결제 추가</span>
            </button>
          </div>
          
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

      {/* 결제 목록 */}
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">참가자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제방법</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">영수증</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
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
                      {payment.is_group_payment ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {payment.payer?.name || '-'}
                          </span>
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                            일괄결제
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-700">
                          {payment.payer?.name || payment.participant?.name || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {payment.amount.toLocaleString()}원
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {payment.payment_method === 'deposit' ? '계좌이체' : 
                         payment.payment_method === 'card' ? '카드' : 
                         payment.payment_method === 'cash' ? '현금' : '-'}
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
                      <span className="text-sm text-gray-500">
                        {payment.note || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setEditingPayment(payment);
                            setForm({
                              tour_id: payment.tour_id,
                              participant_id: payment.participant_id,
                              payer_id: payment.payer_id,
                              payment_method: payment.payment_method || 'deposit',
                              amount: payment.amount,
                              is_group_payment: payment.is_group_payment,
                              receipt_type: payment.receipt_type || '',
                              receipt_requested: payment.receipt_requested,
                              status: 'pending',
                              note: payment.note || '',
                              group_member_ids: []
                            });
                            setShowModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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

      {/* 통계 요약 */}
      <div className="mt-6 admin-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            결제 현황 요약
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">총 결제 건수:</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total}<span className="text-lg font-medium">건</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">총 결제 금액:</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalAmount.toLocaleString()}<span className="text-lg font-medium">원</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">일괄결제:</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.groupPayments}<span className="text-lg font-medium">건</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">영수증 요청:</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.receiptRequested}<span className="text-lg font-medium">건</span>
              </p>
            </div>
          </div>
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
                {!tourId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      투어 *
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.tour_id}
                      onChange={(e) => setForm({ ...form, tour_id: e.target.value })}
                      required
                    >
                      <option value="">투어 선택</option>
                      {tours.map(tour => (
                        <option key={tour.id} value={tour.id}>
                          {tour.title} ({tour.price.toLocaleString()}원)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 결제 유형 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결제 유형
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment_type"
                        checked={!form.is_group_payment}
                        onChange={() => setForm({ ...form, is_group_payment: false })}
                      />
                      <span className="ml-2">개별 결제</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment_type"
                        checked={form.is_group_payment}
                        onChange={() => setForm({ ...form, is_group_payment: true })}
                      />
                      <span className="ml-2">일괄 결제</span>
                    </label>
                  </div>
                </div>

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
                            {participant.name} ({participant.phone})
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
                        onChange={(e) => setForm({ ...form, payer_id: e.target.value })}
                        required
                      >
                        <option value="">결제자 선택</option>
                        {participants
                          .filter(p => !form.tour_id || p.tour_id === form.tour_id)
                          .map(participant => (
                            <option key={participant.id} value={participant.id}>
                              {participant.name} ({participant.phone})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        그룹 멤버 선택 *
                      </label>
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
                                {participant.name} ({participant.phone})
                              </span>
                            </label>
                          ))}
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
                    <option value="deposit">계좌이체</option>
                    <option value="card">카드</option>
                    <option value="cash">현금</option>
                  </select>
                </div>

                {/* 금액 */}
                {!form.is_group_payment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      금액
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                      placeholder="금액을 입력하세요"
                    />
                  </div>
                )}

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
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 mt-2"
                      placeholder="영수증 종류 (예: 세금계산서, 현금영수증)"
                      value={form.receipt_type}
                      onChange={(e) => setForm({ ...form, receipt_type: e.target.value })}
                    />
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
    </div>
  );
};

export default PaymentManager;