"use client";
import React from 'react';
import Link from 'next/link';
import { Users, Calendar } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  golf_course?: string;
  current_participants?: number;
  max_participants?: number;
}

interface TourListSimpleProps {
  tours: Tour[];
  loading: boolean;
  error: string;
  onDelete: (id: string) => void;
}

const TourListSimple: React.FC<TourListSimpleProps> = ({
  tours,
  loading,
  error,
  onDelete
}) => {
  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    
    return `${startStr} ~ ${endStr}`;
  };

  const getDaysUntil = (startDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '종료됨';
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    return `D-${diffDays}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">투어 스케줄 관리</h1>
          <Link
            href="/admin/tours/new"
            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
          >
            + 투어 생성
          </Link>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="mt-2 text-gray-500">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">등록된 투어가 없습니다.</p>
            <Link
              href="/admin/tours/new"
              className="inline-block px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
            >
              첫 투어 생성하기
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">제목</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">날짜</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">기시일</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {tour.title}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {tour.golf_course && <span>{tour.golf_course}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{tour.current_participants || 0}/{tour.max_participants || 40}명</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(tour.start_date, tour.end_date)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      getDaysUntil(tour.start_date) === '종료됨' 
                        ? 'bg-gray-100 text-gray-600'
                        : getDaysUntil(tour.start_date) === '오늘' || getDaysUntil(tour.start_date) === '내일'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {getDaysUntil(tour.start_date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        수정
                      </Link>
                      <span className="text-gray-400">|</span>
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        상세
                      </Link>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => onDelete(tour.id)}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TourListSimple;