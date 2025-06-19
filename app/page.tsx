"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Calendar, Clock, Globe, Users, Bookmark, FileText, Phone, MapPin, Lock, LogIn, LogOut, User, ChevronRight, ChevronDown, ChevronUp, Camera, BedDouble } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser, signOut, UserProfile } from "@/lib/auth";
import MemoList from "@/components/memo/MemoList";
import { useRouter } from "next/navigation";
import TourScheduleDisplay from "@/components/tour/TourScheduleDisplay";
import TourSchedulePreview from "@/components/tour/TourSchedulePreview";

// Tour 타입 정의
interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  golf_course?: string;
  accommodation?: string;
  departure_location?: string;
  max_participants?: number;
  current_participants?: number;
  marketing_participant_count?: number;
  price?: number;
  driver_name?: string;
  is_closed?: boolean;
  closed_reason?: string;
  closed_at?: string;
  tour_product_id?: string;
  // 뱃지 관련 필드 추가
  is_special_price?: boolean;
  special_badge_text?: string;
  badge_priority?: number;
}

const GolfTourPortal = () => {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [isStaffView, setIsStaffView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userTours, setUserTours] = useState<string[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  // Supabase에서 투어 목록 fetch
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("singsing_tours")
          .select("*")
          .is('quote_data', null)  // 견적서가 아닌 정식 투어만
          .order("start_date", { ascending: true });
        if (error) throw error;
        
        // 오늘 날짜 이후의 투어만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureTours = (data ?? []).filter((tour: Tour) => {
          const tourDate = new Date(tour.start_date);
          return tourDate >= today;
        });
        
        // tour_products 정보 가져오기
        const { data: productsData } = await supabase
          .from("tour_products")
          .select("id, name, golf_course, hotel");
        
        const productsMap = new Map(productsData?.map(p => [p.id, p]) || []);
        
        // 각 투어의 실제 참가자 수 계산
        const toursWithParticipants = await Promise.all(
          futureTours.map(async (tour) => {
            // 참가자 수 계산 (레코드 수)
            const { count: participantCount } = await supabase
              .from("singsing_participants")
              .select("id", { count: 'exact', head: true })
              .eq("tour_id", tour.id);
            
            // 실제 참가자 수 = 레코드 수 (줄 수)
            const totalParticipants = participantCount || 0;
            
            const product = tour.tour_product_id ? productsMap.get(tour.tour_product_id) : null;
            
            // 디버그 로그
            if (tour.title.includes("단둑투어")) {
              console.log('투어 정보:', tour.title);
              console.log('tour_product_id:', tour.tour_product_id);
              console.log('product:', product);
              console.log('hotel 필드:', product?.hotel);
            }
            
            return {
              ...tour,
              golf_course: tour.golf_course || product?.golf_course || product?.name || "",
              accommodation: tour.accommodation || product?.hotel || "",
              departure_location: tour.departure_location || "",
              current_participants: totalParticipants, // 실제 참가자 수 (레코드 수)
              max_participants: tour.max_participants || 40 // 기본값 40명
            };
          })
        );
        
        setTours(toursWithParticipants as Tour[]);
        
        // 첫 번째 월을 자동으로 펼침
        if (toursWithParticipants.length > 0) {
          const firstMonth = `${new Date(toursWithParticipants[0].start_date).getFullYear()}-${String(new Date(toursWithParticipants[0].start_date).getMonth() + 1).padStart(2, '0')}`;
          setExpandedMonths(new Set([firstMonth]));
        }
        
        setIsLoading(false);
      } catch (err) {
        setError("투어 정보를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      if (userData && (userData.role === 'staff' || userData.role === 'manager' || userData.role === 'admin')) {
        setIsStaffView(true);
      }
      
      // 사용자가 참가한 투어 목록 가져오기
      if (userData) {
        const { data: participantData } = await supabase
          .from('singsing_participants')
          .select('tour_id')
          .eq('email', userData.email);
        
        if (participantData) {
          setUserTours(participantData.map(p => p.tour_id));
        }
      }
    };
    fetchUser();
  }, []);

  const handleCardClick = (tour: Tour) => {
    // 같은 투어를 다시 클릭하면 닫기
    if (selectedTour && selectedTour.id === tour.id) {
      setSelectedTour(null);
      setShowPreview(false);
    } else {
      setSelectedTour(tour);
      // 비로그인 사용자는 일정 엿보기를 기본으로 표시
      setShowPreview(!user || (!isStaffView && !userTours.includes(tour.id)));
    }
  };

  const handleDocumentClick = (doc: any) => {
    if (doc.locked) {
      setModalContent(doc);
      setShowModal(true);
    } else {
      window.open(`/${doc.id}.html`, "_blank");
    }
  };

  const handlePasswordSubmit = () => {
    if (password === "singsinggolf2025") {
      setIsPasswordCorrect(true);
      setIsStaffView(true);
      setShowModal(false);
      if (modalContent) {
        window.open(`/${modalContent.id}.html`, "_blank");
      }
    } else {
      setIsPasswordCorrect(false);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      setUser(null);
      setIsStaffView(false);
      router.push('/');
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'manager':
        return '매니저';
      case 'staff':
        return '스탭';
      default:
        return '고객';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일(${dayOfWeek})`;
  };

  // 투어를 월별로 그룹화하는 함수
  const groupToursByMonth = (tours: Tour[]) => {
    const grouped = tours.reduce((acc, tour) => {
      const date = new Date(tour.start_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(tour);
      return acc;
    }, {} as Record<string, Tour[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  // 같은 투어의 여러 일정을 그룹화하는 함수
  const groupToursByProduct = (tours: Tour[]) => {
    const grouped = tours.reduce((acc, tour) => {
      // tour_product_id가 있으면 그것으로, 없으면 title로 그룹화
      const groupKey = tour.tour_product_id || tour.title;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(tour);
      return acc;
    }, {} as Record<string, Tour[]>);
    
    return Object.entries(grouped);
  };

  // 월 토글 함수
  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  // 월 이름 포맷 함수
  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  // 투어 뱃지 계산 함수
  const getTourBadges = (tour: Tour, allTours: Tour[]) => {
    const badges = [];
    const remaining = (tour.max_participants || 0) - (tour.current_participants || 0);
    
    // 1. 마감임박 (잔여석 3석 이하)
    if (remaining > 0 && remaining <= 3) {
      badges.push({ 
        type: 'urgent', 
        text: '마감임박', 
        icon: '⏰',
        priority: 3 
      });
    }
    
    // 2. 최저가 (같은 골프장 투어 중)
    const sameCourse = allTours.filter(t => 
      t.golf_course === tour.golf_course && 
      t.id !== tour.id &&
      !t.is_closed &&
      Math.abs(new Date(t.start_date).getTime() - new Date(tour.start_date).getTime()) <= 30 * 24 * 60 * 60 * 1000 // 30일 이내
    );
    
    if (sameCourse.length > 0) {
      const isCheapest = sameCourse.every(t => (tour.price || 0) <= (t.price || 0));
      if (isCheapest) {
        badges.push({ 
          type: 'cheapest', 
          text: '최저가', 
          icon: '💰',
          priority: 2 
        });
      }
    }
    
    // 3. 인기 (참가율 70% 이상)
    const participationRate = ((tour.current_participants || 0) / (tour.max_participants || 1)) * 100;
    if (participationRate >= 70 && participationRate < 100) {
      badges.push({ 
        type: 'popular', 
        text: '인기', 
        icon: '🔥',
        priority: 1 
      });
    }
    
    // 4. 수동 설정 뱃지 (DB에서 가져온 값)
    if (tour.is_special_price && tour.special_badge_text) {
      badges.push({
        type: 'special',
        text: tour.special_badge_text,
        icon: '⭐',
        priority: tour.badge_priority || 0
      });
    }
    
    // 우선순위 정렬, 최대 2개만 표시
    return badges.sort((a, b) => b.priority - a.priority).slice(0, 2);
  };

  // 뱃지 스타일 함수
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-600';
      case 'cheapest':
        return 'bg-green-100 text-green-700 border-green-600';
      case 'popular':
        return 'bg-orange-100 text-orange-700 border-orange-600';
      case 'special':
        return 'bg-purple-100 text-purple-700 border-purple-600';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-600';
    }
  };

  const getTourStatus = (tour: Tour) => {
    if (tour.is_closed) return 'closed';
    const remainingSeats = (tour.max_participants || 0) - (tour.current_participants || 0);
    if (remainingSeats <= 0) return 'full';
    if (remainingSeats <= 3) return 'almost-full';
    return 'available';
  };

  const renderTourCard = (tour: Tour) => {
    const isSelected = selectedTour && selectedTour.id === tour.id;
    const status = getTourStatus(tour);
    const remainingSeats = (tour.max_participants || 0) - (tour.current_participants || 0);
    const isAlmostFull = status === 'almost-full';
    const isFull = status === 'full' || status === 'closed';
    
    return (
      <div
        key={tour.id}
        className={`border-2 rounded-lg shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50" : "border-gray-200 bg-white"}`}
        onClick={() => handleCardClick(tour)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📅 {formatDate(tour.start_date)} 출발</h3>
            <div className="mt-1">
              <h4 className="text-blue-700 font-medium inline">{tour.title}</h4>
              {/* 뱃지 표시 */}
              {getTourBadges(tour, tours).length > 0 && (
                <div className="inline-flex gap-1 ml-2">
                  {getTourBadges(tour, tours).map((badge, index) => (
                    <span
                      key={index}
                      className={`px-2 py-0.5 text-xs font-bold rounded-full inline-flex items-center gap-1 border ${getBadgeStyle(badge.type)}`}
                    >
                      <span className="text-xs">{badge.icon}</span>
                      <span>{badge.text}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-600 mt-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{tour.golf_course}</span>
            </div>
            {tour.accommodation && (
              <div className="flex items-center text-gray-600 mt-1">
                <BedDouble className="w-4 h-4 mr-1" />
                <span className="text-sm">{tour.accommodation}</span>
              </div>
            )}
            {/* 출발 장소는 나중에 추가 예정 */}
            <div className="flex items-center text-gray-600 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">{tour.start_date} ~ {tour.end_date}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'closed' ? 'bg-red-100 text-red-700' :
            isFull ? 'bg-gray-100 text-gray-600' :
            isAlmostFull ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          }`}>
            {status === 'closed' ? (tour.closed_reason || '마감') :
             isFull ? '마감' : 
             `잔여 ${remainingSeats}석`}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
        <div>
        <span className="text-2xl font-bold text-gray-900">{tour.price?.toLocaleString()}원</span>
        <span className="text-sm text-gray-500 ml-1">/ 1인</span>
        </div>
        <div className="flex gap-2">
        {/* 미리보기 링크 추가 (스탭/관리자만) */}
        {isStaffView && (
        <a
        href={`/promo/${tour.id}?preview=true`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
        onClick={(e) => e.stopPropagation()}
        >
        <Camera className="w-4 h-4" />
        미리보기
        </a>
        )}
          <a
              href="tel:031-215-3990"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                      status === 'closed' || isFull 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                    onClick={(e) => {
                      if (status === 'closed' || isFull) e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Phone className="w-4 h-4" />
                    전화 예약
                  </a>
                </div>
              </div>
            </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-wider mb-1">SINGSING</h1>
              <p className="text-sm text-blue-100">🚌 2박3일 골프패키지 · 리무진버스 단체투어 · 전문 기사가이드 동행</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a
                href="https://www.singsingtour.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-white/20 backdrop-blur text-white px-2 sm:px-3 py-1.5 rounded hover:bg-white/30 transition-colors flex items-center gap-1"
                title="싱싱골프투어 공식 홈페이지"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">공식 홈페이지</span>
              </a>
              
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <div className="text-sm hidden sm:block">
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-blue-200 text-xs">{getRoleName(user.role)}</p>
                    </div>
                  </div>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <a
                      href="/admin"
                      className="text-sm bg-white text-blue-800 px-2 sm:px-4 py-1.5 rounded hover:bg-blue-100 transition-colors hidden sm:inline-block"
                    >
                      관리자 페이지
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-red-600 text-white px-2 sm:px-4 py-1.5 rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="tel:031-215-3990"
                    className="text-sm bg-white text-blue-700 px-2 sm:px-4 py-2 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                    title="031-215-3990"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">031-215-3990</span>
                  </a>
                  <a
                    href="/login"
                    className="text-sm bg-blue-500 px-2 sm:px-4 py-1.5 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">로그인</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 mt-8">
        {/* 비로그인 사용자 안내 */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 text-center border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              🌸 회원님만의 특별한 혜택
            </h3>
            <p className="text-blue-700 mb-4">
              지난 투어 사진과 추억을 보관하고, 특별 할인 혜택을 받아보세요.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              로그인하기
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        )}
        
        {/* 최근 긴급 메모 위젯 - 스탭 모드에서만 표시 */}
        {isStaffView && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center">
                🚨 긴급 처리 필요
              </h3>
              <a href="/admin/memos" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                전체보기 →
              </a>
            </div>
            <MemoList limit={5} showActions={false} />
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>투어 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Tour list */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">예약 가능한 투어</h2>
                  {tours.length > 0 && (
                    <button
                      onClick={() => {
                        const allMonths = groupToursByMonth(tours).map(([key]) => key);
                        if (expandedMonths.size === allMonths.length) {
                          setExpandedMonths(new Set());
                        } else {
                          setExpandedMonths(new Set(allMonths));
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {expandedMonths.size === groupToursByMonth(tours).length ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          모두 접기
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          모두 펼치기
                        </>
                      )}
                    </button>
                  )}
                </div>
                {tours.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">현재 예약 가능한 투어가 없습니다.</p>
                    <p className="text-sm text-gray-500 mt-2">새로운 투어 일정이 공 업데이트됩니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupToursByMonth(tours).map(([monthKey, monthTours]) => {
                      const isExpanded = expandedMonths.has(monthKey);
                      const totalToursInMonth = monthTours.length;
                      const availableTours = monthTours.filter(tour => getTourStatus(tour) === 'available').length;
                      const almostFullTours = monthTours.filter(tour => getTourStatus(tour) === 'almost-full').length;
                      const fullTours = monthTours.filter(tour => getTourStatus(tour) === 'full' || getTourStatus(tour) === 'closed').length;
                      
                      // 현재 월인지 확인
                      const currentMonth = new Date();
                      const isCurrentMonth = monthKey === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
                      
                      return (
                        <div key={monthKey} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          {/* 월 헤더 */}
                          <button
                            onClick={() => toggleMonth(monthKey)}
                            className={`w-full bg-gradient-to-r transition-all duration-200 px-4 py-3 flex items-center justify-between ${
                              isCurrentMonth 
                                ? 'from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-b-2 border-blue-500' 
                                : 'from-gray-50 to-gray-50 hover:from-blue-50 hover:to-indigo-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <span className="font-bold text-lg text-gray-800">
                                {formatMonthHeader(monthKey)}
                              </span>
                              {isCurrentMonth && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                  이번 달
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              {/* 투어 상태 요약 */}
                              <div className="flex items-center gap-2 text-xs sm:text-sm">
                                {availableTours > 0 && (
                                  <span className="text-green-600">
                                    예약가능 {availableTours}
                                  </span>
                                )}
                                {almostFullTours > 0 && (
                                  <span className="text-orange-600">
                                    마감임박 {almostFullTours}
                                  </span>
                                )}
                                {fullTours > 0 && (
                                  <span className="text-gray-500">
                                    마감 {fullTours}
                                  </span>
                                )}
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                          </button>
                          
                          {/* 투어 목록 */}
                          {isExpanded && (
                            <div className="p-3 space-y-3 bg-gray-50">
                              {monthTours.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                  해당 월에는 투어가 없습니다.
                                </div>
                              ) : (
                                monthTours.map(tour => (
                      <Fragment key={tour.id}>
                        {renderTourCard(tour)}
                        {/* 선택된 투어 상세 정보 - 투어 카드 바로 아래에 표시 */}
                        {selectedTour && selectedTour.id === tour.id && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mt-2 border-2 border-blue-200">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">{selectedTour.start_date} ~ {selectedTour.end_date}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg">
                      <p className="text-lg font-bold">{selectedTour.price?.toLocaleString()}원</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    {/* 비로그인 사용자 또는 해당 투어 비참가자: 투어 일정표만 표시 */}
                    {!user || (!isStaffView && !userTours.includes(selectedTour.id)) ? (
                      <div>
                        {/* 일정 탭 헤더 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setShowPreview(false)}
                              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                                !showPreview 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              간단 정보
                            </button>
                            <button
                              onClick={() => setShowPreview(true)}
                              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                                showPreview 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Camera className="w-4 h-4" />
                              일정 엿보기 😍
                            </button>
                          </div>
                        </div>
                        
                        {/* 선택된 탭 컨텐츠 */}
                        {!showPreview ? (
                          <TourScheduleDisplay tour={selectedTour} isPreview={true} />
                        ) : (
                          <TourSchedulePreview tourId={selectedTour.id} />
                        )}
                        
                        {/* 로그인 유도 메시지 */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          {!user ? (
                            <>
                              <p className="text-sm text-blue-700 mb-2">
                                투어 참가자만 모든 여행 서류를 볼 수 있습니다.
                              </p>
                              <p className="text-xs text-gray-600 mb-3">
                                • 상세 일정 • 탑승지 안내 • 객실 배정표 • 라운딩 시간표
                              </p>
                              <a
                                href="/login"
                                className="inline-flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <LogIn className="w-4 h-4" />
                                로그인하기
                              </a>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-blue-700 mb-2">
                                투어 참가자만 모든 여행 서류를 볼 수 있습니다.
                              </p>
                              <p className="text-xs text-gray-600">
                                예약 문의: 031-215-3990
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* 해당 투어 참가자 또는 스탭: 모든 문서 표시 */
                      <>
                        {/* 탭 헤더 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setShowPreview(false)}
                              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                                !showPreview 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              여행 서류
                            </button>
                            <button
                              onClick={() => setShowPreview(true)}
                              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                                showPreview 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Camera className="w-4 h-4" />
                              상세 일정 보기
                            </button>
                          </div>
                        </div>
                        
                        {/* 투어 일정표 */}
                        {!showPreview ? (
                          <>
                            <div className="mb-4">
                              <TourScheduleDisplay tour={selectedTour} isPreview={false} />
                            </div>
                        
                        {/* 기타 문서들 */}
                        <div className="flex flex-col gap-3 mt-6">
                          <h4 className="font-medium text-gray-700">추가 서류</h4>
                          {[
                            { id: 'boarding-guide', name: '탑승지 안내', desc: '탑승지 및 교통 정보', badge: '고객용', icon: <MapPin className="w-5 h-5 text-blue-600 mr-2" /> },
                            { id: 'room-assignment', name: '객실 배정', desc: '객실 배정표', badge: '고객용', icon: <Users className="w-5 h-5 text-blue-600 mr-2" /> },
                            { id: 'rounding-timetable', name: '라운딩 시간표', desc: '라운딩 조 편성', badge: '고객용', icon: <Calendar className="w-5 h-5 text-blue-600 mr-2" /> },
                            { id: 'boarding-guide-staff', name: '탑승지 배정', desc: '스탭용 탑승지 배정', badge: '스탭용', icon: <MapPin className="w-5 h-5 text-blue-600 mr-2" />, staffOnly: true },
                            { id: 'room-assignment-staff', name: '객실 배정', desc: '스탭용 객실 배정', badge: '스탭용', icon: <Users className="w-5 h-5 text-blue-600 mr-2" />, staffOnly: true },
                          ].map((doc) => (
                            <button
                              key={doc.id}
                              className={`border rounded-lg p-4 text-left bg-white hover:bg-blue-50 border-gray-200 flex flex-col gap-2 ${
                                doc.staffOnly && !isStaffView ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => {
                                if (doc.staffOnly && !isStaffView) return;
                                // TODO: 새로운 문서 시스템으로 연결
                                alert(`${doc.name} 기능은 준비 중입니다.`);
                              }}
                              disabled={doc.staffOnly && !isStaffView}
                              aria-label={doc.name}
                              tabIndex={0}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {doc.icon}
                                  <span className="font-medium">{doc.name}</span>
                                </div>
                                <span className="text-xs px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 font-semibold">
                                  {doc.badge}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{doc.desc}</p>
                              {doc.staffOnly && !isStaffView && (
                                <div className="flex items-center text-red-500 text-sm mt-1">
                                  <Lock className="w-4 h-4 mr-1" />
                                  스탭 전용
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                          </>
                        ) : (
                          /* 상세 일정 보기 */
                          <TourSchedulePreview tourId={selectedTour.id} />
                        )}
                      </>
                    )}
                  </div>
                </div>
                        )}
                      </Fragment>
                              ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Staff password modal */}
      {showModal && modalContent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">스탭 전용 페이지</h3>
            <p className="mb-4">"{modalContent.title}" 문서는 스탭 전용입니다.</p>
            <div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-1">비밀번호</label>
                <input
                  type="password"
                  id="password"
                  className="w-full border rounded px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="스탭 비밀번호를 입력하세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                />
                {password && !isPasswordCorrect && (
                  <p className="text-red-500 text-sm mt-1">비밀번호가 올바르지 않습니다.</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handlePasswordSubmit}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="mt-12 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">싱싱골프투어</h2>
            <p className="text-gray-600 mb-4">리무진 버스로 떠나는 편안한 골프여행</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <a
                href="tel:031-215-3990"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Phone className="w-5 h-5" />
                <span className="text-lg">031-215-3990</span>
              </a>
              
              <span className="hidden sm:block text-gray-400">|</span>
              
              <a
                href="https://www.singsingtour.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Globe className="w-5 h-5" />
                <span>공식 홈페이지</span>
              </a>
              
              <span className="hidden sm:block text-gray-400">|</span>
              
              <div className="text-gray-600">
                <MapPin className="w-5 h-5 inline mr-1" />
                수원시 영통구 법조로149번길 200
              </div>
            </div>
            
            {!user && tours.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-block">
                <p className="text-blue-700 font-medium">
                  더 많은 투어와 특별 혜택은 로그인하시면 보실 수 있습니다.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  로그인하기
                </a>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-300 text-gray-500 text-sm">
              <p>© 2025 싱싱골프투어. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GolfTourPortal;

// 실제 서비스에서는 각 문서/서류, 상세 정보, 권한 분리 등 추가 구현 필요