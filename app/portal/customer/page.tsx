"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Camera, Trophy, Users, ChevronRight, LogOut, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser, signOut, UserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface TourHistory {
  id: string;
  tour_id: string;
  tour_title: string;
  start_date: string;
  end_date: string;
  golf_course: string;
  photos?: string[];
  memo?: string;
}

const CustomerPortal = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tourHistory, setTourHistory] = useState<TourHistory[]>([]);
  const [upcomingTours, setUpcomingTours] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTours: 0,
    totalGolfCourses: 0,
    totalFriends: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const userData = await getCurrentUser();
      if (!userData || userData.role !== 'customer') {
        router.push('/login');
        return;
      }
      setUser(userData);
      await loadUserData(userData.id);
    };
    checkUser();
  }, [router]);

  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      // 여기에 실제 데이터 로드 로직 추가
      // 임시 데이터
      setTourHistory([
        {
          id: '1',
          tour_id: '1',
          tour_title: '제주도 오션비치 투어',
          start_date: '2024-10-15',
          end_date: '2024-10-17',
          golf_course: '오션비치 CC',
          memo: '날씨가 정말 좋았고, 벚꽃이 막 피기 시작했어요.'
        }
      ]);
      
      setStats({
        totalTours: 12,
        totalGolfCourses: 8,
        totalFriends: 15
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-purple-700 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">싱싱골프투어</h1>
              <p className="text-sm text-purple-200">{user?.name || user?.email}님 환영합니다</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded hover:bg-purple-800 transition"
            >
              <LogOut className="w-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 나의 골프 통계 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🏆 나의 골프 기록</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">{stats.totalTours}</div>
              <div className="text-sm text-gray-600">총 투어 횟수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">{stats.totalGolfCourses}</div>
              <div className="text-sm text-gray-600">방문 골프장</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">{stats.totalFriends}</div>
              <div className="text-sm text-gray-600">함께한 친구</div>
            </div>
          </div>
        </div>

        {/* 다가오는 투어 */}
        {upcomingTours.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📅 다가오는 나의 투어</h2>
            {/* 투어 정보 */}
          </div>
        )}

        {/* 나의 골프 추억 앨범 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📸 나의 골프 추억</h2>
            <button className="text-purple-700 text-sm font-medium">
              전체보기 →
            </button>
          </div>

          {tourHistory.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">아직 등록된 추억이 없습니다</p>
              <p className="text-sm text-gray-500 mt-1">투어 후 사진과 메모를 남겨보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tourHistory.map(tour => (
                <div key={tour.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{tour.tour_title}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(tour.start_date)} - {formatDate(tour.end_date)}
                      </p>
                      <p className="text-sm text-gray-600">⛳ {tour.golf_course}</p>
                    </div>
                    <button className="text-purple-700">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {tour.memo && (
                    <div className="bg-gray-50 rounded p-3 mt-3">
                      <p className="text-sm text-gray-700">✍️ {tour.memo}</p>
                    </div>
                  )}

                  {tour.photos && tour.photos.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {tour.photos.slice(0, 4).map((photo, idx) => (
                        <div key={idx} className="w-20 h-20 bg-gray-200 rounded"></div>
                      ))}
                      {tour.photos.length > 4 && (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                          +{tour.photos.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 새 투어 예약 버튼 */}
        <div className="fixed bottom-6 right-6">
          <a
            href="/"
            className="flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-800 transition"
          >
            <Plus className="w-5 h-5" />
            새 투어 예약
          </a>
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;
