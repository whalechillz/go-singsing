"use client"

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Search, 
  User,
  Sun,
  Moon,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function ModernAdminHeader() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState<Notification[]>([
    { 
      id: 1, 
      title: '새로운 참가자', 
      message: '임지복 님이 5/19 순천 투어에 등록했습니다.', 
      time: '10분 전', 
      read: false,
      type: 'info' 
    },
    { 
      id: 2, 
      title: '문서 생성 완료', 
      message: '5/19 순천 투어 객실 배정표가 생성되었습니다.', 
      time: '1시간 전', 
      read: false,
      type: 'success' 
    },
    { 
      id: 3, 
      title: '투어 마감 임박', 
      message: '5/12 영덕 투어가 85% 예약되었습니다.', 
      time: '3시간 전', 
      read: true,
      type: 'warning' 
    },
  ]);

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      '/admin': '대시보드',
      '/admin/tours': '투어 스케쥴 관리',
      '/admin/tour-products': '여행상품 관리',
      '/admin/participants': '참가자 관리',
      '/admin/boarding-places': '탑승지 관리',
      '/admin/documents': '문서 관리',
      '/admin/messages': '메시지',
      '/admin/accounting': '정산 관리',
      '/admin/statistics': '통계',
      '/admin/settings': '설정',
    };
    return titles[pathname] || '관리자';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center justify-between">
        {/* Page title & Search */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold md:text-2xl">
            {getPageTitle()}
          </h1>
          
          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="검색..."
                className={cn(
                  "h-9 w-64 rounded-md border bg-background pl-9 pr-3 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
              />
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className={cn(
                "relative rounded-md p-2 hover:bg-accent",
                showNotifications && "bg-accent"
              )}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover p-0 shadow-lg">
                <div className="border-b px-4 py-3">
                  <h3 className="font-semibold">알림</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "border-b px-4 py-3 hover:bg-accent cursor-pointer",
                        !notification.read && "bg-accent/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-1 h-2 w-2 rounded-full",
                          notification.type === 'success' && "bg-green-500",
                          notification.type === 'warning' && "bg-yellow-500",
                          notification.type === 'error' && "bg-red-500",
                          notification.type === 'info' && "bg-blue-500"
                        )} />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3 text-center">
                  <button className="text-sm font-medium text-primary hover:underline">
                    모든 알림 보기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md p-2 hover:bg-accent",
                showUserMenu && "bg-accent"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-sm font-medium">관</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">관리자</p>
                  <p className="text-xs text-muted-foreground">admin@singsinggolf.kr</p>
                </div>
                <div className="h-px bg-border my-1" />
                <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                  <User className="h-4 w-4" />
                  프로필
                </button>
                <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                  <Settings className="h-4 w-4" />
                  설정
                </button>
                <div className="h-px bg-border my-1" />
                <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-destructive">
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}