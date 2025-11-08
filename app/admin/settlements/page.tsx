"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, TrendingUp, TrendingDown, DollarSign, FileText, Plus, Search, AlertCircle, CheckCircle, RefreshCw, Clock, ArrowUpDown, ArrowUp, ArrowDown, Download, Filter } from "lucide-react";

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
  participant_count?: number; // 참가자 수
  com_per_person?: number; // 1인당 COM
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
  const [packageFilter, setPackageFilter] = useState<string>("all"); // 패키지 필터 (all, 순천, 영덕)
  const [sortField, setSortField] = useState<string>("start_date"); // 정렬 필드
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // 정렬 방향

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
      // 1. tour_settlements가 있는 투어 가져오기
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

      const { data: settlementsData, error: settlementsError } = await query;
      if (settlementsError) throw settlementsError;

      // 2. 모든 투어 가져오기 (정산 미시작 투어 포함)
      const { data: allTours, error: toursError } = await supabase
        .from("singsing_tours")
        .select("id, title, start_date, price")
        .is("quote_data", null)
        .order("start_date", { ascending: false })
        .limit(200);

      if (toursError) throw toursError;

      // 3. tour_settlements가 있는 투어 ID 목록
      const settledTourIds = new Set((settlementsData || []).map((s: any) => s.tour_id));

      // 4. tour_settlements가 있는 투어 처리
      const settlementsWithExpenses = await Promise.all(
        (settlementsData || []).map(async (item: any) => {
          const tour = Array.isArray(item.tour) ? item.tour[0] : item.tour;
          
          // tour_expenses 존재 여부 확인
          const { data: expenses } = await supabase
            .from("tour_expenses")
            .select("id")
            .eq("tour_id", item.tour_id)
            .single();
          
          const hasExpenses = !!expenses;
          
          // 참가자 수 확인
          const { count: participantCount } = await supabase
            .from("singsing_participants")
            .select("*", { count: "exact", head: true })
            .eq("tour_id", item.tour_id);
          
          // 정산 상태 결정
          let settlementStatus: 'not_started' | 'in_progress' | 'completed';
          if (item.status === "completed") {
            settlementStatus = "completed";
          } else if (hasExpenses) {
            settlementStatus = "in_progress";
          } else {
            settlementStatus = "not_started";
          }
          
          // 1인당 COM 계산
          const comPerPerson = participantCount && participantCount > 0
            ? Math.floor((item.margin || 0) / participantCount)
            : 0;
          
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
            participant_count: participantCount || 0,
            com_per_person: comPerPerson,
          };
        })
      );

      // 5. tour_settlements가 없는 투어 처리 (정산 미시작)
      const notStartedSettlements = await Promise.all(
        (allTours || [])
          .filter(tour => !settledTourIds.has(tour.id))
          .map(async (tour) => {
            // 참가자 수 확인
            const { count: participantCount } = await supabase
              .from("singsing_participants")
              .select("*", { count: "exact", head: true })
              .eq("tour_id", tour.id);

            // 계약 매출 계산 (상품가 × 참가자 수)
            const contractRevenue = (tour.price || 0) * (participantCount || 0);

            return {
              tour_id: tour.id,
              tour_title: tour.title || "투어명 없음",
              tour_start_date: tour.start_date || "",
              contract_revenue: contractRevenue,
              settlement_amount: 0,
              total_cost: 0,
              margin: 0,
              margin_rate: 0,
              status: "pending",
              needs_review: false,
              review_notes: "",
              has_expenses: false,
              settlement_status: "not_started" as const,
              participant_count: participantCount || 0,
              com_per_person: 0,
            };
          })
      );

      // 6. 모든 정산 합치기
      const allSettlements = [...settlementsWithExpenses, ...notStartedSettlements];

      // 7. 필터 적용
      let filtered = allSettlements;
      if (filter === "not_started") {
        filtered = allSettlements.filter(s => s.settlement_status === "not_started");
      } else if (filter === "in_progress") {
        filtered = allSettlements.filter(s => s.settlement_status === "in_progress");
      } else if (filter === "completed") {
        filtered = allSettlements.filter(s => s.settlement_status === "completed");
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

  // 정렬 및 필터링된 정산 목록
  const filteredSettlements = settlements
    .filter((s) => {
      // 검색어 필터
      if (searchTerm) {
        if (!s.tour_title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      // 패키지 필터
      if (packageFilter !== "all") {
        if (packageFilter === "순천" && !s.tour_title.includes("순천")) {
          return false;
        }
        if (packageFilter === "영덕" && !s.tour_title.includes("영덕")) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "start_date":
          aValue = new Date(a.tour_start_date).getTime();
          bValue = new Date(b.tour_start_date).getTime();
          break;
        case "contract_revenue":
          aValue = a.contract_revenue;
          bValue = b.contract_revenue;
          break;
        case "settlement_amount":
          aValue = a.settlement_amount;
          bValue = b.settlement_amount;
          break;
        case "margin":
          aValue = a.margin;
          bValue = b.margin;
          break;
        case "margin_rate":
          aValue = a.margin_rate;
          bValue = b.margin_rate;
          break;
        case "tour_title":
          aValue = a.tour_title;
          bValue = b.tour_title;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // 정렬 헤더 클릭 핸들러
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 정렬 아이콘 렌더링
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 inline ml-1 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 inline ml-1 text-blue-600" />
    );
  };

  // 패키지별 통계 계산
  const packageStats = {
    all: {
      count: filteredSettlements.length,
      avgMargin: filteredSettlements.length > 0
        ? filteredSettlements.reduce((sum, s) => sum + s.margin, 0) / filteredSettlements.length
        : 0,
      avgMarginRate: filteredSettlements.length > 0
        ? filteredSettlements.reduce((sum, s) => sum + s.margin_rate, 0) / filteredSettlements.length
        : 0,
      maxMargin: filteredSettlements.length > 0
        ? Math.max(...filteredSettlements.map(s => s.margin))
        : 0,
      minMargin: filteredSettlements.length > 0
        ? Math.min(...filteredSettlements.map(s => s.margin))
        : 0,
    },
    순천: {
      count: filteredSettlements.filter(s => s.tour_title.includes("순천")).length,
      avgMargin: 0,
      avgMarginRate: 0,
      maxMargin: 0,
      minMargin: 0,
    },
    영덕: {
      count: filteredSettlements.filter(s => s.tour_title.includes("영덕")).length,
      avgMargin: 0,
      avgMarginRate: 0,
      maxMargin: 0,
      minMargin: 0,
    },
  };

  // 순천 통계
  const suncheonSettlements = filteredSettlements.filter(s => s.tour_title.includes("순천"));
  if (suncheonSettlements.length > 0) {
    packageStats.순천.avgMargin = suncheonSettlements.reduce((sum, s) => sum + s.margin, 0) / suncheonSettlements.length;
    packageStats.순천.avgMarginRate = suncheonSettlements.reduce((sum, s) => sum + s.margin_rate, 0) / suncheonSettlements.length;
    packageStats.순천.maxMargin = Math.max(...suncheonSettlements.map(s => s.margin));
    packageStats.순천.minMargin = Math.min(...suncheonSettlements.map(s => s.margin));
  }

  // 영덕 통계
  const yeongdeokSettlements = filteredSettlements.filter(s => s.tour_title.includes("영덕"));
  if (yeongdeokSettlements.length > 0) {
    packageStats.영덕.avgMargin = yeongdeokSettlements.reduce((sum, s) => sum + s.margin, 0) / yeongdeokSettlements.length;
    packageStats.영덕.avgMarginRate = yeongdeokSettlements.reduce((sum, s) => sum + s.margin_rate, 0) / yeongdeokSettlements.length;
    packageStats.영덕.maxMargin = Math.max(...yeongdeokSettlements.map(s => s.margin));
    packageStats.영덕.minMargin = Math.min(...yeongdeokSettlements.map(s => s.margin));
  }

  // CSV 내보내기
  const exportToCSV = () => {
    const headers = ["투어명", "시작일", "계약 매출", "정산 금액", "총 원가", "마진", "마진률", "1인당 COM", "상태", "확인"];
    const rows = filteredSettlements.map(s => [
      s.tour_title,
      formatDate(s.tour_start_date),
      s.contract_revenue,
      s.settlement_amount,
      s.total_cost,
      s.margin,
      s.margin_rate.toFixed(2) + "%",
      s.com_per_person || 0,
      s.settlement_status === "completed" ? "정산 완료" : s.settlement_status === "in_progress" ? "정산 진행중" : "정산 미시작",
      s.needs_review ? "확인 필요" : "확인 완료",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `정산_목록_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 상태 필터 */}
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
          {/* 패키지 필터 */}
          <div className="flex gap-2 items-center">
            <Filter className="w-5 h-5 text-gray-500" />
            <button
              onClick={() => setPackageFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium ${
                packageFilter === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체 패키지
            </button>
            <button
              onClick={() => setPackageFilter("순천")}
              className={`px-4 py-2 rounded-lg font-medium ${
                packageFilter === "순천"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              순천 ({packageStats.순천.count})
            </button>
            <button
              onClick={() => setPackageFilter("영덕")}
              className={`px-4 py-2 rounded-lg font-medium ${
                packageFilter === "영덕"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              영덕 ({packageStats.영덕.count})
            </button>
          </div>
          {/* 검색 및 내보내기 */}
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="투어명으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              CSV 내보내기
            </button>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="space-y-4 mb-6">
        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        {/* 패키지별 통계 */}
        {(packageFilter === "all" || packageFilter === "순천") && packageStats.순천.count > 0 && (
          <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">순천 패키지 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">투어 수</div>
                <div className="text-xl font-bold text-gray-900">{packageStats.순천.count}개</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">평균 마진</div>
                <div className={`text-xl font-bold ${packageStats.순천.avgMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(Math.round(packageStats.순천.avgMargin))}원
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">평균 마진률</div>
                <div className={`text-xl font-bold ${packageStats.순천.avgMarginRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {packageStats.순천.avgMarginRate.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">최고/최저 마진</div>
                <div className="text-sm font-semibold text-gray-900">
                  <span className="text-green-600">{formatCurrency(packageStats.순천.maxMargin)}원</span>
                  {" / "}
                  <span className="text-red-600">{formatCurrency(packageStats.순천.minMargin)}원</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {(packageFilter === "all" || packageFilter === "영덕") && packageStats.영덕.count > 0 && (
          <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">영덕 패키지 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">투어 수</div>
                <div className="text-xl font-bold text-gray-900">{packageStats.영덕.count}개</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">평균 마진</div>
                <div className={`text-xl font-bold ${packageStats.영덕.avgMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(Math.round(packageStats.영덕.avgMargin))}원
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">평균 마진률</div>
                <div className={`text-xl font-bold ${packageStats.영덕.avgMarginRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {packageStats.영덕.avgMarginRate.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">최고/최저 마진</div>
                <div className="text-sm font-semibold text-gray-900">
                  <span className="text-green-600">{formatCurrency(packageStats.영덕.maxMargin)}원</span>
                  {" / "}
                  <span className="text-red-600">{formatCurrency(packageStats.영덕.minMargin)}원</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("tour_title")}
                  >
                    투어명 {getSortIcon("tour_title")}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("start_date")}
                  >
                    시작일 {getSortIcon("start_date")}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("contract_revenue")}
                  >
                    계약 매출 {getSortIcon("contract_revenue")}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("settlement_amount")}
                  >
                    정산 금액 {getSortIcon("settlement_amount")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 원가
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("margin")}
                  >
                    마진 {getSortIcon("margin")}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("margin_rate")}
                  >
                    마진률 {getSortIcon("margin_rate")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1인당 COM
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {settlement.participant_count && settlement.participant_count > 0
                        ? `${formatCurrency(settlement.com_per_person || 0)}원`
                        : "-"}
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

