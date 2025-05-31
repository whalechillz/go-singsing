"use client"

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import ModernAdminSidebar from './ModernAdminSidebar';
import ModernAdminHeader from './ModernAdminHeader';

interface ModernAdminLayoutProps {
  children: React.ReactNode;
}

export default function ModernAdminLayout({ children }: ModernAdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  // 경로에 따른 페이지 제목 매핑
  const getPageTitle = () => {
    if (pathname === '/admin') return '대시보드';
    if (pathname.includes('/room-assignment')) return '투어별 객실 배정';
    if (pathname.includes('/tee-time')) return '투어별 티오프시간 관리';
    if (pathname.startsWith('/admin/tour-products')) return '여행상품 관리';
    if (pathname.startsWith('/admin/tours')) return '투어 스케줄 관리';
    if (pathname.startsWith('/admin/participants')) return '참가자 목록';
    if (pathname.startsWith('/admin/payments')) return '결제 관리';
    if (pathname.startsWith('/admin/documents')) return '문서 관리';
    if (pathname.startsWith('/admin/boarding-places')) return '탑승지 관리';
    if (pathname.startsWith('/admin/memos')) return '참가자 메모';
    if (pathname.startsWith('/admin/work-memos')) return '업무 메모';
    if (pathname.startsWith('/admin/memo-templates')) return '메모 템플릿';
    if (pathname.startsWith('/admin/statistics')) return '통계';
    if (pathname.startsWith('/admin/settings')) return '설정';
    return '대시보드';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <ModernAdminSidebar 
        isCollapsed={!isSidebarOpen} 
        onCollapse={(collapsed) => setIsSidebarOpen(!collapsed)}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ModernAdminHeader activeNav={getPageTitle()} />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}