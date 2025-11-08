"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  X
} from "lucide-react";

interface TourSettlementManagerProps {
  tourId: string;
  tour: any;
}

interface TourExpenses {
  id?: string;
  tour_id: string;
  golf_course_settlement?: any[];
  golf_course_total?: number;
  bus_cost?: number;
  bus_driver_cost?: number;
  toll_fee?: number;
  parking_fee?: number;
  bus_notes?: string;
  guide_fee?: number;
  guide_meal_cost?: number;
  guide_accommodation_cost?: number;
  guide_other_cost?: number;
  guide_notes?: string;
  meal_expenses?: any[];
  meal_expenses_total?: number;
  accommodation_cost?: number;
  restaurant_cost?: number;
  attraction_fee?: number;
  insurance_cost?: number;
  other_expenses?: any[];
  other_expenses_total?: number;
  total_cost?: number;
  notes?: string;
}

interface TourSettlement {
  id?: string;
  tour_id: string;
  contract_revenue?: number;
  total_paid_amount?: number;
  refunded_amount?: number;
  settlement_amount?: number;
  total_cost?: number;
  margin?: number;
  margin_rate?: number;
  status?: string;
  settled_at?: string;
  settled_by?: string;
  notes?: string;
}

const TourSettlementManager: React.FC<TourSettlementManagerProps> = ({
  tourId,
  tour
}) => {
  const [expenses, setExpenses] = useState<TourExpenses | null>(null);
  const [settlement, setSettlement] = useState<TourSettlement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("expenses");

  // 데이터 가져오기
  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 투어 정보 가져오기 (props로 받은 tour 사용)
      const tourData = tour || await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single()
        .then(({ data }) => data);

      // tour_expenses 가져오기
      const { data: expensesData, error: expensesError } = await supabase
        .from("tour_expenses")
        .select("*")
        .eq("tour_id", tourId)
        .single();

      if (expensesError && expensesError.code !== "PGRST116") {
        console.error("Error fetching expenses:", expensesError);
      }

      if (expensesData) {
        setExpenses(expensesData);
      } else {
        // 기본값으로 초기화
        setExpenses({
          tour_id: tourId,
          golf_course_settlement: [],
          golf_course_total: 0,
          bus_cost: 0,
          bus_driver_cost: 0,
          toll_fee: 0,
          parking_fee: 0,
          guide_fee: 0,
          guide_meal_cost: 0,
          guide_accommodation_cost: 0,
          guide_other_cost: 0,
          meal_expenses: [],
          meal_expenses_total: 0,
          accommodation_cost: 0,
          restaurant_cost: 0,
          attraction_fee: 0,
          insurance_cost: 0,
          other_expenses: [],
          other_expenses_total: 0,
          total_cost: 0
        });
      }

      // tour_settlements 가져오기
      const { data: settlementData, error: settlementError } = await supabase
        .from("tour_settlements")
        .select("*")
        .eq("tour_id", tourId)
        .single();

      if (settlementError && settlementError.code !== "PGRST116") {
        console.error("Error fetching settlement:", settlementError);
      }

      // 참가자 수 가져오기
      const { count: participantCount } = await supabase
        .from("singsing_participants")
        .select("*", { count: "exact", head: true })
        .eq("tour_id", tourId);

      // 결제 내역 가져오기
      const { data: paymentsData } = await supabase
        .from("singsing_payments")
        .select("*")
        .eq("tour_id", tourId);

      setPayments(paymentsData || []);

      // 정산 데이터 계산
      const tourPrice = tourData?.price || tour?.price || 0;
      const contractRevenue = tourPrice * (participantCount || 0);
      const totalPaidAmount = paymentsData
        ?.filter(p => p.payment_status === "completed")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const refundedAmount = paymentsData
        ?.filter(p => p.payment_status === "refunded")
        .reduce((sum, p) => sum + Math.abs(p.amount || 0), 0) || 0;
      
      const settlementAmount = totalPaidAmount - refundedAmount;
      const totalCost = expensesData?.total_cost || 0;
      const margin = settlementAmount - totalCost;
      const marginRate = settlementAmount > 0 ? (margin / settlementAmount) * 100 : 0;

      if (settlementData) {
        setSettlement({
          ...settlementData,
          contract_revenue: contractRevenue,
          total_paid_amount: totalPaidAmount,
          refunded_amount: refundedAmount,
          settlement_amount: settlementAmount,
          total_cost: totalCost,
          margin: margin,
          margin_rate: marginRate
        });
      } else {
        setSettlement({
          tour_id: tourId,
          contract_revenue: contractRevenue,
          total_paid_amount: totalPaidAmount,
          refunded_amount: refundedAmount,
          settlement_amount: settlementAmount,
          total_cost: totalCost,
          margin: margin,
          margin_rate: marginRate,
          status: "pending"
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 원가 저장
  const saveExpenses = async () => {
    if (!expenses) return;

    setSaving(true);
    try {
      if (expenses.id) {
        const { error } = await supabase
          .from("tour_expenses")
          .update(expenses)
          .eq("id", expenses.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("tour_expenses")
          .insert([expenses])
          .select()
          .single();

        if (error) throw error;
        if (data) setExpenses(data);
      }

      // 정산 데이터 업데이트
      await updateSettlement();

      alert("원가 정보가 저장되었습니다.");
      
      // 데이터 새로고침
      await fetchData();
    } catch (error: any) {
      console.error("Error saving expenses:", error);
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 정산 데이터 업데이트
  const updateSettlement = async () => {
    if (!settlement || !expenses) return;

    // 정산 금액, 마진, 마진률 재계산
    const settlementAmount = (settlement.total_paid_amount || 0) - (settlement.refunded_amount || 0);
    const totalCost = expenses.total_cost || 0;
    const margin = settlementAmount - totalCost;
    const marginRate = settlementAmount > 0 ? (margin / settlementAmount) * 100 : 0;

    const updatedSettlement = {
      ...settlement,
      settlement_amount: settlementAmount,
      total_cost: totalCost,
      margin: margin,
      margin_rate: marginRate
    };

    try {
      if (settlement.id) {
        const { data, error } = await supabase
          .from("tour_settlements")
          .update(updatedSettlement)
          .eq("id", settlement.id)
          .select()
          .single();

        if (error) throw error;
        if (data) setSettlement(data);
      } else {
        const { data, error } = await supabase
          .from("tour_settlements")
          .insert([updatedSettlement])
          .select()
          .single();

        if (error) throw error;
        if (data) setSettlement(data);
      }
    } catch (error: any) {
      console.error("Error updating settlement:", error);
    }
  };

  // 숫자 포맷팅
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "0";
    return value.toLocaleString("ko-KR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 정산 요약 카드 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          정산 요약
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 계약 매출 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">계약 매출</div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(settlement?.contract_revenue)}원
            </div>
            <div className="text-xs text-gray-500 mt-1">
              상품가 × 인원
            </div>
          </div>

          {/* 정산 금액 */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">정산 금액</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(settlement?.settlement_amount)}원
            </div>
            <div className="text-xs text-gray-500 mt-1">
              완납 - 환불
            </div>
          </div>

          {/* 총 원가 */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">총 원가</div>
            <div className="text-2xl font-bold text-orange-700">
              {formatCurrency(expenses?.total_cost)}원
            </div>
            <div className="text-xs text-gray-500 mt-1">
              자동 계산
            </div>
          </div>

          {/* 마진 */}
          <div className={`rounded-lg p-4 ${
            (settlement?.margin || 0) >= 0 ? "bg-green-50" : "bg-red-50"
          }`}>
            <div className="text-sm text-gray-600 mb-1">마진</div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              (settlement?.margin || 0) >= 0 ? "text-green-700" : "text-red-700"
            }`}>
              {formatCurrency(settlement?.margin)}원
              {(settlement?.margin || 0) >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              마진률: {settlement?.margin_rate?.toFixed(2) || "0.00"}%
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "expenses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              원가 입력
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              정산 상세
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "expenses" && expenses && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">원가 입력</h3>
                <button
                  onClick={saveExpenses}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  저장
                </button>
              </div>

              {/* 골프장 정산 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">골프장 정산</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newSettlement = {
                        golf_course_name: "",
                        date: new Date().toISOString().split("T")[0],
                        items: [],
                        subtotal: 0,
                        deposit: 0,
                        difference: 0,
                        notes: ""
                      };
                      setExpenses({
                        ...expenses,
                        golf_course_settlement: [
                          ...(expenses.golf_course_settlement || []),
                          newSettlement
                        ]
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    골프장 추가
                  </button>
                </div>
                
                {/* 골프장 정산 목록 */}
                {(expenses.golf_course_settlement || []).map((settlement: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-900">골프장 {idx + 1}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(expenses.golf_course_settlement || [])];
                          updated.splice(idx, 1);
                          setExpenses({
                            ...expenses,
                            golf_course_settlement: updated
                          });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          골프장명
                        </label>
                        <input
                          type="text"
                          value={settlement.golf_course_name || ""}
                          onChange={(e) => {
                            const updated = [...(expenses.golf_course_settlement || [])];
                            updated[idx] = { ...updated[idx], golf_course_name: e.target.value };
                            setExpenses({
                              ...expenses,
                              golf_course_settlement: updated
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="골프장명"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          날짜
                        </label>
                        <input
                          type="date"
                          value={settlement.date || ""}
                          onChange={(e) => {
                            const updated = [...(expenses.golf_course_settlement || [])];
                            updated[idx] = { ...updated[idx], date: e.target.value };
                            setExpenses({
                              ...expenses,
                              golf_course_settlement: updated
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          소계
                        </label>
                        <input
                          type="number"
                          value={settlement.subtotal || 0}
                          onChange={(e) => {
                            const updated = [...(expenses.golf_course_settlement || [])];
                            const subtotal = parseInt(e.target.value) || 0;
                            updated[idx] = {
                              ...updated[idx],
                              subtotal,
                              difference: subtotal - (updated[idx].deposit || 0)
                            };
                            setExpenses({
                              ...expenses,
                              golf_course_settlement: updated
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          입금액
                        </label>
                        <input
                          type="number"
                          value={settlement.deposit || 0}
                          onChange={(e) => {
                            const updated = [...(expenses.golf_course_settlement || [])];
                            const deposit = parseInt(e.target.value) || 0;
                            updated[idx] = {
                              ...updated[idx],
                              deposit,
                              difference: (updated[idx].subtotal || 0) - deposit
                            };
                            setExpenses({
                              ...expenses,
                              golf_course_settlement: updated
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          차액
                        </label>
                        <input
                          type="number"
                          value={settlement.difference || 0}
                          readOnly
                          className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                          placeholder="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          메모
                        </label>
                        <textarea
                          value={settlement.notes || ""}
                          onChange={(e) => {
                            const updated = [...(expenses.golf_course_settlement || [])];
                            updated[idx] = { ...updated[idx], notes: e.target.value };
                            setExpenses({
                              ...expenses,
                              golf_course_settlement: updated
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          rows={2}
                          placeholder="메모를 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 골프장 총 비용 */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        골프장 총 비용
                      </label>
                      <input
                        type="number"
                        value={expenses.golf_course_total || 0}
                        onChange={(e) => setExpenses({
                          ...expenses,
                          golf_course_total: parseInt(e.target.value) || 0
                        })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="0"
                      />
                    </div>
                    <div className="text-sm text-gray-500 flex items-end">
                      <span>골프장 정산 상세 항목의 소계 합계를 입력하세요.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 버스 비용 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">버스 비용</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      버스 비용
                    </label>
                    <input
                      type="number"
                      value={expenses.bus_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        bus_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      기사 비용
                    </label>
                    <input
                      type="number"
                      value={expenses.bus_driver_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        bus_driver_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      톨게이트 비용
                    </label>
                    <input
                      type="number"
                      value={expenses.toll_fee || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        toll_fee: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      주차비
                    </label>
                    <input
                      type="number"
                      value={expenses.parking_fee || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        parking_fee: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      버스 비용 메모
                    </label>
                    <textarea
                      value={expenses.bus_notes || ""}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        bus_notes: e.target.value
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      rows={2}
                      placeholder="버스 비용 관련 메모를 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 가이드 비용 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">가이드 비용</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가이드 인건비
                    </label>
                    <input
                      type="number"
                      value={expenses.guide_fee || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        guide_fee: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가이드 식사비
                    </label>
                    <input
                      type="number"
                      value={expenses.guide_meal_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        guide_meal_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가이드 숙박비
                    </label>
                    <input
                      type="number"
                      value={expenses.guide_accommodation_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        guide_accommodation_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가이드 기타 비용
                    </label>
                    <input
                      type="number"
                      value={expenses.guide_other_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        guide_other_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가이드 비용 메모
                    </label>
                    <textarea
                      value={expenses.guide_notes || ""}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        guide_notes: e.target.value
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      rows={2}
                      placeholder="가이드 비용 관련 메모를 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 경비 지출 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">경비 지출</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newExpense = {
                        type: "other",
                        description: "",
                        unit_price: 0,
                        quantity: 1,
                        total: 0
                      };
                      setExpenses({
                        ...expenses,
                        meal_expenses: [
                          ...(expenses.meal_expenses || []),
                          newExpense
                        ]
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    경비 추가
                  </button>
                </div>
                
                {/* 경비 지출 목록 */}
                {(expenses.meal_expenses || []).map((expense: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-900">경비 항목 {idx + 1}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(expenses.meal_expenses || [])];
                          updated.splice(idx, 1);
                          const total = updated.reduce((sum, e) => sum + (e.total || 0), 0);
                          setExpenses({
                            ...expenses,
                            meal_expenses: updated,
                            meal_expenses_total: total
                          });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          유형
                        </label>
                        <select
                          value={expense.type || "other"}
                          onChange={(e) => {
                            const updated = [...(expenses.meal_expenses || [])];
                            updated[idx] = { ...updated[idx], type: e.target.value };
                            setExpenses({
                              ...expenses,
                              meal_expenses: updated
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="gimbap">김밥</option>
                          <option value="water">생수</option>
                          <option value="snack">간식</option>
                          <option value="meal">식사</option>
                          <option value="other">기타</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          설명
                        </label>
                        <input
                          type="text"
                          value={expense.description || ""}
                          onChange={(e) => {
                            const updated = [...(expenses.meal_expenses || [])];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setExpenses({
                              ...expenses,
                              meal_expenses: updated
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="설명"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          단가
                        </label>
                        <input
                          type="number"
                          value={expense.unit_price || 0}
                          onChange={(e) => {
                            const updated = [...(expenses.meal_expenses || [])];
                            const unitPrice = parseInt(e.target.value) || 0;
                            const quantity = updated[idx].quantity || 1;
                            updated[idx] = {
                              ...updated[idx],
                              unit_price: unitPrice,
                              total: unitPrice * quantity
                            };
                            const total = updated.reduce((sum, e) => sum + (e.total || 0), 0);
                            setExpenses({
                              ...expenses,
                              meal_expenses: updated,
                              meal_expenses_total: total
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          수량
                        </label>
                        <input
                          type="number"
                          value={expense.quantity || 1}
                          onChange={(e) => {
                            const updated = [...(expenses.meal_expenses || [])];
                            const quantity = parseInt(e.target.value) || 1;
                            const unitPrice = updated[idx].unit_price || 0;
                            updated[idx] = {
                              ...updated[idx],
                              quantity,
                              total: unitPrice * quantity
                            };
                            const total = updated.reduce((sum, e) => sum + (e.total || 0), 0);
                            setExpenses({
                              ...expenses,
                              meal_expenses: updated,
                              meal_expenses_total: total
                            });
                          }}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          총액
                        </label>
                        <input
                          type="number"
                          value={expense.total || 0}
                          readOnly
                          className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 경비 지출 총합 */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        경비 지출 총합
                      </label>
                      <input
                        type="number"
                        value={expenses.meal_expenses_total || 0}
                        readOnly
                        className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                        placeholder="0"
                      />
                    </div>
                    <div className="text-sm text-gray-500 flex items-end">
                      <span>경비 항목의 총액이 자동으로 계산됩니다.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 기타 비용 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">기타 비용</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      숙박비
                    </label>
                    <input
                      type="number"
                      value={expenses.accommodation_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        accommodation_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      식당 비용
                    </label>
                    <input
                      type="number"
                      value={expenses.restaurant_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        restaurant_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      관광지 입장료
                    </label>
                    <input
                      type="number"
                      value={expenses.attraction_fee || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        attraction_fee: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      보험료
                    </label>
                    <input
                      type="number"
                      value={expenses.insurance_cost || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        insurance_cost: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      기타 비용 총합
                    </label>
                    <input
                      type="number"
                      value={expenses.other_expenses_total || 0}
                      onChange={(e) => setExpenses({
                        ...expenses,
                        other_expenses_total: parseInt(e.target.value) || 0
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* 메모 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">메모</h4>
                <textarea
                  value={expenses.notes || ""}
                  onChange={(e) => setExpenses({
                    ...expenses,
                    notes: e.target.value
                  })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={4}
                  placeholder="원가 관련 메모를 입력하세요"
                />
              </div>
            </div>
          )}

          {activeTab === "summary" && settlement && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">정산 상세</h3>
              
              {/* 매출 정보 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">매출 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      계약 매출
                    </label>
                    <div className="text-2xl font-bold text-blue-700">
                      {formatCurrency(settlement.contract_revenue)}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      상품가 × 인원
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      완납 금액
                    </label>
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(settlement.total_paid_amount)}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      입금 합계
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      환불 금액
                    </label>
                    <div className="text-2xl font-bold text-red-700">
                      {formatCurrency(settlement.refunded_amount)}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      환불 합계
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      정산 금액
                    </label>
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(settlement.settlement_amount)}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      완납 - 환불
                    </div>
                  </div>
                </div>
              </div>

              {/* 원가 정보 */}
              <div className="bg-orange-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">원가 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      총 원가
                    </label>
                    <div className="text-2xl font-bold text-orange-700">
                      {formatCurrency(settlement.total_cost)}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      자동 계산
                    </div>
                  </div>
                </div>
              </div>

              {/* 마진 정보 */}
              <div className={`rounded-lg p-6 ${
                (settlement.margin || 0) >= 0 ? "bg-green-50" : "bg-red-50"
              }`}>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">마진 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      마진
                    </label>
                    <div className={`text-2xl font-bold flex items-center gap-2 ${
                      (settlement.margin || 0) >= 0 ? "text-green-700" : "text-red-700"
                    }`}>
                      {formatCurrency(settlement.margin)}원
                      {(settlement.margin || 0) >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      정산 금액 - 총 원가
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      마진률
                    </label>
                    <div className={`text-2xl font-bold ${
                      (settlement.margin_rate || 0) >= 0 ? "text-green-700" : "text-red-700"
                    }`}>
                      {(settlement.margin_rate || 0).toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      (마진 / 정산 금액) × 100
                    </div>
                  </div>
                </div>
              </div>

              {/* 정산 상태 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">정산 상태</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {settlement.status === "completed" ? (
                        <span className="text-green-600">완료</span>
                      ) : settlement.status === "cancelled" ? (
                        <span className="text-red-600">취소</span>
                      ) : (
                        <span className="text-yellow-600">대기</span>
                      )}
                    </div>
                  </div>
                  {settlement.settled_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        정산 완료일
                      </label>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(settlement.settled_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourSettlementManager;

