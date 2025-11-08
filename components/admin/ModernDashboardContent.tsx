"use client"

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  CreditCard, 
  FileText, 
  AlertCircle,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Bus,
  DollarSign,
  Calculator,
  X,
  RefreshCw
} from 'lucide-react';
import MemoWidget from '@/components/memo/MemoWidget';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import MonthlyRevenueChart, { MonthlyRevenue } from '@/components/admin/MonthlyRevenueChart';
import MonthlyRevenueTable from '@/components/admin/MonthlyRevenueTable';

interface DashboardData {
  todayTours: {
    departing: Tour[];
    returning: Tour[];
  };
  upcomingTours: Tour[];
  stats: {
    monthlyTours: number;
    monthlyParticipants: number;
    totalExpectedRevenue: number;  // 총 계약 견적 매출 (예상 매출)
    totalCollected: number;        // 이번달 수금액
    unpaidAmount: number;          // 미수금
  };
  tourStats: {
    completedToursMonthly: number;
    completedToursYearly: number;
    upcomingToursMonthly: number;
    upcomingToursYearly: number;
  };
  paymentStats: {
    totalRevenue: number;           // 총 수입
    totalRevenueMonthly: number;   // 이번달 총 수입
    depositAmount: number;          // 계약금
    balanceAmount: number;          // 잔금
    fullPaymentAmount: number;      // 전액 입금
    fullyPaidAmount: number;       // 완납 금액
    partiallyPaidAmount: number;    // 미수금 (부분납부)
    unpaidAmount: number;          // 미납
    settlementAmount: number;      // 정산 금액
    refundedAmount: number;        // 환불 금액
    collectionRate: number;         // 수금률
  };
  monthlyRevenue: MonthlyRevenue[]; // 월별 매출 데이터
  urgentTasks: UrgentTask[];
  recentActivities: Activity[];
}

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  participants: number;
  max_participants: number;
  status: string;
  departure_location?: string;
}

interface UrgentTask {
  id: string;
  type: 'document' | 'payment' | 'participant';
  title: string;
  description: string;
  dueDate: string;
  tourId?: string;
}

interface Activity {
  id: string;
  type: 'participant' | 'payment' | 'tour';
  description: string;
  timestamp: string;
}

