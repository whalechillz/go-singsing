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
    <div className={`bg-white rounded-lg ${isPreview ? 'p-3' : 'p-4 shadow-md'}`}>
      {/* 컴팩트 헤더 */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900">
          {tour.title}
        </h3>
        <p className="text-sm text-gray-600">
          {formatDate(tour.start_date)} ~ {formatDate(tour.end_date)} ({calculateDuration()})
        </p>
      </div>

      {/* 컴팩트 주요 정보 - 2열 그리드 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600">골프장</p>
            <p className="text-sm font-medium text-gray-900 truncate">{tour.golf_course || '미정'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <Hotel className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600">숙박</p>
            <p className="text-sm font-medium text-gray-900 truncate">{tour.accommodation || '미정'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600">인원</p>
            <p className="text-sm font-medium text-gray-900">
              {tour.current_participants || 0}/{tour.max_participants || 0}명
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <DollarSign className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600">참가비</p>
            <p className="text-sm font-bold text-gray-900">
              {tour.price?.toLocaleString() || 0}원
            </p>
          </div>
        </div>
      </div>

      {/* 출발 정보 - 컴팩트 */}
      {tour.departure_location && (
        <div className="border-t pt-2 mb-2">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">출발: {tour.departure_location}</span>
          </div>
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

      {/* 담당자 정보 - 더 컴팩트 */}
      {!isPreview && (
        <div className="border-t pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">담당 기사:</span>
              <span className="text-sm font-medium">{tour.driver_name || '미정'}</span>
            </div>
            <a
              href="tel:031-215-3990"
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition"
            >
              <Phone className="w-3 h-3" />
              예약
            </a>
          </div>
        </div>
      )}


    </div>
  );
};

export default TourScheduleDisplay;
