"use client"

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, User, Search, X } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function AdminHeader() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
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

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            {getPageTitle()}
          </h1>
          
          {/* Search bar */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="검색..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2.5 h-2.5 flex items-center justify-center">
                  <span className="sr-only">{unreadCount}개의 읽지 않은 알림</span>
                </span>
              )}
            </button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50 border">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                  <h3 className="font-semibold text-gray-800">알림</h3>
                  <button 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      알림이 없습니다.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            notification.read ? 'bg-white' : 'bg-blue-50'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'error' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`} />
                                <div className="font-medium text-gray-900">{notification.title}</div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <div className="text-xs text-gray-500 ml-4">{notification.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t text-center bg-gray-50">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    모든 알림 보기
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative">
            <button 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                관
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">관리자</div>
                <div className="text-xs text-gray-500">admin@singsinggolf.kr</div>
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border">
                <div className="py-1">
                  <a href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    내 프로필
                  </a>
                  <a href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    설정
                  </a>
                  <hr className="my-1" />
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}