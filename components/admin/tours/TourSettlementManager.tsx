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
  needs_review?: boolean; // 확인 필요 여부
  review_notes?: string; // 검토 메모
  reviewed_at?: string; // 검토 완료일시
  reviewed_by?: string; // 검토자 ID
  expected_margin?: number; // 예상 마진 (이미지 정산서 기준 수익 값)
  calculation_discrepancy?: number; // 계산 차이
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
  const [participantCount, setParticipantCount] = useState<number>(0);
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

      setParticipantCount(participantCount || 0);

      // 결제 내역 가져오기
      const { data: paymentsData } = await supabase
        .from("singsing_payments")
        .select("*")
        .eq("tour_id", tourId);

      setPayments(paymentsData || []);

      // 정산 데이터 계산 (결제 데이터에서 자동 계산)
      const tourPrice = tourData?.price || tour?.price || 0;
      const contractRevenue = tourPrice * (participantCount || 0); // 계약 매출 (상품가 × 인원)
      
      // 완납 금액: 결제 완료된 금액 합계
      const totalPaidAmount = paymentsData
        ?.filter(p => p.payment_status === "completed")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // 환불 금액: 환불된 금액 합계
      const refundedAmount = paymentsData
        ?.filter(p => p.payment_status === "refunded")
        .reduce((sum, p) => sum + Math.abs(p.amount || 0), 0) || 0;
      
      // 정산 금액: 완납 금액 - 환불 금액
      const settlementAmount = totalPaidAmount - refundedAmount;
      
      // 총 원가: tour_expenses에서 자동 계산
      const totalCost = expensesData?.total_cost || 0;
      
      // 마진: 정산 금액 - 총 원가
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
        // 업데이트: id를 제외하고 업데이트
        const { id, ...updateData } = expenses;
        const { error } = await supabase
          .from("tour_expenses")
          .update(updateData)
          .eq("id", id);

        if (error) throw error;
      } else {
        // 새로 생성: id 필드를 명시적으로 제거 (null이어도 제거)
        const insertData = { ...expenses };
        delete insertData.id;  // id 필드를 명시적으로 제거
        
        const { data, error } = await supabase
          .from("tour_expenses")
          .insert([insertData])
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

  // 정산 데이터 업데이트 (결제 데이터에서 자동 계산)
  const updateSettlement = async () => {
    if (!settlement || !expenses) return;

    // 결제 데이터 다시 가져오기 (최신 데이터 반영)
    const { data: latestPayments } = await supabase
      .from("singsing_payments")
      .select("*")
      .eq("tour_id", tourId);

    // 완납 금액: 결제 완료된 금액 합계
    const totalPaidAmount = latestPayments
      ?.filter(p => p.payment_status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    // 환불 금액: 환불된 금액 합계
    const refundedAmount = latestPayments
      ?.filter(p => p.payment_status === "refunded")
      .reduce((sum, p) => sum + Math.abs(p.amount || 0), 0) || 0;
    
    // 정산 금액: 완납 금액 - 환불 금액
    const settlementAmount = totalPaidAmount - refundedAmount;
    
    // 총 원가: tour_expenses에서 자동 계산
    const totalCost = expenses.total_cost || 0;
    
    // 마진 계산: 정산 금액 - 총 원가
    const calculatedMargin = settlementAmount - totalCost;
    const marginRate = settlementAmount > 0 ? (calculatedMargin / settlementAmount) * 100 : 0;

    // 예상 마진이 있으면 계산 차이 확인
    const expectedMargin = settlement.expected_margin;
    const discrepancy = expectedMargin !== undefined && expectedMargin !== null
      ? calculatedMargin - expectedMargin
      : null;
    
    // 계산 차이가 1,000원 이상이면 확인 필요로 표시
    const needsReview = discrepancy !== null && Math.abs(discrepancy) > 1000;

    const updatedSettlement = {
      ...settlement,
      settlement_amount: settlementAmount,
      total_cost: totalCost,
      margin: calculatedMargin,
      margin_rate: marginRate,
      calculation_discrepancy: discrepancy,
      needs_review: needsReview || settlement.needs_review || false
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

  // 정산서 PDF 생성
  const generateSettlementHTML = (): string => {
    if (!settlement || !expenses || !tour) return "";

    const margin = settlement.margin || 0;
    const marginRate = settlement.margin_rate || 0;
    const marginColor = margin >= 0 ? "#10b981" : "#ef4444";
    
    const busTotal = (expenses.bus_cost || 0) + (expenses.bus_driver_cost || 0) + (expenses.toll_fee || 0) + (expenses.parking_fee || 0);
    const guideTotal = (expenses.guide_fee || 0) + (expenses.guide_meal_cost || 0) + (expenses.guide_accommodation_cost || 0) + (expenses.guide_other_cost || 0);
    const otherTotal = (expenses.accommodation_cost || 0) + (expenses.restaurant_cost || 0) + (expenses.attraction_fee || 0) + (expenses.insurance_cost || 0) + (expenses.other_expenses_total || 0);
    
    const comPerPerson = participantCount > 0 ? Math.floor(margin / participantCount) : 0;

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>정산서 - ${tour.title || "투어"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', -apple-system, BlinkSystemFont, 'Malgun Gothic', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #2c5282 0%, #4a6fa5 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      font-size: 18px;
      opacity: 0.95;
      margin-bottom: 20px;
    }
    
    .header .company-info {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.8;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #2c5282;
      padding: 15px 20px;
      background: #e7f3ff;
      margin-bottom: 20px;
      border-left: 5px solid #2c5282;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 15px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    
    .info-label {
      font-weight: 500;
      color: #666;
    }
    
    .info-value {
      font-weight: 700;
      color: #333;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
    }
    
    .table th {
      background: #2c5282;
      color: white;
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
    }
    
    .table td {
      padding: 12px 15px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .table tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .table tr:last-child td {
      border-bottom: none;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-bold {
      font-weight: 700;
    }
    
    .highlight-box {
      background: ${margin >= 0 ? '#ecfdf5' : '#fef2f2'};
      border: 2px solid ${marginColor};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .highlight-box h3 {
      font-size: 18px;
      font-weight: 700;
      color: ${marginColor};
      margin-bottom: 15px;
    }
    
    .highlight-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    
    .highlight-item {
      text-align: center;
    }
    
    .highlight-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .highlight-value {
      font-size: 24px;
      font-weight: 700;
      color: ${marginColor};
    }
    
    .notes {
      background: #fff9e6;
      border-left: 4px solid #f59e0b;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    
    .notes-title {
      font-weight: 700;
      color: #92400e;
      margin-bottom: 10px;
    }
    
    .notes-content {
      color: #78350f;
      white-space: pre-line;
      line-height: 1.8;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      border-top: 2px solid #e5e7eb;
      color: #666;
      font-size: 13px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>정산서</h1>
      <div class="subtitle">${tour.title || "투어"}</div>
      <div class="company-info">
        수원시 영통구 법조로149번길 200<br>
        고객센터 TEL 031-215-3990
      </div>
    </div>
    
    <div class="content">
      <!-- 투어 정보 -->
      <div class="section">
        <div class="section-title">투어 정보</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">투어명</span>
            <span class="info-value">${tour.title || "-"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">시작일</span>
            <span class="info-value">${tour.start_date ? new Date(tour.start_date).toLocaleDateString("ko-KR") : "-"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">종료일</span>
            <span class="info-value">${tour.end_date ? new Date(tour.end_date).toLocaleDateString("ko-KR") : "-"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">참가자 수</span>
            <span class="info-value">${participantCount}명</span>
          </div>
        </div>
      </div>
      
      <!-- 매출 정보 -->
      <div class="section">
        <div class="section-title">매출 정보</div>
        <table class="table">
          <thead>
            <tr>
              <th>항목</th>
              <th class="text-right">금액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>계약 매출</td>
              <td class="text-right">${formatCurrency(settlement.contract_revenue)}원</td>
            </tr>
            <tr>
              <td>완납 금액</td>
              <td class="text-right">${formatCurrency(settlement.total_paid_amount)}원</td>
            </tr>
            <tr>
              <td>환불 금액</td>
              <td class="text-right">${formatCurrency(settlement.refunded_amount)}원</td>
            </tr>
            <tr class="text-bold" style="background: #e7f3ff;">
              <td>정산 금액</td>
              <td class="text-right" style="color: #2563eb; font-size: 16px;">${formatCurrency(settlement.settlement_amount)}원</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 원가 정보 -->
      <div class="section">
        <div class="section-title">원가 정보</div>
        <table class="table">
          <thead>
            <tr>
              <th>항목</th>
              <th class="text-right">금액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>골프장 총 비용</td>
              <td class="text-right">${formatCurrency(expenses.golf_course_total || 0)}원</td>
            </tr>
            <tr>
              <td>버스 비용</td>
              <td class="text-right">${formatCurrency(busTotal)}원</td>
            </tr>
            <tr>
              <td>가이드 비용</td>
              <td class="text-right">${formatCurrency(guideTotal)}원</td>
            </tr>
            <tr>
              <td>경비 지출</td>
              <td class="text-right">${formatCurrency(expenses.meal_expenses_total || 0)}원</td>
            </tr>
            <tr>
              <td>기타 비용</td>
              <td class="text-right">${formatCurrency(otherTotal)}원</td>
            </tr>
            <tr class="text-bold" style="background: #fff7ed;">
              <td>총 원가</td>
              <td class="text-right" style="color: #ea580c; font-size: 16px;">${formatCurrency(settlement.total_cost)}원</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 마진 정보 -->
      <div class="section">
        <div class="highlight-box">
          <h3>마진 정보</h3>
          <div class="highlight-grid">
            <div class="highlight-item">
              <div class="highlight-label">마진</div>
              <div class="highlight-value">${formatCurrency(margin)}원</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-label">마진률</div>
              <div class="highlight-value">${marginRate.toFixed(2)}%</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-label">1인당 COM</div>
              <div class="highlight-value">${formatCurrency(comPerPerson)}원</div>
            </div>
          </div>
        </div>
      </div>
      
      ${expenses.notes ? `
      <!-- 메모 -->
      <div class="section">
        <div class="notes">
          <div class="notes-title">메모</div>
          <div class="notes-content">${expenses.notes.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      생성일: ${new Date().toLocaleDateString("ko-KR")} ${new Date().toLocaleTimeString("ko-KR")}
    </div>
  </div>
</body>
</html>`;
  };

  const generateSettlementPDF = () => {
    if (!settlement || !expenses || !tour) return;

    const html = generateSettlementHTML();
    
    // 새 창에서 HTML 열기
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // 로드 후 인쇄 대화상자 열기
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };
  
  const downloadSettlementHTML = () => {
    if (!settlement || !expenses || !tour) return;

    const html = generateSettlementHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `정산서_${tour.title || "투어"}_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
      </div>
    );
  }

  // 계산 차이 확인 (예상 마진과 실제 계산 마진 비교)
  const hasDiscrepancy = settlement?.expected_margin !== undefined && 
                         settlement?.expected_margin !== null &&
                         settlement?.margin !== undefined &&
                         Math.abs((settlement.margin || 0) - (settlement.expected_margin || 0)) > 1000; // 1,000원 이상 차이

  return (
    <div className="space-y-6">
      {/* 확인 필요 알림 */}
      {(settlement?.needs_review || hasDiscrepancy) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                ⚠️ 정산 계산 확인 필요
              </h3>
              {hasDiscrepancy && (
                <div className="mb-3">
                  <p className="text-sm text-yellow-800 mb-2">
                    계산된 마진과 예상 마진이 다릅니다. 이미지 정산서와 비교하여 확인해주세요.
                  </p>
                  <div className="bg-white rounded p-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-600">계산된 마진:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {formatCurrency(settlement?.margin || 0)}원
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">예상 마진:</span>
                        <span className="ml-2 font-semibold text-blue-600">
                          {formatCurrency(settlement?.expected_margin || 0)}원
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">차이:</span>
                        <span className={`ml-2 font-semibold ${
                          (settlement?.calculation_discrepancy || 0) > 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {formatCurrency(settlement?.calculation_discrepancy || 0)}원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {settlement?.review_notes && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-yellow-900 mb-1">검토 메모:</p>
                  <p className="text-sm text-yellow-800 bg-white rounded p-2">
                    {settlement.review_notes}
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={async () => {
                    const notes = prompt('검토 메모를 입력하세요 (직원 확인 사항 기록):', settlement?.review_notes || '');
                    if (notes !== null) {
                      try {
                        const { error } = await supabase
                          .from('tour_settlements')
                          .update({ 
                            review_notes: notes,
                            needs_review: true
                          })
                          .eq('tour_id', tourId);
                        if (error) throw error;
                        await fetchData();
                        alert('검토 메모가 저장되었습니다.');
                      } catch (error: any) {
                        alert(`검토 메모 저장 실패: ${error.message}`);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  검토 메모 작성
                </button>
                <button
                  onClick={async () => {
                    if (confirm('정산 계산을 확인 완료 처리하시겠습니까?')) {
                      try {
                        const { data: { user } } = await supabase.auth.getUser();
                        const { error } = await supabase
                          .from('tour_settlements')
                          .update({ 
                            needs_review: false,
                            reviewed_at: new Date().toISOString(),
                            reviewed_by: user?.id || null
                          })
                          .eq('tour_id', tourId);
                        if (error) throw error;
                        await fetchData();
                        alert('확인 완료 처리되었습니다.');
                      } catch (error: any) {
                        alert(`확인 완료 처리 실패: ${error.message}`);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  확인 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 정산 요약 카드 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          정산 요약
          {settlement?.needs_review && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
              확인 필요
            </span>
          )}
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
            {participantCount > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                1인당 COM: {formatCurrency(Math.floor((settlement?.margin || 0) / participantCount))}원
              </div>
            )}
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
                        deposits: [], // 입금 내역 배열 추가
                        refunds: [], // 환불 내역 배열 추가
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
                    
                    {/* 입금 내역 */}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="font-semibold text-gray-900">입금 내역</h6>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(expenses.golf_course_settlement || [])];
                            const deposits = updated[idx].deposits || [];
                            deposits.push({
                              method: "cash", // cash, card
                              amount: 0,
                              date: new Date().toISOString().split("T")[0],
                              account: "", // 계좌 정보 (선택)
                              notes: ""
                            });
                            updated[idx] = { ...updated[idx], deposits };
                            // 입금액 자동 계산
                            const totalDeposit = deposits.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                            const totalRefund = (updated[idx].refunds || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
                            updated[idx].deposit = totalDeposit - totalRefund;
                            updated[idx].difference = (updated[idx].subtotal || 0) - updated[idx].deposit;
                            setExpenses({
                              ...expenses,
                              golf_course_settlement: updated
                            });
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Plus className="w-3 h-3" />
                          입금 추가
                        </button>
                      </div>
                      {(settlement.deposits || []).map((deposit: any, depositIdx: number) => (
                        <div key={depositIdx} className="bg-white rounded-lg p-3 mb-2 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                입금 방법
                              </label>
                              <select
                                value={deposit.method || "cash"}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const deposits = [...(updated[idx].deposits || [])];
                                  deposits[depositIdx] = { ...deposits[depositIdx], method: e.target.value };
                                  updated[idx] = { ...updated[idx], deposits };
                                  // 입금액 자동 계산
                                  const totalDeposit = deposits.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                                  const totalRefund = (updated[idx].refunds || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
                                  updated[idx].deposit = totalDeposit - totalRefund;
                                  updated[idx].difference = (updated[idx].subtotal || 0) - updated[idx].deposit;
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                              >
                                <option value="cash">현금</option>
                                <option value="card">카드</option>
                                <option value="bank">계좌이체</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                입금 금액
                              </label>
                              <input
                                type="number"
                                value={deposit.amount || 0}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const deposits = [...(updated[idx].deposits || [])];
                                  deposits[depositIdx] = { ...deposits[depositIdx], amount: parseInt(e.target.value) || 0 };
                                  updated[idx] = { ...updated[idx], deposits };
                                  // 입금액 자동 계산
                                  const totalDeposit = deposits.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                                  const totalRefund = (updated[idx].refunds || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
                                  updated[idx].deposit = totalDeposit - totalRefund;
                                  updated[idx].difference = (updated[idx].subtotal || 0) - updated[idx].deposit;
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                입금 날짜
                              </label>
                              <input
                                type="date"
                                value={deposit.date || ""}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const deposits = [...(updated[idx].deposits || [])];
                                  deposits[depositIdx] = { ...deposits[depositIdx], date: e.target.value };
                                  updated[idx] = { ...updated[idx], deposits };
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <input
                                type="text"
                                value={deposit.account || ""}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const deposits = [...(updated[idx].deposits || [])];
                                  deposits[depositIdx] = { ...deposits[depositIdx], account: e.target.value };
                                  updated[idx] = { ...updated[idx], deposits };
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="계좌 정보 (선택)"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const deposits = [...(updated[idx].deposits || [])];
                                  deposits.splice(depositIdx, 1);
                                  updated[idx] = { ...updated[idx], deposits };
                                  // 입금액 자동 계산
                                  const totalDeposit = deposits.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                                  const totalRefund = (updated[idx].refunds || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
                                  updated[idx].deposit = totalDeposit - totalRefund;
                                  updated[idx].difference = (updated[idx].subtotal || 0) - updated[idx].deposit;
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
                          </div>
                          {deposit.notes && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={deposit.notes || ""}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const deposits = [...(updated[idx].deposits || [])];
                                  deposits[depositIdx] = { ...deposits[depositIdx], notes: e.target.value };
                                  updated[idx] = { ...updated[idx], deposits };
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="비고 (예: 농협 615082-55-000077)"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {(!settlement.deposits || settlement.deposits.length === 0) && (
                        <p className="text-xs text-gray-500 text-center py-2">입금 내역이 없습니다. "입금 추가" 버튼을 클릭하여 추가하세요.</p>
                      )}
                    </div>
                    
                    {/* 환불 내역 */}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="font-semibold text-gray-900">환불 내역</h6>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(expenses.golf_course_settlement || [])];
                            const refunds = updated[idx].refunds || [];
                            refunds.push({
                              reason: "", // 환불 사유
                              amount: 0,
                              date: new Date().toISOString().split("T")[0],
                              notes: ""
                            });
                            updated[idx] = { ...updated[idx], refunds };
                            // 입금액 자동 계산
                            const totalDeposit = (updated[idx].deposits || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                            const totalRefund = refunds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
                            updated[idx].deposit = totalDeposit - totalRefund;
                            updated[idx].difference = (updated[idx].subtotal || 0) - updated[idx].deposit;
                            setExpenses({
                              ...expenses,
                              golf_course_settlement: updated
                            });
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <Plus className="w-3 h-3" />
                          환불 추가
                        </button>
                      </div>
                      {(settlement.refunds || []).map((refund: any, refundIdx: number) => (
                        <div key={refundIdx} className="bg-red-50 rounded-lg p-3 mb-2 border border-red-200">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                환불 사유
                              </label>
                              <input
                                type="text"
                                value={refund.reason || ""}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const refunds = [...(updated[idx].refunds || [])];
                                  refunds[refundIdx] = { ...refunds[refundIdx], reason: e.target.value };
                                  updated[idx] = { ...updated[idx], refunds };
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="홀정산 환불 등"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                환불 금액
                              </label>
                              <input
                                type="number"
                                value={refund.amount || 0}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const refunds = [...(updated[idx].refunds || [])];
                                  refunds[refundIdx] = { ...refunds[refundIdx], amount: parseInt(e.target.value) || 0 };
                                  updated[idx] = { ...updated[idx], refunds };
                                  // 입금액 자동 계산
                                  const totalDeposit = (updated[idx].deposits || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                                  const totalRefund = refunds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
                                  updated[idx].deposit = totalDeposit - totalRefund;
                                  updated[idx].difference = (updated[idx].subtotal || 0) - updated[idx].deposit;
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                환불 날짜
                              </label>
                              <input
                                type="date"
                                value={refund.date || ""}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const refunds = [...(updated[idx].refunds || [])];
                                  refunds[refundIdx] = { ...refunds[refundIdx], date: e.target.value };
                                  updated[idx] = { ...updated[idx], refunds };
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const refunds = [...(updated[idx].refunds || [])];
                                  refunds.splice(refundIdx, 1);
                                  updated[idx] = { ...updated[idx], refunds };
                                  // 입금액 자동 계산
                                  const totalDeposit = (updated[idx].deposits || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                                  const totalRefund = refunds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
                                  updated[idx].deposit = totalDeposit - totalRefund;
                                  updated[idx].difference = (updated[idx].subtotal || 0) - updated[idx].deposit;
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
                          </div>
                          {refund.notes && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={refund.notes || ""}
                                onChange={(e) => {
                                  const updated = [...(expenses.golf_course_settlement || [])];
                                  const refunds = [...(updated[idx].refunds || [])];
                                  refunds[refundIdx] = { ...refunds[refundIdx], notes: e.target.value };
                                  updated[idx] = { ...updated[idx], refunds };
                                  setExpenses({
                                    ...expenses,
                                    golf_course_settlement: updated
                                  });
                                }}
                                className="w-full border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="비고"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {(!settlement.refunds || settlement.refunds.length === 0) && (
                        <p className="text-xs text-gray-500 text-center py-2">환불 내역이 없습니다.</p>
                      )}
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">정산 상세</h3>
                <div className="flex gap-2">
                  <button
                    onClick={generateSettlementPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    정산서 인쇄
                  </button>
                  <button
                    onClick={downloadSettlementHTML}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    정산서 HTML 다운로드
                  </button>
                </div>
              </div>

              {/* 예상 마진 입력 (이미지 정산서 기준 수익 값) */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  예상 마진 입력 (이미지 정산서 기준 수익 값)
                </h4>
                <p className="text-xs text-yellow-800 mb-3">
                  이미지 정산서의 수익 값을 입력하면, 계산된 마진과 비교하여 차이를 확인할 수 있습니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      예상 마진 (이미지 정산서 기준 수익 값)
                    </label>
                    <input
                      type="number"
                      value={settlement.expected_margin || ""}
                      onChange={async (e) => {
                        const expectedMargin = parseInt(e.target.value) || null;
                        const calculatedMargin = settlement.margin || 0;
                        const discrepancy = expectedMargin !== null
                          ? calculatedMargin - expectedMargin
                          : null;
                        const needsReview = discrepancy !== null && Math.abs(discrepancy) > 1000;

                        try {
                          const { error } = await supabase
                            .from('tour_settlements')
                            .update({
                              expected_margin: expectedMargin,
                              calculation_discrepancy: discrepancy,
                              needs_review: needsReview || settlement.needs_review || false
                            })
                            .eq('tour_id', tourId);
                          if (error) throw error;
                          await fetchData();
                        } catch (error: any) {
                          alert(`예상 마진 저장 실패: ${error.message}`);
                        }
                      }}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="이미지 정산서의 수익 값을 입력하세요"
                    />
                  </div>
                  {settlement.expected_margin !== undefined && settlement.expected_margin !== null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        계산 차이
                      </label>
                      <div className={`w-full border rounded-lg px-3 py-2 ${
                        (settlement.calculation_discrepancy || 0) > 1000 
                          ? 'bg-red-50 border-red-300 text-red-700' 
                          : (settlement.calculation_discrepancy || 0) < -1000
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-green-50 border-green-300 text-green-700'
                      }`}>
                        {formatCurrency(settlement.calculation_discrepancy || 0)}원
                        {(settlement.calculation_discrepancy || 0) > 1000 && (
                          <span className="ml-2 text-xs">⚠️ 확인 필요</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {participantCount > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        1인당 COM
                      </label>
                      <div className={`text-2xl font-bold ${
                        (settlement.margin || 0) >= 0 ? "text-green-700" : "text-red-700"
                      }`}>
                        {formatCurrency(Math.floor((settlement.margin || 0) / participantCount))}원
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        마진 ÷ 참가자 수 ({participantCount}명)
                      </div>
                    </div>
                  )}
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

