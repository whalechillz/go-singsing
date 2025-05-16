"use client"

import React, { useState } from 'react';
import { FileText, Briefcase, MessageSquare, User, CreditCard, BarChart2, Settings, LogOut, ChevronRight, ChevronDown, Menu } from 'lucide-react';

interface AdminSidebarLayoutProps {
  children: React.ReactNode;
}

const AdminSidebarLayout: React.FC<AdminSidebarLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [openSubMenu, setOpenSubMenu] = useState(false);

  const navItems = [
    {
      id: 'tours',
      label: '투어 관리',
      icon: <Briefcase className="w-5 h-5" />,
      subMenu: [
        { id: 'tours-main', label: '투어 관리', href: '/admin/tours' },
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
  // TODO: 투어 현황표 메뉴/탑승지 관리 버튼 삭제, 투어 관리 서브메뉴 구조 최신화. 알림톡/전체회원/정산 등은 추후 개발 예정.

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSubMenu = () => setOpenSubMenu(!openSubMenu);
  const handleNavClick = (href: string, id: string) => {
    setActiveNav(id);
    if (href) window.location.href = href;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-blue-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        {/* Sidebar header */}
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="font-bold text-xl">싱싱골프투어</div>
          )}
          <button className="p-2 rounded-md hover:bg-blue-700 focus:outline-none" onClick={toggleSidebar} aria-label={isSidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 mt-6">
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                {item.subMenu ? (
                  <>
                    <button
                      className={`w-full flex items-center py-3 px-4 hover:bg-blue-700 transition-colors ${activeNav === item.id ? 'bg-blue-900' : ''}`}
                      onClick={toggleSubMenu}
                    >
                      <span className="text-blue-200">{item.icon}</span>
                      {isSidebarOpen && <span className="ml-4">{item.label}</span>}
                      {isSidebarOpen && (
                        openSubMenu ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                    {/* Submenu */}
                    {openSubMenu && isSidebarOpen && (
                      <ul className="ml-8">
                        {item.subMenu.map(sub => (
                          <li key={sub.id}>
                            <button
                              className="w-full flex items-center py-2 px-4 hover:bg-blue-700 text-sm"
                              onClick={() => handleNavClick(sub.href, sub.id)}
                            >
                              <span>{sub.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <button
                    className={`w-full flex items-center py-3 px-4 hover:bg-blue-700 transition-colors ${activeNav === item.id ? 'bg-blue-900' : ''}`}
                    onClick={() => handleNavClick(item.href, item.id)}
                  >
                    <span className="text-blue-200">{item.icon}</span>
                    {isSidebarOpen && <span className="ml-4">{item.label}</span>}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Sidebar footer */}
        <div className="p-4 border-t border-blue-700">
          <button className="flex items-center text-blue-200 hover:text-white">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-4">로그아웃</span>}
          </button>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            관리자
          </h1>
        </header>
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminSidebarLayout; 