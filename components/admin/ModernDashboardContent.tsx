"use client"

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Briefcase, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

interface DashboardData {
  upcomingTours: Tour[];
  recentParticipants: Participant[];
  documentsToGenerate: Document[];
  stats: Stats;
  messages: Message[];
}

interface Tour {
  id: string;
  title: string;
  date: string;
  participants: number;
  maxParticipants: number;
  status: 'full' | 'active';
}

interface Participant {
  id: number;
  name: string;
  phone: string;
  joinDate: string;
  tourId: string;
}

interface Document {
  id: string;
  templateName: string;
  tourTitle: string;
  tourDate: string;
}

interface Stats {
  totalParticipants: number;
  activeParticipants: number;
  totalTours: number;
  revenue: number;
}

interface Message {
  id: number;
  name: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

export default function ModernDashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data: DashboardData = {
        upcomingTours: [
          { id: '2025-05-19', title: '순천 2박3일', date: '05/19(월)~21(수)', participants: 28, maxParticipants: 28, status: 'full' },
          { id: '2025-05-12', title: '영덕 2박3일', date: '05/12(월)~14(수)', participants: 24, maxParticipants: 28, status: 'active' },
          { id: '2025-06-16', title: '순천 2박3일', date: '06/16(월)~18(수)', participants: 18, maxParticipants: 28, status: 'active' },
        ],
        recentParticipants: [
          { id: 1, name: '임지복', phone: '010-5395-3958', joinDate: '2025-04-10', tourId: '2025-05-19' },
          { id: 2, name: '안혜경', phone: '010-8730-8917', joinDate: '2025-04-08', tourId: '2025-05-19' },
          { id: 3, name: '박묘철', phone: '010-9088-5327', joinDate: '2025-04-05', tourId: '2025-05-19' },
          { id: 4, name: '오규희', phone: '010-8597-1534', joinDate: '2025-04-02', tourId: '2025-05-12' },
        ],
        documentsToGenerate: [
          { id: 'boarding-guide-2025-06-16', templateName: '탑승지 안내', tourTitle: '순천 2박3일', tourDate: '06/16(월)~18(수)' },
          { id: 'room-assignment-2025-06-16', templateName: '객실 배정', tourTitle: '순천 2박3일', tourDate: '06/16(월)~18(수)' },
          { id: 'rounding-timetable-2025-06-16', templateName: '라운딩 시간표', tourTitle: '순천 2박3일', tourDate: '06/16(월)~18(수)' },
        ],
        stats: {
          totalParticipants: 70,
          activeParticipants: 70,
          totalTours: 3,
          revenue: 59600000
        },
        messages: [
          { id: 1, name: '김미정', phone: '010-8394-0823', message: '4인실 객실 배정 가능한가요?', date: '2025-04-15 14:22', read: false },
          { id: 2, name: '박승규', phone: '010-5432-1234', message: '부천체육관 주차 요금이 얼마인가요?', date: '2025-04-15 10:48', read: true },
          { id: 3, name: '이미자', phone: '010-5021-9735', message: '캐디피는 별도인가요?', date: '2025-04-14 18:05', read: true },
        ]
      };
      
      setDashboardData(data);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-destructive">
          <AlertCircle className="mx-auto h-12 w-12" />
          <p className="mt-4">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">총 참가자</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{dashboardData.stats.totalParticipants}명</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                활성: {dashboardData.stats.activeParticipants}명
              </span>
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">진행 중인 투어</h3>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{dashboardData.stats.totalTours}개</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="h-3 w-3" />
                마감: {dashboardData.upcomingTours.filter(t => t.status === 'full').length}개
              </span>
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">총 매출</h3>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{(dashboardData.stats.revenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              평균: {formatCurrency(dashboardData.stats.revenue / dashboardData.stats.totalTours).replace('₩', '')}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">미생성 문서</h3>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{dashboardData.documentsToGenerate.length}개</div>
            <p className="text-xs text-destructive">즉시 생성 필요</p>
          </div>
        </div>
      </div>

      {/* Upcoming Tours */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">다가오는 투어</h3>
            <a href="/admin/tours" className="text-sm font-medium text-primary hover:underline">
              전체 보기 →
            </a>
          </div>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {dashboardData.upcomingTours.map(tour => (
              <div key={tour.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">{tour.title}</p>
                  <p className="text-sm text-muted-foreground">{tour.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{tour.participants}/{tour.maxParticipants}</p>
                    <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-secondary">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          tour.status === 'full' ? 'bg-destructive' : 'bg-primary'
                        )}
                        style={{ width: `${(tour.participants / tour.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    tour.status === 'full' 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-primary/10 text-primary'
                  )}>
                    {tour.status === 'full' ? '마감' : '모집중'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Participants */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">최근 참가자</h3>
              <a href="/admin/participants" className="text-sm font-medium text-primary hover:underline">
                전체 보기 →
              </a>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {dashboardData.recentParticipants.map(participant => (
                <div key={participant.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="font-medium">{participant.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">{participant.phone}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{participant.joinDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">최근 메시지</h3>
              <a href="/admin/messages" className="text-sm font-medium text-primary hover:underline">
                전체 보기 →
              </a>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {dashboardData.messages.map(message => (
                <div key={message.id} className="space-y-2 rounded-lg border-l-4 border-primary pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {message.name}
                        {!message.read && (
                          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            New
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{message.date}</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <button className="flex items-center gap-1 text-primary hover:underline">
                      <Mail className="h-3 w-3" />
                      응답하기
                    </button>
                    <a 
                      href={`tel:${message.phone}`} 
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-3 w-3" />
                      {message.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}