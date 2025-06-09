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
    if (pathname.startsWith('/admin/attractions')) return '스팟 관리';
    if (pathname.startsWith('/admin/memos')) return '참가자 메모';
    if (pathname.startsWith('/admin/work-memos')) return '업무 메모';
    if (pathname.startsWith('/admin/memo-templates')) return '메모 템플릿';
    if (pathname.startsWith('/admin/tour-staff')) return '투어 운영진';
    if (pathname.startsWith('/admin/staff')) return '투어 운영진'; // 기존 URL 호환성
    if (pathname.startsWith('/admin/users')) return '사용자 관리';
    if (pathname.startsWith('/admin/roles')) return '권한 관리';
    if (pathname.startsWith('/admin/customers')) return '고객 데이터베이스';
    if (pathname.startsWith('/admin/messages')) return '메시지 발송';
    if (pathname.startsWith('/admin/campaigns')) return '마케팅 캠페인';
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