'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Info, AlertCircle, Cloud, Clock } from 'lucide-react';

interface Notice {
  id: string;
  content: string;
  priority: number;
  type: string;
  created_at?: string;
  showConditions?: {
    hoursBeforeCheckin?: number;
    weather?: string[];
  };
}

interface SwipeableNoticeProps {
  notices: Notice[];
  tourStartDate?: string;
}

const noticeTypeConfig = {
  general: { 
    icon: Info, 
    bgColor: 'bg-red-100', 
    iconColor: 'text-red-600' 
  },
  weather: { 
    icon: Cloud, 
    bgColor: 'bg-blue-100', 
    iconColor: 'text-blue-600' 
  },
  checkin: { 
    icon: Clock, 
    bgColor: 'bg-green-100', 
    iconColor: 'text-green-600' 
  },
  important: { 
    icon: AlertCircle, 
    bgColor: 'bg-orange-100', 
    iconColor: 'text-orange-600' 
  }
};

export default function SwipeableNotice({ notices, tourStartDate }: SwipeableNoticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [autoPlayPaused, setAutoPlayPaused] = useState(false);

  // 필터링된 공지사항 (조건에 맞는 것만 표시)
  const filteredNotices = notices.filter(notice => {
    if (!notice.showConditions) return true;
    
    // 체크인 시간 조건 확인
    if (notice.showConditions.hoursBeforeCheckin && tourStartDate) {
      const now = new Date();
      const checkIn = new Date(tourStartDate);
      const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilCheckIn > notice.showConditions.hoursBeforeCheckin) {
        return false;
      }
    }
    
    return true;
  });

  // 우선순위로 정렬
  const sortedNotices = [...filteredNotices].sort((a, b) => a.priority - b.priority);

  // 자동 재생
  useEffect(() => {
    if (sortedNotices.length <= 1 || autoPlayPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedNotices.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, [sortedNotices.length, autoPlayPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
    setAutoPlayPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    setDragOffset(currentX - touchStartX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    setTouchEndX(e.changedTouches[0].clientX);
    setIsDragging(false);
    
    const swipeThreshold = 50;
    const diff = touchStartX - e.changedTouches[0].clientX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // 왼쪽으로 스와이프 (다음)
        goToNext();
      } else {
        // 오른쪽으로 스와이프 (이전)
        goToPrevious();
      }
    }
    
    setDragOffset(0);
    setTimeout(() => setAutoPlayPaused(false), 3000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedNotices.length) % sortedNotices.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedNotices.length);
  };

  if (!sortedNotices.length) return null;

  const currentNotice = sortedNotices[currentIndex];
  const config = noticeTypeConfig[currentNotice.type as keyof typeof noticeTypeConfig] || noticeTypeConfig.general;
  const Icon = config.icon;

  return (
    <div className="mb-8 -mx-5 px-5 py-4 bg-gradient-to-r from-red-50 to-yellow-50">
      <div className="relative">
        <div 
          className="bg-white border-2 border-red-300 rounded-2xl p-6 shadow-xl overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-start gap-3">
            <div className={`${config.bgColor} rounded-full p-2 flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${config.iconColor} animate-pulse`} />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-red-800 mb-3 text-lg flex items-center gap-2">
                <span className="animate-pulse">🚨</span> 긴급공지사항
                {sortedNotices.length > 1 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({currentIndex + 1}/{sortedNotices.length})
                  </span>
                )}
              </h3>
              <div 
                className="transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${isDragging ? dragOffset * 0.1 : 0}px)` }}
              >
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {currentNotice.content}
                </div>
              </div>
            </div>
          </div>

          {/* 네비게이션 버튼 (여러 개일 때만 표시) */}
          {sortedNotices.length > 1 && (
            <>
              <button
                onClick={() => {
                  goToPrevious();
                  setAutoPlayPaused(true);
                  setTimeout(() => setAutoPlayPaused(false), 3000);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                aria-label="이전 공지"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={() => {
                  goToNext();
                  setAutoPlayPaused(true);
                  setTimeout(() => setAutoPlayPaused(false), 3000);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                aria-label="다음 공지"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* 인디케이터 (여러 개일 때만 표시) */}
        {sortedNotices.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {sortedNotices.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoPlayPaused(true);
                  setTimeout(() => setAutoPlayPaused(false), 3000);
                }}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-red-500'
                    : 'w-2 h-2 bg-red-200 hover:bg-red-300'
                } rounded-full`}
                aria-label={`공지 ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* 스와이프 힌트 (모바일에서 여러 개일 때만 표시) */}
        {sortedNotices.length > 1 && (
          <div className="text-center mt-2 text-xs text-gray-500 md:hidden">
            좌우로 스와이프하여 다른 공지사항을 확인하세요
          </div>
        )}
      </div>
    </div>
  );
}
