"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, TrendingUp, TrendingDown, DollarSign, FileText, Plus, Search, AlertCircle, CheckCircle, RefreshCw, Clock } from "lucide-react";

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
  needs_review?: boolean;
  review_notes?: string;
  has_expenses?: boolean; // 원가 데이터 존재 여부
  settlement_status?: 'not_started' | 'in_progress' | 'completed'; // 정산 상태
}

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
}

export default function SettlementsPage() {
  const router = useRouter();
  const [settlements, setSettlements] = useState<TourSettlement[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "not_started" | "in_progress" | "completed">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchTours();
    fetchSettlements();
  }, [filter]);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from("singsing_tours")
        .select("id, title, start_date, end_date, price")
        .is("quote_data", null)
        .order("start_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

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
          needs_review,
          review_notes,
          tour:tour_id (
            id,
            title,
            start_date
          )
        `)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        if (filter === "completed") {
          query = query.eq("status", "completed");
        }
        // not_started와 in_progress는 나중에 필터링
      }

      const { data, error } = await query;

      if (error) throw error;

      // 각 정산에 대해 tour_expenses 존재 여부 확인
      const settlementsWithExpenses = await Promise.all(
        (data || []).map(async (item: any) => {
          const tour = Array.isArray(item.tour) ? item.tour[0] : item.tour;
          
          // tour_expenses 존재 여부 확인
          const { data: expenses } = await supabase
            .from("tour_expenses")
            .select("id")
            .eq("tour_id", item.tour_id)
            .single();
          
          const hasExpenses = !!expenses;
          
          // 정산 상태 결정
          let settlementStatus: 'not_started' | 'in_progress' | 'completed';
          if (item.status === "completed") {
            settlementStatus = "completed";
          } else if (hasExpenses) {
            settlementStatus = "in_progress";
          } else {
            settlementStatus = "not_started";
          }
          
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
            needs_review: item.needs_review || false,
            review_notes: item.review_notes || "",
            has_expenses: hasExpenses,
            settlement_status: settlementStatus,
          };
        })
      );

      // 필터 적용
      let filtered = settlementsWithExpenses;
      if (filter === "not_started") {
        filtered = settlementsWithExpenses.filter(s => s.settlement_status === "not_started");
      } else if (filter === "in_progress") {
        filtered = settlementsWithExpenses.filter(s => s.settlement_status === "in_progress");
      } else if (filter === "completed") {
        filtered = settlementsWithExpenses.filter(s => s.settlement_status === "completed");
      }

      setSettlements(filtered);
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

  const handleTourSelect = (tourId: string) => {
    if (tourId) {
      router.push(`/admin/tours/${tourId}/settlement`);
    }
  };

  const filteredSettlements = settlements.filter((s) => {
    if (searchTerm) {
      return s.tour_title.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-8 h-8" />
              정산 관리
            </h1>
            <p className="mt-2 text-gray-600">투어별 정산 현황을 확인하고 관리할 수 있습니다.</p>
          </div>
          <div className="flex gap-3">
            {/* 투어 선택 드롭다운 */}
            <div className="relative">
              <select
                value={selectedTourId}
                onChange={(e) => {
                  setSelectedTourId(e.target.value);
                  if (e.target.value) {
                    handleTourSelect(e.target.value);
                  }
                }}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[300px]"
              >
                <option value="">투어 선택하여 정산 입력...</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title} ({new Date(tour.start_date).toLocaleDateString("ko-KR")})
                  </option>
                ))}
              </select>
              <Plus className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
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
                onClick={() => setFilter("not_started")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "not_started"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                정산 미시작
              </button>
              <button
                onClick={() => setFilter("in_progress")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "in_progress"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                정산 진행중
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "completed"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                정산 완료
              </button>
            </div>
        {/* 검색 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="투어명으로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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
                    확인
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettlements.map((settlement) => (
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
                      {settlement.settlement_status === "completed" ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          정산 완료
                        </span>
                      ) : settlement.settlement_status === "in_progress" ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          정산 진행중
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          정산 미시작
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {settlement.needs_review ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1 justify-center">
                          <AlertCircle className="w-3 h-3" />
                          확인 필요
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          확인 완료
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
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

