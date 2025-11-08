"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Calculator, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";

interface TourSettlement {
  tour_id: string;
  tour_title: string;
  tour_start_date: string;
  contract_revenue: number;
  settlement_amount: number;
  total_cost: number;
  margin: number;
  margin_rate: number;
  status: string;
}

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<TourSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    fetchSettlements();
  }, [filter]);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("tour_settlements")
        .select(`
          tour_id,
          contract_revenue,
          settlement_amount,
          total_cost,
          margin,
          margin_rate,
          status,
          tour:tour_id (
            id,
            title,
            start_date
          )
        `)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedSettlements: TourSettlement[] = (data || []).map((item: any) => {
        const tour = Array.isArray(item.tour) ? item.tour[0] : item.tour;
        return {
          tour_id: item.tour_id,
          tour_title: tour?.title || "투어명 없음",
          tour_start_date: tour?.start_date || "",
          contract_revenue: item.contract_revenue || 0,
          settlement_amount: item.settlement_amount || 0,
          total_cost: item.total_cost || 0,
          margin: item.margin || 0,
          margin_rate: item.margin_rate || 0,
          status: item.status || "pending",
        };
      });

      setSettlements(formattedSettlements);
    } catch (error) {
      console.error("Error fetching settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("ko-KR");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const totalStats = settlements.reduce(
    (acc, s) => ({
      contractRevenue: acc.contractRevenue + s.contract_revenue,
      settlementAmount: acc.settlementAmount + s.settlement_amount,
      totalCost: acc.totalCost + s.total_cost,
      margin: acc.margin + s.margin,
    }),
    {
      contractRevenue: 0,
      settlementAmount: 0,
      totalCost: 0,
      margin: 0,
    }
  );

  const totalMarginRate =
    totalStats.settlementAmount > 0
      ? ((totalStats.margin / totalStats.settlementAmount) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-8 h-8" />
          정산 관리
        </h1>
        <p className="mt-2 text-gray-600">투어별 정산 현황을 확인하고 관리할 수 있습니다.</p>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          대기
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "completed"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          완료
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">계약 매출</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalStats.contractRevenue)}원
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">정산 금액</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalStats.settlementAmount)}원
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">총 원가</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(totalStats.totalCost)}원
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">총 마진</div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              totalStats.margin >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(totalStats.margin)}원
            {totalStats.margin >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">마진률: {totalMarginRate}%</div>
        </div>
      </div>

      {/* 정산 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">정산 목록</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : settlements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            정산 데이터가 없습니다. 투어 상세 페이지에서 정산 정보를 입력해주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투어명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시작일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    계약 매출
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정산 금액
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 원가
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마진
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마진률
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settlements.map((settlement) => (
                  <tr key={settlement.tour_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {settlement.tour_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(settlement.tour_start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(settlement.contract_revenue)}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                      {formatCurrency(settlement.settlement_amount)}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                      {formatCurrency(settlement.total_cost)}원
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        settlement.margin >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(settlement.margin)}원
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        settlement.margin_rate >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {settlement.margin_rate.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settlement.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : settlement.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {settlement.status === "completed"
                          ? "완료"
                          : settlement.status === "cancelled"
                          ? "취소"
                          : "대기"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Link
                        href={`/admin/tours/${settlement.tour_id}/settlement`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