export default function ModernDashboardContentV2() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  // 데이터 가져오기
  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
      
      // 이번 달 투어 가져오기
      const { data: monthlyTours } = await supabase
        .from('singsing_tours')
        .select('*')
        .gte('start_date', startOfMonth.toISOString())
        .lte('start_date', endOfMonth.toISOString());

      // 오늘 출발/도착 투어
      const todayStr = today.toISOString().split('T')[0];
      const departingTours = monthlyTours?.filter(t => 
        t.start_date.startsWith(todayStr)
      ) || [];
      const returningTours = monthlyTours?.filter(t => 
        t.end_date.startsWith(todayStr)
      ) || [];

      // 다가오는 투어 (7일 이내)
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);
      
      const { data: upcomingTours } = await supabase
        .from('singsing_tours')
        .select('*')
        .gt('start_date', today.toISOString())
        .lte('start_date', sevenDaysLater.toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      // 완료된 투어 통계 (월간, 연간)
      const { count: completedToursMonthly } = await supabase
        .from('singsing_tours')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('end_date', startOfMonth.toISOString())
        .lte('end_date', endOfMonth.toISOString());

      const { count: completedToursYearly } = await supabase
        .from('singsing_tours')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('end_date', startOfYear.toISOString())
        .lte('end_date', endOfYear.toISOString());

      // 예정인 투어 통계 (월간, 연간)
      const { count: upcomingToursMonthly } = await supabase
        .from('singsing_tours')
        .select('*', { count: 'exact', head: true })
        .in('status', ['upcoming', 'ongoing'])
        .gte('start_date', startOfMonth.toISOString())
        .lte('start_date', endOfMonth.toISOString());

      const { count: upcomingToursYearly } = await supabase
        .from('singsing_tours')
        .select('*', { count: 'exact', head: true })
        .in('status', ['upcoming', 'ongoing'])
        .gte('start_date', startOfYear.toISOString())
        .lte('start_date', endOfYear.toISOString());

      // 이번 달 참가자 수 및 매출 계산
      let monthlyParticipants = 0;
      let totalExpectedRevenue = 0;  // 총 계약 견적 매출
      
      if (monthlyTours) {
        for (const tour of monthlyTours) {
          const { count } = await supabase
            .from('singsing_participants')
            .select('*', { count: 'exact', head: true })
            .eq('tour_id', tour.id);
          
          monthlyParticipants += count || 0;
          totalExpectedRevenue += (tour.price || 0) * (count || 0);
        }
      }

      // 모든 투어 가져오기 (결제 통계용)
      const { data: allTours } = await supabase
        .from('singsing_tours')
        .select('id, price');

      // 모든 참가자 가져오기
      const { data: allParticipants } = await supabase
        .from('singsing_participants')
        .select('id, tour_id');

      // 모든 결제 내역 가져오기
      const { data: allPayments } = await supabase
        .from('singsing_payments')
        .select('participant_id, amount, payment_type, payment_status, payment_date')
        .neq('payment_status', 'refunded');

      // 이번 달 결제 내역
      const { data: monthlyPayments } = await supabase
        .from('singsing_payments')
        .select('participant_id, amount, payment_type, payment_status, payment_date')
        .neq('payment_status', 'refunded')
        .gte('payment_date', startOfMonth.toISOString())
        .lte('payment_date', endOfMonth.toISOString());

      // 환불 금액
      const { data: refundedPayments } = await supabase
        .from('singsing_payments')
        .select('amount')
        .eq('payment_status', 'refunded');

      // 결제 통계 계산
      const totalRevenue = allPayments?.reduce((sum, p) => 
        p.payment_status === 'completed' ? sum + p.amount : sum, 0
      ) || 0;

      const totalRevenueMonthly = monthlyPayments?.reduce((sum, p) => 
        p.payment_status === 'completed' ? sum + p.amount : sum, 0
      ) || 0;

      const depositAmount = allPayments?.filter(p => 
        p.payment_type === 'deposit' && p.payment_status === 'completed'
      ).reduce((sum, p) => sum + p.amount, 0) || 0;

      const balanceAmount = allPayments?.filter(p => 
        p.payment_type === 'balance' && p.payment_status === 'completed'
      ).reduce((sum, p) => sum + p.amount, 0) || 0;

      const fullPaymentAmount = allPayments?.filter(p => 
        p.payment_type === 'full' && p.payment_status === 'completed'
      ).reduce((sum, p) => sum + p.amount, 0) || 0;

      const refundedAmount = refundedPayments?.reduce((sum, p) => 
        sum + Math.abs(p.amount), 0
      ) || 0;

      // 참가자별 결제 현황 계산
      const participantPaymentStatus = allParticipants?.map(participant => {
        const participantPayments = allPayments?.filter(p => 
          p.participant_id === participant.id
        ) || [];
        const totalPaid = participantPayments.reduce((sum, p) => sum + p.amount, 0);
        const tourPrice = Number(allTours?.find(t => t.id === participant.tour_id)?.price || 0);
        
        return {
          participant,
          totalPaid,
          tourPrice,
          remainingAmount: tourPrice - totalPaid,
          isFullyPaid: totalPaid >= tourPrice
        };
      }) || [];

      // 완납 금액
      const fullyPaidAmount = participantPaymentStatus
        .filter(p => p.isFullyPaid)
        .reduce((sum, p) => sum + p.totalPaid, 0);

      // 미수금 (부분납부)
      const partiallyPaidAmount = participantPaymentStatus
        .filter(p => p.totalPaid > 0 && !p.isFullyPaid)
        .reduce((sum, p) => sum + p.remainingAmount, 0);

      // 미납
      const unpaidAmount = participantPaymentStatus
        .filter(p => p.totalPaid === 0)
        .reduce((sum, p) => sum + p.remainingAmount, 0);

      // 정산 금액
      const settlementAmount = totalRevenue - refundedAmount;

      // 수금률
      const totalExpectedRevenueAll = participantPaymentStatus.reduce((sum, p) => 
        sum + p.tourPrice, 0
      );
      const collectionRate = totalExpectedRevenueAll > 0 
        ? Math.round((totalRevenue / totalExpectedRevenueAll) * 100)
        : 0;

      // 실제 수금액 계산 (완료된 결제만)
      const totalCollected = totalRevenueMonthly;

      // 긴급 작업 생성
      const urgentTasks: UrgentTask[] = [];
      
      // 내일 출발 투어 문서 체크
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const tomorrowTours = monthlyTours?.filter(t => 
        t.start_date.startsWith(tomorrowStr)
      ) || [];
      
      tomorrowTours.forEach(tour => {
        urgentTasks.push({
          id: `doc-${tour.id}`,
          type: 'document',
          title: '문서 생성 필요',
          description: `${tour.title} - 탑승 안내, 객실 배정표`,
          dueDate: tour.start_date,
          tourId: tour.id
        });
      });

      // 미납 참가자 체크
      if (unpaidAmount > 0) {
        urgentTasks.push({
          id: 'payment-reminder',
          type: 'payment',
          title: '미수금 확인 필요',
          description: `이번 달 미수금: ${unpaidAmount.toLocaleString()}원`,
          dueDate: endOfMonth.toISOString()
        });
      }

      // 월별 매출 데이터 가져오기 (올해 1월부터 현재까지)
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      
      // 올해 1월부터 현재까지의 모든 결제 내역
      const { data: yearPayments } = await supabase
        .from('singsing_payments')
        .select('amount, payment_type, payment_status, payment_date')
        .gte('payment_date', startOfYear.toISOString())
        .lte('payment_date', endOfCurrentMonth.toISOString())
        .eq('payment_status', 'completed');

      // 올해 1월부터 현재까지의 모든 투어
      const { data: yearTours } = await supabase
        .from('singsing_tours')
        .select('id, price, start_date')
        .gte('start_date', startOfYear.toISOString())
        .lte('start_date', endOfCurrentMonth.toISOString());

      // 올해 1월부터 현재까지의 모든 참가자
      const { data: yearParticipants } = await supabase
        .from('singsing_participants')
        .select('id, tour_id');

      // 월별 데이터 그룹화
      const monthlyDataMap: { [key: string]: MonthlyRevenue } = {};
      
      // 현재 월까지의 모든 월 초기화
      for (let month = 0; month <= today.getMonth(); month++) {
        const monthKey = `${today.getFullYear()}-${String(month + 1).padStart(2, '0')}`;
        const monthLabel = `${month + 1}월`;
        monthlyDataMap[monthKey] = {
          month: monthKey,
          monthLabel,
          totalRevenue: 0,
          totalCost: 0,
          margin: 0,
          marginRate: 0,
          depositAmount: 0,
          balanceAmount: 0,
          fullPaymentAmount: 0,
          refundedAmount: 0,
          participantCount: 0,
          tourCount: 0
        };
      }

      // 월별 결제 데이터 집계
      if (yearPayments) {
        yearPayments.forEach(payment => {
          const paymentDate = new Date(payment.payment_date);
          const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey].totalRevenue += payment.amount || 0;
            
            if (payment.payment_type === 'deposit') {
              monthlyDataMap[monthKey].depositAmount += payment.amount || 0;
            } else if (payment.payment_type === 'balance') {
              monthlyDataMap[monthKey].balanceAmount += payment.amount || 0;
            } else if (payment.payment_type === 'full') {
              monthlyDataMap[monthKey].fullPaymentAmount += payment.amount || 0;
            }
          }
        });
      }

      // 월별 환불 데이터 집계
      const { data: yearRefunds } = await supabase
        .from('singsing_payments')
        .select('amount, payment_date')
        .gte('payment_date', startOfYear.toISOString())
        .lte('payment_date', endOfCurrentMonth.toISOString())
        .eq('payment_status', 'refunded');

      if (yearRefunds) {
        yearRefunds.forEach(refund => {
          const refundDate = new Date(refund.payment_date);
          const monthKey = `${refundDate.getFullYear()}-${String(refundDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey].refundedAmount += Math.abs(refund.amount || 0);
          }
        });
      }

      // 월별 투어 비용 및 참가자 수 계산
      if (yearTours && yearParticipants) {
        yearTours.forEach(tour => {
          const tourDate = new Date(tour.start_date);
          const monthKey = `${tourDate.getFullYear()}-${String(tourDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (monthlyDataMap[monthKey]) {
            // 해당 월의 투어 수 증가
            monthlyDataMap[monthKey].tourCount += 1;
            
            // 해당 투어의 참가자 수 계산
            const tourParticipants = yearParticipants.filter(p => p.tour_id === tour.id);
            monthlyDataMap[monthKey].participantCount += tourParticipants.length;
            
            // 투어 비용 계산 (투어 가격 * 참가자 수)
            const tourCost = (tour.price || 0) * tourParticipants.length;
            monthlyDataMap[monthKey].totalCost += tourCost;
          }
        });
      }

      // 마진 및 마진률 계산
      const monthlyRevenue: MonthlyRevenue[] = Object.values(monthlyDataMap).map(month => {
        const margin = month.totalRevenue - month.totalCost;
        const marginRate = month.totalRevenue > 0 
          ? (margin / month.totalRevenue) * 100 
          : 0;
        
        return {
          ...month,
          margin,
          marginRate
        };
      }).sort((a, b) => a.month.localeCompare(b.month));

      setDashboardData({
        todayTours: {
          departing: departingTours,
          returning: returningTours
        },
        upcomingTours: upcomingTours || [],
        stats: {
          monthlyTours: monthlyTours?.length || 0,
          monthlyParticipants,
          totalExpectedRevenue,
          totalCollected,
          unpaidAmount: partiallyPaidAmount + unpaidAmount
        },
        tourStats: {
          completedToursMonthly: completedToursMonthly || 0,
          completedToursYearly: completedToursYearly || 0,
          upcomingToursMonthly: upcomingToursMonthly || 0,
          upcomingToursYearly: upcomingToursYearly || 0
        },
        paymentStats: {
          totalRevenue,
          totalRevenueMonthly,
          depositAmount,
          balanceAmount,
          fullPaymentAmount,
          fullyPaidAmount,
          partiallyPaidAmount,
          unpaidAmount,
          settlementAmount,
          refundedAmount,
          collectionRate
        },
        monthlyRevenue,
        urgentTasks,
        recentActivities: [] // TODO: 실제 활동 로그 구현
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* 현재 시간 및 인사 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">싱싱골프투어 대시보드</h1>
            <p className="text-gray-500 mt-1">
              {currentTime.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })} {formatTime(currentTime)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPeriod(period === 'monthly' ? 'yearly' : 'monthly')}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {period === 'monthly' ? '월간' : '연간'}
            </button>
            <button 
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 오늘의 투어 현황 */}
      {(dashboardData.todayTours.departing.length > 0 || 
        dashboardData.todayTours.returning.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-yellow-600" />
            <h2 className="font-bold text-gray-900">오늘의 투어</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.todayTours.departing.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  <Bus className="inline w-4 h-4 mr-1" />
                  출발 투어
                </h3>
                {dashboardData.todayTours.departing.map(tour => (
                  <div key={tour.id} className="text-sm text-gray-600">
                    • {tour.title} ({tour.participants}명)
                  </div>
                ))}
              </div>
            )}
            {dashboardData.todayTours.returning.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  도착 투어
                </h3>
                {dashboardData.todayTours.returning.map(tour => (
                  <div key={tour.id} className="text-sm text-gray-600">
                    • {tour.title} ({tour.participants}명)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 긴급 작업 */}
      {dashboardData.urgentTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-gray-900">긴급 처리 필요</h2>
          </div>
          <div className="space-y-2">
            {dashboardData.urgentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-600">{task.description}</div>
                </div>
                {task.tourId && (
                  <Link
                    href={`/admin/tours/${task.tourId}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    처리하기
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이번 달 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/admin/tours" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이번 달 투어</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.stats.monthlyTours}개
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
              투어 목록 보기 →
            </div>
          </div>
        </Link>
        
        <Link href="/admin/participants" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이번 달 참가자</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.stats.monthlyParticipants}명
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
              참가자 목록 보기 →
            </div>
          </div>
        </Link>
        
        <Link href="/admin/payments" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">예상 매출</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.stats.totalExpectedRevenue.toLocaleString()}원
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
              결제 관리 보기 →
            </div>
          </div>
        </Link>
        
        <Link href="/admin/payments" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이번달 수금액</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {dashboardData.stats.totalCollected.toLocaleString()}원
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
              결제 관리 보기 →
            </div>
          </div>
        </Link>
      </div>

      {/* 완료된 투어 / 예정인 투어 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">투어 통계</h2>
          <span className="text-sm text-gray-500">
            {period === 'monthly' ? '이번 달' : '올해'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/tours?status=completed" className="block">
            <div className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
              <p className="text-sm font-medium text-green-700">완료된 투어</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {period === 'monthly' 
                  ? dashboardData.tourStats.completedToursMonthly 
                  : dashboardData.tourStats.completedToursYearly}개
              </p>
            </div>
          </Link>
          <Link href="/admin/tours?status=upcoming" className="block">
            <div className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors">
              <p className="text-sm font-medium text-blue-700">예정인 투어</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {period === 'monthly' 
                  ? dashboardData.tourStats.upcomingToursMonthly 
                  : dashboardData.tourStats.upcomingToursYearly}개
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 결제 통계 - 첫 번째 줄 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">결제 통계</h2>
          <Link href="/admin/payments" className="text-sm text-blue-600 hover:text-blue-800">
            결제 관리 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <Link href="/admin/payments" className="block">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-600">총 수입</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {dashboardData.paymentStats.totalRevenue.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500 mt-1">
                이번달: {dashboardData.paymentStats.totalRevenueMonthly.toLocaleString()}원
              </p>
            </div>
          </Link>
          <Link href="/admin/payments?type=deposit" className="block">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-600">계약금</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {dashboardData.paymentStats.depositAmount.toLocaleString()}원
              </p>
            </div>
          </Link>
          <Link href="/admin/payments?type=balance" className="block">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-600">잔금</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {dashboardData.paymentStats.balanceAmount.toLocaleString()}원
              </p>
            </div>
          </Link>
          <Link href="/admin/payments?type=full" className="block">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-600">전액 입금</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {dashboardData.paymentStats.fullPaymentAmount.toLocaleString()}원
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 결제 통계 - 두 번째 줄 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/admin/payments" className="block">
          <div className="bg-green-50 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">완납 금액</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {dashboardData.paymentStats.fullyPaidAmount.toLocaleString()}원
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
              결제 관리 보기 →
            </div>
          </div>
        </Link>

        <Link href="/admin/payments" className="block">
          <div className="bg-orange-50 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-orange-700">미수금</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {dashboardData.paymentStats.partiallyPaidAmount.toLocaleString()}원
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800 text-center">
              결제 관리 보기 →
            </div>
          </div>
        </Link>

        <Link href="/admin/payments" className="block">
          <div className="bg-red-50 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-red-700">미납</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {dashboardData.paymentStats.unpaidAmount.toLocaleString()}원
                </p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800 text-center">
              결제 관리 보기 →
            </div>
          </div>
        </Link>

        <Link href="/admin/payments" className="block">
          <div className="bg-indigo-50 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-700">정산 금액</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">
                  {dashboardData.paymentStats.settlementAmount.toLocaleString()}원
                </p>
                <p className="text-xs text-indigo-600 mt-2">
                  총 수입: {dashboardData.paymentStats.totalRevenue.toLocaleString()}원 - 
                  환불: {dashboardData.paymentStats.refundedAmount.toLocaleString()}원
                </p>
              </div>
              <Calculator className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
              결제 관리 보기 →
            </div>
          </div>
        </Link>
      </div>

      {/* 미수금 및 수금률 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">미수금</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {(dashboardData.paymentStats.partiallyPaidAmount + dashboardData.paymentStats.unpaidAmount).toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500 mt-1">
                부분납부: {dashboardData.paymentStats.partiallyPaidAmount.toLocaleString()}원 | 
                미납: {dashboardData.paymentStats.unpaidAmount.toLocaleString()}원
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/payments"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              결제 관리 →
            </Link>
          </div>
        </div>

        <Link href="/admin/payments" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">수금률</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {dashboardData.paymentStats.collectionRate}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
              결제 관리 보기 →
            </div>
          </div>
        </Link>
      </div>

      {/* 월별 매출 현황 */}
      {dashboardData.monthlyRevenue && dashboardData.monthlyRevenue.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">월별 매출 현황</h2>
            <span className="text-sm text-gray-500">
              {new Date().getFullYear()}년 1월 ~ {new Date().getMonth() + 1}월
            </span>
          </div>
          
          {/* 차트 */}
          <div className="mb-6">
            <MonthlyRevenueChart 
              data={dashboardData.monthlyRevenue} 
              chartType="line"
              showCost={true}
            />
          </div>

          {/* 요약 테이블 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 매출 요약</h3>
            <MonthlyRevenueTable 
              data={dashboardData.monthlyRevenue}
              showDetails={false}
            />
          </div>
        </div>
      )}
      
      {/* 다가오는 투어 (7일 이내) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">다가오는 투어 (7일 이내)</h2>
          <Link
            href="/admin/tours"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            전체 보기 →
          </Link>
        </div>
        {dashboardData.upcomingTours.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">투어명</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">출발일</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">참가자</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">D-Day</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.upcomingTours.map(tour => {
                  const dDay = Math.ceil((new Date(tour.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tour.title}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(tour.start_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center">
                          <Users className="w-4 h-4 text-gray-500 mr-1" />
                          <span>{tour.participants || 0}/{tour.max_participants || 28}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                          dDay <= 1 ? 'bg-red-100 text-red-800' : 
                          dDay <= 3 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          D-{dDay}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/tours/${tour.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세보기
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            7일 이내 예정된 투어가 없습니다.
          </div>
        )}
      </div>
      
      {/* 메모 위젯 */}
      <MemoWidget />
      
      {/* 빠른 링크 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-bold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/tours/new"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Briefcase className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium">새 투어 등록</span>
          </Link>
          <Link
            href="/admin/participants"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium">참가자 관리</span>
          </Link>
          <Link
            href="/admin/payments"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CreditCard className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium">결제 관리</span>
          </Link>
          <Link
            href="/admin/documents"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium">문서 생성</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
