"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Globe, Users, Bookmark, FileText, Phone, MapPin, Lock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const GolfTourPortal = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [isStaffView, setIsStaffView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Supabase에서 투어 목록 fetch
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from("singsing_tours").select("*").order("start_date", { ascending: false });
        if (error) throw error;
        setTours((data ?? []) as Tour[]);
        setIsLoading(false);
      } catch (err) {
        setError("투어 정보를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleCardClick = (tour) => {
    setSelectedTour(tour);
  };

  const handleDocumentClick = (doc) => {
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

  const renderTourCard = (tour) => {
    const isSelected = selectedTour && selectedTour.id === tour.id;
    return (
      <div
        key={tour.id}
        className={`border rounded-lg shadow-md p-4 cursor-pointer transition-all mb-4 hover:shadow-lg hover:border-blue-200 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
        onClick={() => handleCardClick(tour)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-blue-800">{tour.title}</h3>
            <div className="flex items-center text-gray-600 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">{tour.start_date} ~ {tour.end_date}</span>
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              <Globe className="w-4 h-4 mr-1" />
              <span className="text-sm">{tour.golf_course}</span>
            </div>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-semibold">
            {tour.max_participants || 0}명
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-700 font-medium">{tour.price?.toLocaleString()}원</span>
            <span className={tour.max_participants && tour.max_participants <= 0 ? "text-red-600 font-semibold" : "text-green-600"}>
              모집중
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <div className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">싱싱골프투어</h1>
            <div className="flex items-center space-x-4">
              {isStaffView && (
                <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">스탭 모드</span>
              )}
              <button
                className="text-sm bg-white text-blue-800 px-4 py-1 rounded hover:bg-blue-100"
                onClick={() => setIsStaffView(!isStaffView)}
              >
                {isStaffView ? "고객 모드로 전환" : "스탭 모드로 전환"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 mt-8">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>투어 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tour list */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">투어 목록</h2>
                <div className="space-y-3">
                  {tours.map(tour => renderTourCard(tour))}
                </div>
              </div>
            </div>
            {/* Selected tour details */}
            <div className="md:col-span-2">
              {selectedTour ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-6">
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
                    <h3 className="text-lg font-bold mb-4">여행 서류</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* 실제 문서/페이지 링크로 연결 필요 */}
                      <button className="border rounded-lg p-4 text-left bg-white hover:bg-blue-50 border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium">상품 정보</span>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">고객용</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">일정, 식사, 골프장, 숙박 안내</p>
                      </button>
                      {/* 추가 문서/서류 버튼은 실제 서비스에 맞게 확장 */}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">투어를 선택해주세요</h3>
                  <p className="text-gray-500">왼쪽 목록에서 투어를 선택하면 상세 정보를 확인할 수 있습니다.</p>
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
      </div>
    </div>
  );
};

export default GolfTourPortal;

// 실제 서비스에서는 각 문서/서류, 상세 정보, 권한 분리 등 추가 구현 필요
