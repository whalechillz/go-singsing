"use client"

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  ChevronDown, 
  Menu,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  subMenu?: SubMenuItem[];
  disabled?: boolean;
}

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export default function AdminSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['tours']);
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: <Home className="w-5 h-5" />,
      href: '/admin',
    },
    {
      id: 'tours',
      label: '투어 관리',
      icon: <Briefcase className="w-5 h-5" />,
      subMenu: [
        { 
          id: 'tour-schedule', 
          label: '투어 스케쥴 관리', 
          href: '/admin/tours',
          icon: <Calendar className="w-4 h-4" />
        },
        { 
          id: 'participants', 
          label: '참가자 관리', 
          href: '/admin/participants',
          icon: <Users className="w-4 h-4" />
        },
        { 
          id: 'boarding-places', 
          label: '탑승지 관리', 
          href: '/admin/boarding-places',
          icon: <MapPin className="w-4 h-4" />
        },
      ]
    },
    { 
      id: 'documents', 
      label: '문서 관리', 
      icon: <FileText className="w-5 h-5" />, 
      href: '/admin/documents' 
    },
    { 
      id: 'messages', 
      label: '메시지', 
      icon: <MessageSquare className="w-5 h-5" />, 
      href: '/admin/messages' 
    },
    { 
      id: 'accounting', 
      label: '정산 관리', 
      icon: <CreditCard className="w-5 h-5" />, 
      href: '/admin/accounting',
      disabled: true 
    },
    { 
      id: 'statistics', 
      label: '통계', 
      icon: <BarChart2 className="w-5 h-5" />, 
      href: '/admin/statistics',
      disabled: true 
    },
    { 
      id: 'settings', 
      label: '설정', 
      icon: <Settings className="w-5 h-5" />, 
      href: '/admin/settings',
      disabled: true 
    },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleSubMenu = (itemId: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  const handleLogout = () => {
    // TODO: 로그아웃 로직 구현
    console.log('Logout clicked');
  };

  const isActiveRoute = (href?: string, subMenu?: SubMenuItem[]): boolean => {
    if (href) {
      return pathname === href;
    }
    if (subMenu) {
      return subMenu.some(item => pathname === item.href);
    }
    return false;
  };

  return (
    <aside 
      className={`bg-blue-800 text-white transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } flex flex-col`}
    >
      {/* Sidebar header */}
      <div className="p-4 flex items-center justify-between">
        {isSidebarOpen && (
          <div className="font-bold text-xl">싱싱골프투어</div>
        )}
        <button 
          className="p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-6 px-2">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.id}>
              {item.subMenu ? (
                <>
                  <button
                    className={`w-full flex items-center py-3 px-3 rounded-lg hover:bg-blue-700 transition-colors ${
                      isActiveRoute(item.href, item.subMenu) ? 'bg-blue-900' : ''
                    }`}
                    onClick={() => toggleSubMenu(item.id)}
                  >
                    <span className="text-blue-200">{item.icon}</span>
                    {isSidebarOpen && (
                      <>
                        <span className="ml-3 font-medium">{item.label}</span>
                        <span className="ml-auto">
                          {expandedMenus.includes(item.id) ? (
                            <ChevronDown className="w-4 h-4 text-blue-200" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-blue-200" />
                          )}
                        </span>
                      </>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {expandedMenus.includes(item.id) && isSidebarOpen && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.subMenu.map(sub => (
                        <li key={sub.id}>
                          <button
                            className={`w-full flex items-center gap-2 py-2 px-3 rounded-md hover:bg-blue-700 text-sm transition-colors ${
                              pathname === sub.href ? 'bg-blue-700' : ''
                            }`}
                            onClick={() => handleNavClick(sub.href)}
                          >
                            {sub.icon && <span className="text-blue-300">{sub.icon}</span>}
                            <span>{sub.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  className={`w-full flex items-center py-3 px-3 rounded-lg hover:bg-blue-700 transition-colors ${
                    isActiveRoute(item.href) ? 'bg-blue-900' : ''
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !item.disabled && handleNavClick(item.href)}
                  disabled={item.disabled}
                >
                  <span className="text-blue-200">{item.icon}</span>
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3 font-medium">{item.label}</span>
                      {item.disabled && (
                        <span className="ml-auto text-xs bg-blue-700 px-2 py-1 rounded text-blue-200">
                          준비중
                        </span>
                      )}
                    </>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar footer */}
      <div className="p-4 border-t border-blue-700">
        <button 
          className="w-full flex items-center text-blue-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-blue-700"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {isSidebarOpen && <span className="ml-3">로그아웃</span>}
        </button>
      </div>
    </aside>
  );
}