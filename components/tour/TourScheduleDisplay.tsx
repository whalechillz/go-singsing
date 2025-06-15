"use client";

import React from 'react';
import { Calendar, MapPin, Hotel, Users, Phone, Clock, DollarSign, Bus } from 'lucide-react';

interface TourScheduleProps {
  tour: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    golf_course?: string;
    accommodation?: string;
    max_participants?: number;
    current_participants?: number;
    price?: number;
    driver_name?: string;
    departure_location?: string;
    itinerary?: string;
    included_items?: string;
    notes?: string;
  };
  isPreview?: boolean;
}

const TourScheduleDisplay: React.FC<TourScheduleProps> = ({ tour, isPreview = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일(${dayOfWeek})`;
  };

  const calculateDuration = () => {
    const start = new Date(tour.start_date);
    const end = new Date(tour.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays + 1}일 ${diffDays}박`;
  };

  return (
    <div className={`bg-white rounded-lg ${isPreview ? 'p-4' : 'p-6 shadow-lg'}`}>
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {tour.title}
        </h2>
        <p className="text-gray-600">
          {formatDate(tour.start_date)} ~ {formatDate(tour.end_date)} ({calculateDuration()})
        </p>
      </div>

      {/* 주요 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold">골프장</span>
          </div>
          <p className="text-gray-700">{tour.golf_course || '정보 없음'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Hotel className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold">숙박</span>
          </div>
          <p className="text-gray-700">{tour.accommodation || '정보 없음'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold">모집 인원</span>
          </div>
          <p className="text-gray-700">
            {tour.current_participants || 0} / {tour.max_participants || 0}명
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold">참가비</span>
          </div>
          <p className="text-gray-700 font-bold text-lg">
            {tour.price?.toLocaleString() || 0}원
          </p>
        </div>
      </div>

      {/* 출발 정보 */}
      {tour.departure_location && (
        <div className="border-t pt-4 mb-4">
          <div className="flex items-center mb-2">
            <Bus className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold">출발 장소</span>
          </div>
          <p className="text-gray-700">{tour.departure_location}</p>
        </div>
      )}

      {/* 일정 상세 */}
      {tour.itinerary && !isPreview && (
        <div className="border-t pt-4 mb-4">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <span className="font-semibold">일정 안내</span>
          </div>
          <div className="text-gray-700 whitespace-pre-wrap">
            {tour.itinerary}
          </div>
        </div>
      )}

      {/* 포함 사항 */}
      {tour.included_items && !isPreview && (
        <div className="border-t pt-4 mb-4">
          <h4 className="font-semibold mb-2">포함 사항</h4>
          <div className="text-gray-700 whitespace-pre-wrap">
            {tour.included_items}
          </div>
        </div>
      )}

      {/* 기타 안내 */}
      {tour.notes && !isPreview && (
        <div className="border-t pt-4 mb-4">
          <h4 className="font-semibold mb-2">기타 안내</h4>
          <div className="text-gray-700 whitespace-pre-wrap">
            {tour.notes}
          </div>
        </div>
      )}

      {/* 담당자 정보 */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">담당 기사님</p>
            <p className="font-medium">{tour.driver_name || '미정'}</p>
          </div>
          <a
            href="tel:031-215-3990"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Phone className="w-4 h-4" />
            예약 문의
          </a>
        </div>
      </div>

      {/* 프리뷰 모드에서 전체 보기 버튼 */}
      {isPreview && (
        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            onClick={() => {/* 전체 일정표 모달 또는 페이지로 이동 */}}
          >
            전체 일정표 보기 →
          </button>
        </div>
      )}
    </div>
  );
};

export default TourScheduleDisplay;
