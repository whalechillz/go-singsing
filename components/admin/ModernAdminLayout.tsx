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
    if (pathname.startsWith('/admin/tours')) return '투어 관리';
    if (pathname.startsWith('/admin/participants')) return '참가자 관리';
    if (pathname.startsWith('/admin/documents')) return '문서 관리';
    if (pathname.startsWith('/admin/boarding-places')) return '탑승지 관리';
    if (pathname.startsWith('/admin/tour-products')) return '여행상품 관리';
    if (pathname.startsWith('/admin/color-test')) return '색상 테스트';
    return '대시보드';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <ModernAdminSidebar 
        isCollapsed={!isSidebarOpen} 
        onCollapse={setIsSidebarOpen}
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