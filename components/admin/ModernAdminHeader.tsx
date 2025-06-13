"use client"

import React, { useState, useEffect } from 'react';
import { Bell, X, User, LogOut, Menu } from 'lucide-react';
import { getCurrentUser, signOut, UserProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface ModernAdminHeaderProps {
  activeNav?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function ModernAdminHeader({ 
  activeNav = '대시보드',
  onMenuClick,
  showMenuButton = false 
}: ModernAdminHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: '새로운 참가자', message: '임지복 님이 5/19 순천 투어에 등록했습니다.', time: '10분 전', read: false },
    { id: 2, title: '문서 생성 완료', message: '5/19 순천 투어 객실 배정표가 생성되었습니다.', time: '1시간 전', read: false },
    { id: 3, title: '투어 마감 임박', message: '5/12 영덕 투어가 85% 예약되었습니다.', time: '3시간 전', read: true },
    { id: 4, title: '새로운 메시지', message: '김미정 님으로부터 새 메시지가 도착했습니다.', time: '5시간 전', read: true },
  ]);
  
  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('로그아웃 시도 중...');
      const result = await signOut();
      console.log('로그아웃 결과:', result);
      
      if (result.success) {
        // 로컬 스토리지 및 세션 스토리지 클리어
        localStorage.clear();
        sessionStorage.clear();
        
        // 강제 리다이렉트
        window.location.href = '/login';
      } else {
        console.error('로그아웃 실패:', result.error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "관리자";
      case "manager":
        return "매니저";
      case "staff":
        return "스탭";
      default:
        return "직원";
    }
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
  
  return (
    <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors md:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-800">
          {activeNav}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2.5 h-2.5"></span>
            )}
          </button>
          
          {/* Notifications panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-10 border">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">알림</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">알림이 없습니다.</div>
                ) : (
                  <div>
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          notification.read ? 'bg-white' : 'bg-blue-50'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-gray-900">{notification.title}</div>
                          <div className="text-xs text-gray-500">{notification.time}</div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">모든 알림 보기</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile */}
        {user && (
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-md px-3 py-2 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                {user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">{getRoleName(user.role)}</p>
              </div>
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">{getRoleName(user.role)}</p>
                </div>
                <a
                  href="/admin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">내 정보 / 비밀번호 변경</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}