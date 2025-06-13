"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Send, CheckCircle, XCircle,
  DollarSign, Calendar, Clock, MessageSquare, BarChart3
} from "lucide-react";

type DailyStats = {
  date: string;
  sms_count: number;
  lms_count: number;
  mms_count: number;
  kakao_count: number;
  total_count: number;
  total_cost: number;
  success_rate: number;
};

type MonthlyStats = {
  month: string;
  total_count: number;
  total_cost: number;
  avg_success_rate: number;
};

type MessageTypeStats = {
  type: string;
  count: number;
  cost: number;
  percentage: number;
};

export default function MessageStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // 통계 데이터
  const [summary, setSummary] = useState({
    total_sent: 0,
    total_cost: 0,
    success_rate: 0,
    avg_daily_count: 0,
    growth_rate: 0
  });
  
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [typeStats, setTypeStats] = useState<MessageTypeStats[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  // 데이터 불러오기
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      
      if (dateRange === "week") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === "month") {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // 전체 메시지 로그 가져오기
      const { data: logs, error } = await supabase
        .from("message_logs")
        .select(`
          *,
          customer:customer_id (
            name,
            phone
          )
        `)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 통계 계산
      calculateStatistics(logs || []);
      
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산
  const calculateStatistics = (logs: any[]) => {
    // 요약 통계
    const totalSent = logs.length;
    const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const successCount = logs.filter(log => log.status === "sent" || log.status === "delivered").length;
    const successRate = totalSent > 0 ? (successCount / totalSent) * 100 : 0;

    // 일일 통계
    const dailyData: { [key: string]: any } = {};
    logs.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          sms_count: 0,
          lms_count: 0,
          mms_count: 0,
          kakao_count: 0,
          total_count: 0,
          total_cost: 0,
          success_count: 0
        };
      }
      
      dailyData[date].total_count++;
      dailyData[date].total_cost += log.cost || 0;
      
      if (log.message_type === "sms") dailyData[date].sms_count++;
      else if (log.message_type === "lms") dailyData[date].lms_count++;
      else if (log.message_type === "mms") dailyData[date].mms_count++;
      else if (log.message_type === "kakao_alimtalk") dailyData[date].kakao_count++;
      
      if (log.status === "sent" || log.status === "delivered") {
        dailyData[date].success_count++;
      }
    });

    const dailyArray = Object.values(dailyData).map((day: any) => ({
      ...day,
      success_rate: day.total_count > 0 ? (day.success_count / day.total_count) * 100 : 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    setDailyStats(dailyArray);

    // 월별 통계
    const monthlyData: { [key: string]: any } = {};
    logs.forEach(log => {
      const month = new Date(log.created_at).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          total_count: 0,
          total_cost: 0,
          success_count: 0
        };
      }
      
      monthlyData[month].total_count++;
      monthlyData[month].total_cost += log.cost || 0;
      
      if (log.status === "sent" || log.status === "delivered") {
        monthlyData[month].success_count++;
      }
    });

    const monthlyArray = Object.values(monthlyData).map((month: any) => ({
      ...month,
      avg_success_rate: month.total_count > 0 ? (month.success_count / month.total_count) * 100 : 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    setMonthlyStats(monthlyArray);

    // 메시지 타입별 통계
    const typeData: { [key: string]: any } = {};
    logs.forEach(log => {
      if (!typeData[log.message_type]) {
        typeData[log.message_type] = {
          type: log.message_type,
          count: 0,
          cost: 0
        };
      }
      typeData[log.message_type].count++;
      typeData[log.message_type].cost += log.cost || 0;
    });

    const typeArray = Object.values(typeData).map((type: any) => ({
      ...type,
      percentage: totalSent > 0 ? (type.count / totalSent) * 100 : 0
    }));

    setTypeStats(typeArray);

    // 시간대별 분포
    const hourlyData: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }
    
    logs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      hourlyData[hour]++;
    });

    const hourlyArray = Object.entries(hourlyData).map(([hour, count]) => ({
      hour: `${hour}시`,
      count
    }));

    setHourlyDistribution(hourlyArray);

    // 상위 고객
    const customerData: { [key: string]: any } = {};
    logs.forEach(log => {
      if (log.customer) {
        const customerId = log.customer_id;
        if (!customerData[customerId]) {
          customerData[customerId] = {
            id: customerId,
            name: log.customer.name,
            phone: log.customer.phone,
            count: 0,
            cost: 0
          };
        }
        customerData[customerId].count++;
        customerData[customerId].cost += log.cost || 0;
      }
    });

    const customerArray = Object.values(customerData)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setTopCustomers(customerArray);

    // 성장률 계산
    const avgDailyCount = dailyArray.length > 0 
      ? dailyArray.reduce((sum, day) => sum + day.total_count, 0) / dailyArray.length 
      : 0;

    let growthRate = 0;
    if (dailyArray.length >= 2) {
      const recent = dailyArray.slice(-7).reduce((sum, day) => sum + day.total_count, 0) / 7;
      const previous = dailyArray.slice(-14, -7).reduce((sum, day) => sum + day.total_count, 0) / 7;
      if (previous > 0) {
        growthRate = ((recent - previous) / previous) * 100;
      }
    }

    setSummary({
      total_sent: totalSent,
      total_cost: totalCost,
      success_rate: successRate,
      avg_daily_count: avgDailyCount,
      growth_rate: growthRate
    });
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  // 차트 색상
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">메시지 발송 통계</h1>
        <p className="text-gray-600 mt-1">메시지 발송 현황과 비용을 분석합니다.</p>
      </div>

      {/* 기간 선택 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setDateRange("week")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dateRange === "week"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          최근 1주일
        </button>
        <button
          onClick={() => setDateRange("month")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dateRange === "month"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          최근 1개월
        </button>
        <button
          onClick={() => setDateRange("year")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dateRange === "year"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          최근 1년
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 발송</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.total_sent.toLocaleString()}건
                  </p>
                </div>
                <Send className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 비용</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.total_cost.toLocaleString()}원
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">성공률</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.success_rate.toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">일평균</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.avg_daily_count.toFixed(0)}건
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">성장률</p>
                  <p className={`text-2xl font-bold ${
                    summary.growth_rate >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {summary.growth_rate > 0 ? "+" : ""}{summary.growth_rate.toFixed(1)}%
                  </p>
                </div>
                {summary.growth_rate >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 일별 발송 추이 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">일별 발송 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                    formatter={(value: any) => value.toLocaleString()}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total_count" stroke="#3B82F6" name="발송 건수" strokeWidth={2} />
                  <Line type="monotone" dataKey="success_rate" stroke="#10B981" name="성공률(%)" strokeWidth={2} yAxisId="right" />
                  <YAxis yAxisId="right" orientation="right" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 메시지 타입별 분포 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">메시지 타입별 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {typeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => value.toLocaleString() + "건"} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* 타입별 상세 */}
              <div className="mt-4 space-y-2">
                {typeStats.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">
                        {type.type === "sms" ? "SMS" :
                         type.type === "lms" ? "LMS" :
                         type.type === "mms" ? "MMS" : "카카오 알림톡"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{type.count.toLocaleString()}건</p>
                      <p className="text-xs text-gray-500">{type.cost.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 시간대별 발송 분포 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">시간대별 발송 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="발송 건수" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 상위 고객 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">메시지 수신 상위 고객</h3>
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{customer.count}건</p>
                      <p className="text-xs text-gray-500">{customer.cost.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 월별 통계 (연간 보기일 때만) */}
          {dateRange === "year" && monthlyStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">월별 발송 통계</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}월`;
                    }}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${year}년 ${month}월`;
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "발송 건수") return value.toLocaleString() + "건";
                      if (name === "비용") return value.toLocaleString() + "원";
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="total_count" fill="#3B82F6" name="발송 건수" />
                  <Bar yAxisId="right" dataKey="total_cost" fill="#10B981" name="비용" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
