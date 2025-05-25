"use client"

import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface ModernAdminHeaderProps {
  activeNav?: string;
}

export default function ModernAdminHeader({ activeNav = '대시보드' }: ModernAdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: '새로운 참가자', message: '임지복 님이 5/19 순천 투어에 등록했습니다.', time: '10분 전', read: false },
    { id: 2, title: '문서 생성 완료', message: '5/19 순천 투어 객실 배정표가 생성되었습니다.', time: '1시간 전', read: false },
    { id: 3, title: '투어 마감 임박', message: '5/12 영덕 투어가 85% 예약되었습니다.', time: '3시간 전', read: true },
    { id: 4, title: '새로운 메시지', message: '김미정 님으로부터 새 메시지가 도착했습니다.', time: '5시간 전', read: true },
  ]);
  
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
      <h1 className="text-xl font-semibold text-gray-800">
        {activeNav}
      </h1>
      
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
        <button className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
            관
          </div>
          <div className="text-sm font-medium">관리자</div>
        </button>
      </div>
    </header>
  );
}