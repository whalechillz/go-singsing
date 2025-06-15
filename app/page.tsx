"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Globe, Users, Bookmark, FileText, Phone, MapPin, Lock, LogIn, LogOut, User, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser, signOut, UserProfile } from "@/lib/auth";
import MemoList from "@/components/memo/MemoList";
import { useRouter } from "next/navigation";

// Tour 타입 정의
interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  golf_course?: string;
  accommodation?: string;
  max_participants?: number;
  price?: number;
  driver_name?: string;
  // 필요시 추가 필드...
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

  // Supabase에서 투어 목록 fetch
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from("singsing_tours").select("*").order("start_date", { ascending: true });
        if (error) throw error;
        
        // 오늘 날짜 이후의 투어만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureTours = (data ?? []).filter((tour: Tour) => {
          const tourDate = new Date(tour.start_date);
          return tourDate >= today;
        });
        
        setTours(futureTours as Tour[]);
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
          .from('tour_participants')
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
    setSelectedTour(tour);
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

  const renderTourCard = (tour: Tour) => {
    const isSelected = selectedTour && selectedTour.id === tour.id;
    const remainingSeats = (tour.max_participants || 0) - 0; // TODO: current_participants 추가 필요
    const isAlmostFull = remainingSeats > 0 && remainingSeats <= 3;
    const isFull = remainingSeats <= 0;
    
    return (
      <div
        key={tour.id}
        className={`border rounded-lg shadow-md p-5 cursor-pointer transition-all hover:shadow-lg ${isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
        onClick={() => handleCardClick(tour)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📅 {formatDate(tour.start_date)} 출발</h3>
            <h4 className="text-purple-700 font-medium mt-1">{tour.title}</h4>
            <div className="flex items-center text-gray-600 mt-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{tour.golf_course}</span>
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">{tour.start_date} ~ {tour.end_date}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isFull ? 'bg-gray-100 text-gray-600' :
            isAlmostFull ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          }`}>
            {isFull ? '마감' : `잔여 ${remainingSeats}석`}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-gray-900">{tour.price?.toLocaleString()}원</span>
              <span className="text-sm text-gray-500 ml-1">/ 1인</span>
            </div>
            <a
              href="tel:031-215-3990"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                isFull 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-700 text-white hover:bg-purple-800'
              }`}
              onClick={(e) => {
                if (isFull) e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Phone className="w-4 h-4" />
              전화 예약
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <div className="bg-purple-700 text-white p-4 shadow-md">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">싱싱골프투어</h1>
              <p className="text-sm text-purple-200">리무진 버스로 떠나는 편안한 골프여행</p>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <div className="text-sm">
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-blue-200 text-xs">{getRoleName(user.role)}</p>
                    </div>
                  </div>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <a
                      href="/admin"
                      className="text-sm bg-white text-blue-800 px-4 py-1.5 rounded hover:bg-blue-100 transition-colors"
                    >
                      관리자 페이지
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="tel:031-215-3990"
                    className="text-sm bg-white text-purple-700 px-4 py-2 rounded hover:bg-purple-50 transition-colors flex items-center gap-1"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">031-215-3990</span>
                  </a>
                  <a
                    href="/login"
                    className="text-sm bg-purple-600 px-4 py-1.5 rounded hover:bg-purple-800 transition-colors flex items-center gap-1"
                  >
                    <LogIn className="h-4 w-4" />
                    로그인
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
          <div className="bg-purple-50 rounded-lg p-6 mb-6 text-center">
            <h3 className="text-lg font-bold text-purple-900 mb-2">
              🌸 회원님만의 특별한 혜택
            </h3>
            <p className="text-purple-700 mb-4">
              지난 투어 사진과 추억을 보관하고, 특별 할인 혜택을 받아보세요.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition"
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
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">예약 가능한 투어</h2>
                {tours.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">현재 예약 가능한 투어가 없습니다.</p>
                    <p className="text-sm text-gray-500 mt-2">새로운 투어 일정이 공 업데이트됩니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tours.map(tour => renderTourCard(tour))}
                  </div>
                )}
              </div>
            </div>
            {/* Selected tour details */}
            <div>
              {selectedTour ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-800">{selectedTour.title}</h2>
                      <p className="text-gray-600">{selectedTour.start_date} ~ {selectedTour.end_date}</p>
                    </div>
                    <div className="bg-blue-100 px-4 py-2 rounded-lg">
                      <p className="text-lg font-bold text-blue-800">{selectedTour.price?.toLocaleString()}원</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Globe className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold">골프장</span>
                      </div>
                      <p>{selectedTour.golf_course}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold">숙소</span>
                      </div>
                      <p>{selectedTour.accommodation}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Users className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold">인원</span>
                      </div>
                      <p>
                        <span className="font-medium">{selectedTour.max_participants}</span>명
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Phone className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold">담당자</span>
                      </div>
                      <p>{selectedTour.driver_name}</p>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    {/* 비로그인 사용자 또는 해당 투어 비참가자: 투어 일정표만 표시 */}
                    {!user || (!isStaffView && !userTours.includes(selectedTour.id)) ? (
                      <div>
                        <h3 className="text-lg font-bold mb-4">투어 일정표</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <FileText className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium">투어 일정표</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">일정, 식사, 골프장, 숙박 안내</p>
                          
                          {/* 투어 일정표 미리보기 */}
                          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">📅 {selectedTour.title}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">출발일:</span>
                                <span>{formatDate(selectedTour.start_date)}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">도착일:</span>
                                <span>{formatDate(selectedTour.end_date)}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">골프장:</span>
                                <span>{selectedTour.golf_course}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">숙박:</span>
                                <span>{selectedTour.accommodation}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">인원:</span>
                                <span>{selectedTour.max_participants}명</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">가격:</span>
                                <span className="font-bold text-blue-700">{selectedTour.price?.toLocaleString()}원</span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                            onClick={() => window.location.href = `/document/${selectedTour.id}/tour-schedule`}
                          >
                            전체 일정표 보기
                          </button>
                          
                          {/* 로그인 유도 */}
                          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                            {!user ? (
                              <>
                                <p className="text-sm text-purple-700 mb-2">
                                  더 많은 여행 서류를 보시려면 로그인해주세요.
                                </p>
                                <p className="text-xs text-gray-600 mb-3">
                                  • 탑승지 안내 • 객실 배정표 • 라운딩 시간표
                                </p>
                                <a
                                  href="/login"
                                  className="inline-flex items-center gap-1 text-purple-700 font-medium text-sm hover:text-purple-800"
                                >
                                  <LogIn className="w-4 h-4" />
                                  로그인하기
                                </a>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-purple-700 mb-2">
                                  이 투어의 참가자만 모든 서류를 볼 수 있습니다.
                                </p>
                                <p className="text-xs text-gray-600">
                                  예약 문의: 031-215-3990
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 해당 투어 참가자 또는 스탭: 모든 문서 표시 */
                      <>
                        <h3 className="text-lg font-bold mb-4">여행 서류</h3>
                        <div className="flex flex-col gap-3">
                          {/* 문서 버튼 목록 */}
                          {[
                            { id: 'tour-schedule', name: '투어 일정표', desc: '일정, 식사, 골프장, 숙박 안내', badge: '고객용', icon: <FileText className="w-5 h-5 text-blue-600 mr-2" /> },
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
                                window.location.href = `/document/${selectedTour.id}/${doc.id}`;
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
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">투어를 선택해주세요</h3>
                  <p className="text-gray-500">위 목록에서 투어를 선택하면 상세 정보를 확인할 수 있습니다.</p>
                </div>
              )}
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
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>싱싱골프투어 | 031-215-3990</p>
        {!user && tours.length > 0 && (
          <div className="mt-4 mb-8">
            <p className="text-purple-700 font-medium">
              더 많은 투어는 로그인하시면 보실 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GolfTourPortal;

// 실제 서비스에서는 각 문서/서류, 상세 정보, 권한 분리 등 추가 구현 필요