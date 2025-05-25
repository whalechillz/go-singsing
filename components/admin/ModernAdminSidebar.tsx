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
  ChevronLeft,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  Menu
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: SubMenuItem[];
  disabled?: boolean;
}

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface ModernAdminSidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function ModernAdminSidebar({ isCollapsed, onCollapse }: ModernAdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['tours']);
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: <Home className="h-5 w-5" />,
      href: '/admin',
    },
    {
      id: 'tours',
      label: '투어 관리',
      icon: <Briefcase className="h-5 w-5" />,
      subItems: [
        { 
          id: 'tour-schedule', 
          label: '투어 스케쥴 관리', 
          href: '/admin/tours',
          icon: <Calendar className="h-4 w-4" />
        },
        { 
          id: 'tour-products', 
          label: '여행상품 관리', 
          href: '/admin/tour-products',
          icon: <Package className="h-4 w-4" />
        },
        { 
          id: 'participants', 
          label: '참가자 관리', 
          href: '/admin/participants',
          icon: <Users className="h-4 w-4" />
        },
        { 
          id: 'boarding-places', 
          label: '탑승지 관리', 
          href: '/admin/boarding-places',
          icon: <MapPin className="h-4 w-4" />
        },
      ]
    },
    { 
      id: 'documents', 
      label: '문서 관리', 
      icon: <FileText className="h-5 w-5" />, 
      href: '/admin/documents' 
    },
    { 
      id: 'messages', 
      label: '메시지', 
      icon: <MessageSquare className="h-5 w-5" />, 
      href: '/admin/messages',
      disabled: true
    },
    { 
      id: 'accounting', 
      label: '정산 관리', 
      icon: <CreditCard className="h-5 w-5" />, 
      href: '/admin/accounting',
      disabled: true 
    },
    { 
      id: 'statistics', 
      label: '통계', 
      icon: <BarChart2 className="h-5 w-5" />, 
      href: '/admin/statistics',
      disabled: true 
    },
    { 
      id: 'settings', 
      label: '설정', 
      icon: <Settings className="h-5 w-5" />, 
      href: '/admin/settings',
      disabled: true 
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const navigate = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  const isActive = (href?: string, subItems?: SubMenuItem[]): boolean => {
    if (href) {
      return pathname === href;
    }
    if (subItems) {
      return subItems.some(item => pathname === item.href);
    }
    return false;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-md p-2 text-foreground hover:bg-accent lg:hidden"
        onClick={() => onCollapse(!isCollapsed)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card transition-all duration-300 ease-in-out",
        "border-r shadow-sm",
        isCollapsed ? "w-20" : "w-64",
        "lg:translate-x-0",
        !isCollapsed && "translate-x-0",
        isCollapsed && "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">싱싱골프투어</h2>
          )}
          <button
            onClick={() => onCollapse(!isCollapsed)}
            className="rounded-md p-1.5 hover:bg-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive(item.href, item.subItems) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItems.includes(item.id) && "rotate-90"
                          )}
                        />
                      )}
                    </button>
                    {!isCollapsed && expandedItems.includes(item.id) && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.id}>
                            <button
                              onClick={() => navigate(subItem.href)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                pathname === subItem.href && "bg-accent text-accent-foreground font-medium"
                              )}
                            >
                              {subItem.icon}
                              <span>{subItem.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(item.href)}
                    disabled={item.disabled}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href) && "bg-accent text-accent-foreground",
                      item.disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <>
                        <span>{item.label}</span>
                        {item.disabled && (
                          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
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

        {/* Footer */}
        <div className="border-t p-4">
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>로그아웃</span>}
          </button>
        </div>
      </aside>
    </>
  );
}