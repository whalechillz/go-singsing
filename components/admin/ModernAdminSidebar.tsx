"use client"

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart2, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  Palette,
  Package
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

interface ModernAdminSidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function ModernAdminSidebar({ isCollapsed, onCollapse }: ModernAdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // pathname에 따라 activeNav 결정
  const getActiveNav = () => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname.startsWith('/admin/tours')) return 'tours';
    if (pathname.startsWith('/admin/tour-products')) return 'tour-products';
    if (pathname.startsWith('/admin/participants')) return 'participants';
    if (pathname.startsWith('/admin/documents')) return 'documents';
    if (pathname.startsWith('/admin/color-test')) return 'color-test';
    return 'dashboard';
  };
  
  const [activeNav, setActiveNav] = useState(getActiveNav());
  
  // pathname 변경 시 activeNav 업데이트
  useEffect(() => {
    setActiveNav(getActiveNav());
  }, [pathname]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '대시보드', icon: <Home className="w-5 h-5" />, href: '/admin' },
    { id: 'tour-products', label: '투어 상품 관리', icon: <Package className="w-5 h-5" />, href: '/admin/tour-products' },
    { id: 'tours', label: '투어 스케줄 관리', icon: <Briefcase className="w-5 h-5" />, href: '/admin/tours' },
    { id: 'participants', label: '전체 참가자 관리', icon: <Users className="w-5 h-5" />, href: '/admin/participants' },
    { id: 'documents', label: '문서 관리', icon: <FileText className="w-5 h-5" />, href: '/admin/documents' },
    { id: 'statistics', label: '통계', icon: <BarChart2 className="w-5 h-5" />, href: '/admin/statistics' },
    { id: 'settings', label: '설정', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' },
  ];

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <aside 
      className={cn(
        "bg-blue-800 text-white transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar header */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="font-bold text-xl">싱싱골프투어</div>
        )}
        <button 
          className="p-2 rounded-md hover:bg-blue-700 focus:outline-none transition-colors"
          onClick={() => onCollapse(!isCollapsed)}
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-6">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                className={cn(
                  "w-full flex items-center py-3 px-4 hover:bg-blue-700 transition-colors",
                  activeNav === item.id ? "bg-blue-900" : "",
                  isCollapsed ? "justify-center" : ""
                )}
                onClick={() => handleNavClick(item)}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-blue-200">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="ml-4">{item.label}</span>
                    {activeNav === item.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar footer */}
      <div className="p-4 border-t border-blue-700">
        <button className={cn(
          "flex items-center text-blue-200 hover:text-white",
          isCollapsed ? "justify-center" : ""
        )}>
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-4">로그아웃</span>}
        </button>
      </div>
    </aside>
  );
}