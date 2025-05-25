"use client"

import React, { useState } from 'react';
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
  Palette
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
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '대시보드', icon: <Home className="w-5 h-5" />, href: '/admin' },
    { id: 'tours', label: '투어 관리', icon: <Briefcase className="w-5 h-5" />, href: '/admin/tours' },
    { id: 'participants', label: '참가자 관리', icon: <Users className="w-5 h-5" />, href: '/admin/participants' },
    { id: 'documents', label: '문서 관리', icon: <FileText className="w-5 h-5" />, href: '/admin/documents' },
    { id: 'messages', label: '메시지', icon: <MessageSquare className="w-5 h-5" />, href: '/admin/messages' },
    { id: 'statistics', label: '통계', icon: <BarChart2 className="w-5 h-5" />, href: '/admin/statistics' },
    { id: 'settings', label: '설정', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' },
    { id: 'color-test', label: '색상 테스트', icon: <Palette className="w-5 h-5" />, href: '/admin/color-test' },
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
          className="p-2 rounded-md hover:bg-blue-700 focus:outline-none"
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
                  activeNav === item.id ? "bg-blue-900" : ""
                )}
                onClick={() => handleNavClick(item)}
              >
                <span className="text-blue-200">{item.icon}</span>
                {!isCollapsed && (
                  <span className="ml-4">{item.label}</span>
                )}
                {activeNav === item.id && !isCollapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar footer */}
      <div className="p-4 border-t border-blue-700">
        <button className="flex items-center text-blue-200 hover:text-white">
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-4">로그아웃</span>}
        </button>
      </div>
    </aside>
  );
}