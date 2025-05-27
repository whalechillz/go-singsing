"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MemoList from '@/components/memo/MemoList';
import { Search, Filter, Calendar } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

export default function MemosPage() {
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    const { data } = await supabase
      .from('singsing_tours')
      .select('id, title, start_date, end_date')
      .order('start_date', { ascending: false });
    
    if (data) {
      setTours(data);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">메모 관리</h1>
        <div className="text-sm text-gray-500">
          전체 메모를 관리하고 처리 상태를 확인합니다
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 투어 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              투어 선택
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
            >
              <option value="">전체 투어</option>
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>
                  {tour.title} ({formatDate(tour.start_date)}~{formatDate(tour.end_date)})
                </option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              처리 상태
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="pending">대기중</option>
              <option value="follow_up">후속조치</option>
              <option value="resolved">완료</option>
            </select>
          </div>

          {/* 카테고리 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="urgent">🚨 긴급</option>
              <option value="payment">💳 결제</option>
              <option value="boarding">🚗 탑승</option>
              <option value="request">📝 요청</option>
              <option value="general">📌 일반</option>
            </select>
          </div>

          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이름, 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 메모 리스트 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <MemoList 
          tourId={selectedTourId || undefined}
          showActions={true}
        />
      </div>
    </div>
  );
}
