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
  Bus
} from 'lucide-react';
import MemoWidget from '@/components/memo/MemoWidget';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface DashboardData {
  todayTours: {
    departing: Tour[];
    returning: Tour[];
  };
  upcomingTours: Tour[];
  stats: {
    monthlyTours: number;
    monthlyParticipants: number;
    totalExpectedRevenue: number;  // 총 계약 견적 매출
    totalCollected: number;        // 이번달 수금액
    unpaidAmount: number;          // 미수금
  };
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
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
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

      // 실제 수금액 계산 (완료된 결제만)
      const { data: payments } = await supabase
        .from('singsing_payments')
        .select('amount, payment_status')
        .in('tour_id', monthlyTours?.map(t => t.id) || []);

      const totalCollected = payments?.reduce((sum, p) => 
        p.payment_status === 'completed' ? sum + p.amount : sum, 0
      ) || 0;
      
      // 미수금 계산
      const unpaidAmount = totalExpectedRevenue - totalCollected;

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
          unpaidAmount
        },
        urgentTasks,
        recentActivities: [] // TODO: 실제 활동 로그 구현
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setIsLoading(false);
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
          <button 
            onClick={fetchDashboardData}
            className="text-blue-600 hover:text-blue-800"
          >
            새로고침
          </button>
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
        <div className="bg-white rounded-lg shadow p-6">
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
          <div className="mt-4 text-sm text-gray-500">
            진행 예정
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
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
          <div className="mt-4 text-sm text-gray-500">
            총 예약 인원
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 계약 견적 매출</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.stats.totalExpectedRevenue.toLocaleString()}원
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            예상 매출액
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
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
          <div className="mt-4 text-sm text-gray-500">
            실제 수금액
          </div>
        </div>
      </div>

      {/* 미수금 및 수금률 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">미수금</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {dashboardData.stats.unpaidAmount.toLocaleString()}원
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">수금률</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {dashboardData.stats.totalExpectedRevenue > 0 
                  ? Math.round((dashboardData.stats.totalCollected / dashboardData.stats.totalExpectedRevenue) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            수금 진행률
          </div>
        </div>
      </div>
      
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
