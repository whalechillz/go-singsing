"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Database, FileText, TrendingUp, Bell, Menu, X, ChevronRight, ChevronDown, LogOut, Settings, Home, User, Map, Phone, CreditCard, Mail, Send, Briefcase, MessageSquare, BarChart2 } from 'lucide-react';
import MemoWidget from '@/components/memo/MemoWidget';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(false);
  
  // Load dashboard data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = {
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
      
      const mockNotifications = [
        { id: 1, title: '새로운 참가자', message: '임지복 님이 5/19 순천 투어에 등록했습니다.', time: '10분 전', read: false },
        { id: 2, title: '문서 생성 완료', message: '5/19 순천 투어 객실 배정표가 생성되었습니다.', time: '1시간 전', read: false },
        { id: 3, title: '투어 마감 임박', message: '5/12 영덕 투어가 85% 예약되었습니다.', time: '3시간 전', read: true },
        { id: 4, title: '새로운 메시지', message: '김미정 님으로부터 새 메시지가 도착했습니다.', time: '5시간 전', read: true },
      ];
      
      setDashboardData(data);
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Toggle submenu
  const toggleSubMenu = () => setOpenSubMenu(!openSubMenu);
  
  // Handle navigation click
  const handleNavClick = (href: string, id: string) => {
    setActiveNav(id);
    if (href) window.location.href = href;
  };
  
  // Navigation items
  const navItems = [
    { id: 'tour-status', label: '투어 현황표', icon: <BarChart2 className="w-5 h-5" />, href: '/admin/tours' },
    {
      id: 'tours',
      label: '투어 스케쥴 관리',
      icon: <Briefcase className="w-5 h-5" />,
      subMenu: [
        { id: 'participants', label: '참가자 관리', href: '/admin/participants' },
        { id: 'rooms', label: '객실 배정', href: '/admin/rooms' },
        { id: 'schedule', label: '일정 관리', href: '/admin/schedule' },
        { id: 'tee-time', label: '티오프 시간 관리', href: '/admin/tee-time' },
        { id: 'boarding', label: '탑승지 관리', href: '/admin/boarding' },
      ]
    },
    { id: 'documents', label: '문서 관리', icon: <FileText className="w-5 h-5" />, href: '/admin/documents' },
    { id: 'notification', label: '알림톡 보내기', icon: <MessageSquare className="w-5 h-5" />, href: '/admin/notification' },
    { id: 'members', label: '전체회원 관리', icon: <User className="w-5 h-5" />, href: '/admin/members' },
    { id: 'accounting', label: '매출 매입 정산서 관리', icon: <CreditCard className="w-5 h-5" />, href: '/admin/accounting' },
    { id: 'statistics', label: '통계', icon: <BarChart2 className="w-5 h-5" />, href: '/admin/statistics' },
    { id: 'settings', label: '설정', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' },
  ];
  
  // TODO: 알림톡 보내기, 전체회원 관리, 매출 매입 정산서 관리 등은 추후 개발 예정. 해당 메뉴 클릭 시 라우트만 연결되어 있고, 실제 페이지/기능은 아직 구현되지 않음.
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };
  
  return (
    <div className="p-6">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 참가자</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.stats.totalParticipants}명
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                활성 참가자: {dashboardData.stats.activeParticipants}명
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">진행 중인 투어</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.stats.totalTours}개
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                마감된 투어: {dashboardData.upcomingTours.filter((t: any) => t.status === 'full').length}개
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(dashboardData.stats.revenue).replace('₩', '')}원
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                평균 투어당: {formatCurrency(dashboardData.stats.revenue / dashboardData.stats.totalTours).replace('₩', '')}원
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">미생성 문서</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.documentsToGenerate.length}개
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                문서 생성 필요
              </div>
            </div>
          </div>
          
          {/* Upcoming tours */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-900">다가오는 투어</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">투어명</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">일정</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">참가자</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.upcomingTours.map((tour: any) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tour.title}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{tour.date}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center">
                          <Users className="w-4 h-4 text-gray-500 mr-1" />
                          <span>{tour.participants}/{tour.maxParticipants}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                            tour.status === 'full' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {tour.status === 'full' ? '마감' : '모집중'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-900">상세보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Memo Widget */}
          <MemoWidget />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent participants */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-gray-900">최근 참가자</h2>
              </div>
              <div className="p-4">
                <div className="divide-y divide-gray-200">
                  {dashboardData.recentParticipants.map((participant: any) => (
                    <div key={participant.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                          {participant.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">{participant.phone}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{participant.joinDate}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    모든 참가자 보기
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-gray-900">최근 메시지</h2>
              </div>
              <div className="p-4">
                <div className="divide-y divide-gray-200">
                  {dashboardData.messages.map((message: any) => (
                    <div key={message.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="font-medium text-gray-900">{message.name}</div>
                          {!message.read && (
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{message.date}</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                      <div className="mt-2">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium" disabled>// TODO: 응답하기 기능 구현 필요</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    모든 메시지 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Documents to generate */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-900">생성해야 할 문서</h2>
            </div>
            <div className="p-4">
              <div className="divide-y divide-gray-200">
                {dashboardData.documentsToGenerate.map((doc: any) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded text-red-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{doc.templateName}</div>
                        <div className="text-sm text-gray-500">
                          {doc.tourTitle} ({doc.tourDate})
                        </div>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      생성하기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;