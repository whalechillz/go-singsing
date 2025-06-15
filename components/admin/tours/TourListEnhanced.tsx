"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  DollarSign, 
  MoreVertical,
  Download,
  ChevronDown,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  driver_name: string;
  price: number;
  max_participants: number;
  current_participants?: number;
  is_closed?: boolean;
  closed_reason?: string;
  closed_at?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  golf_course?: string;
  departure_location?: string;
}

interface TourListEnhancedProps {
  tours: Tour[];
  loading: boolean;
  error: string;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onToggleClosed: (tour: Tour) => void;
}

const TourListEnhanced: React.FC<TourListEnhancedProps> = ({ 
  tours, 
  loading, 
  error, 
  onDelete,
  onRefresh,
  onToggleClosed 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'participants'>('date');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'none' | 'today' | 'week' | 'almostFull'>('none');
  const [prioritizeAvailable, setPrioritizeAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 클릭 외부 영역 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 투어 상태 계산
  const getTourStatus = (tour: Tour): string => {
    if (tour.status) return tour.status;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    
    const startDate = new Date(tour.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(tour.end_date);
    endDate.setHours(23, 59, 59, 999); // 종료일의 마지막 시간
    
    if (today < startDate) return 'upcoming';
    if (today > endDate) return 'completed';
    return 'ongoing';
  };

  // 참가율 계산
  const getOccupancyRate = (tour: Tour): number => {
    if (!tour.current_participants || !tour.max_participants) return 0;
    return Math.round((tour.current_participants / tour.max_participants) * 100);
  };

  // 상태별 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            예정
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            진행중
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-3 h-3" />
            완료
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            취소
          </span>
        );
      default:
        return null;
    }
  };

  // 필터링된 투어 목록
  const filteredTours = tours.filter(tour => {
    const status = getTourStatus(tour);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(tour.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    // 탭 필터링
    if (activeTab === 'active') {
      if (status === 'completed') return false;
    } else {
      if (status !== 'completed') return false;
    }
    
    // 검색어 필터
    if (searchTerm && !tour.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !tour.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tour.golf_course?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // 빠른 필터
    if (quickFilter !== 'none') {
      const isFull = (tour.current_participants || 0) >= (tour.max_participants || 0);
      const occupancyRate = getOccupancyRate(tour);
      
      switch (quickFilter) {
        case 'today':
          if (startDate.getTime() !== today.getTime()) return false;
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (startDate < today || startDate > weekFromNow) return false;
          break;
        case 'almostFull':
          if (isFull || occupancyRate < 80) return false;
          break;
      }
    }
    
    // 예약 가능한 투어만 표시 (마감된 투어 제외)
    if (showOnlyAvailable) {
    const isFull = (tour.current_participants || 0) >= (tour.max_participants || 0);
    const isAvailable = (status === 'upcoming' || status === 'ongoing') && !isFull && !tour.is_closed;
    if (!isAvailable) return false;
    }
    
    // 상태 필터
    if (statusFilter !== 'all' && status !== statusFilter) {
      return false;
    }
    
    // 날짜 필터
    if (dateFilter !== 'all') {
      if (dateFilter === 'upcoming' && startDate <= today) return false;
      if (dateFilter === 'past' && startDate > today) return false;
    }
    
    return true;
  });

  // 정렬 (마감 상태 고려)
  const sortedTours = [...filteredTours].sort((a, b) => {
    // 완료된 투어는 하단으로
    const aStatus = getTourStatus(a);
    const bStatus = getTourStatus(b);
    if (aStatus === 'completed' && bStatus !== 'completed') return 1;
    if (aStatus !== 'completed' && bStatus === 'completed') return -1;
    
    // 마감된 투어는 하단으로
    if (a.is_closed && !b.is_closed) return 1;
    if (!a.is_closed && b.is_closed) return -1;
    
    // 예약 가능한 투어 우선 표시
    if (prioritizeAvailable) {
      const aStatus = getTourStatus(a);
      const bStatus = getTourStatus(b);
      const aFull = (a.current_participants || 0) >= (a.max_participants || 0);
      const bFull = (b.current_participants || 0) >= (b.max_participants || 0);
      const aAvailable = (aStatus === 'upcoming' || aStatus === 'ongoing') && !aFull && !a.is_closed;
      const bAvailable = (bStatus === 'upcoming' || bStatus === 'ongoing') && !bFull && !b.is_closed;
      
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
    }
    
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'participants':
        return (b.current_participants || 0) - (a.current_participants || 0);
      case 'date':
      default:
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    }
  });

  // 통계 정보
  const stats = {
    total: tours.length,
    upcoming: tours.filter(t => getTourStatus(t) === 'upcoming').length,
    ongoing: tours.filter(t => getTourStatus(t) === 'ongoing').length,
    completed: tours.filter(t => getTourStatus(t) === 'completed').length,
    totalRevenue: tours.reduce((sum, t) => sum + (t.price * (t.current_participants || 0)), 0),
    available: tours.filter(t => {
      const status = getTourStatus(t);
      const isFull = (t.current_participants || 0) >= (t.max_participants || 0);
      return (status === 'upcoming' || status === 'ongoing') && !isFull && !t.is_closed;
    }).length
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="space-y-4">
      {/* 탭 메뉴 */}
      <div className="bg-white rounded-lg shadow px-1 py-1">
        <nav className="flex space-x-1" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'active'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            현재/예정 투어 ({tours.filter(t => getTourStatus(t) !== 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'completed'
                ? 'bg-gray-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            완료된 투어 ({stats.completed})
          </button>
        </nav>
      </div>
      
      {/* 액션 버튼 */}
      <div className="flex justify-end">
        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            엑셀 다운로드
          </button>
          <Link 
            href="/admin/tours/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            새 투어 등록
          </Link>
        </div>
      </div>

      {/* 통계 카드 - 탭에 따라 다르게 표시 */}
      {activeTab === 'active' ? (
        // 현재/예정 투어 통계
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">예정된 투어</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">진행중 투어</p>
                <p className="text-2xl font-bold text-green-600">{stats.ongoing}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">예약 가능</p>
                <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">마감된 투어</p>
                <p className="text-2xl font-bold text-red-600">
                  {tours.filter(t => t.is_closed && getTourStatus(t) !== 'completed').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      ) : (
        // 완료된 투어 통계
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료된 투어</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 참가자</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tours
                    .filter(t => getTourStatus(t) === 'completed')
                    .reduce((sum, t) => sum + (t.current_participants || 0), 0)}
                  명
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 수익</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tours
                    .filter(t => getTourStatus(t) === 'completed')
                    .reduce((sum, t) => sum + (t.price * (t.current_participants || 0)), 0)
                    .toLocaleString()}원
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        {/* 빠른 필터 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => setQuickFilter(quickFilter === 'today' ? 'none' : 'today')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              quickFilter === 'today' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            오늘 출발
          </button>
          <button
            onClick={() => setQuickFilter(quickFilter === 'week' ? 'none' : 'week')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              quickFilter === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            이번 주 출발
          </button>
          <button
            onClick={() => setQuickFilter(quickFilter === 'almostFull' ? 'none' : 'almostFull')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              quickFilter === 'almostFull' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            마감 임박
          </button>
          <div className="flex-1" />
          <label className="flex items-center cursor-pointer px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100">
            <input
              type="checkbox"
              className="sr-only"
              checked={prioritizeAvailable}
              onChange={(e) => setPrioritizeAvailable(e.target.checked)}
            />
            <span className="text-sm font-medium text-purple-700">
              {prioritizeAvailable ? '✓ ' : ''}예약 가능 투어 상단 표시
            </span>
          </label>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="투어명, 기사님, 골프장으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* 예약 가능 필터 토글 */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                예약 가능한 투어만
                {showOnlyAvailable && ` (${stats.available}개)`}
              </span>
            </label>
          </div>
          
          {/* 필터 */}
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">모든 상태</option>
              <option value="upcoming">예정</option>
              <option value="ongoing">진행중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="all">모든 기간</option>
              <option value="upcoming">예정된 투어</option>
              <option value="past">지난 투어</option>
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">날짜순</option>
              <option value="name">이름순</option>
              <option value="participants">참가자순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 투어 목록 */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">투어 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button 
              onClick={onRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : sortedTours.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">등록된 투어가 없습니다.</p>
            <Link 
              href="/admin/tours/new"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 투어 등록하기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{overflow: 'visible'}}>
            <table className="w-full" style={{overflow: 'visible'}}>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  투어 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  일정
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  참가자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수익
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" style={{overflow: 'visible'}}>
              {sortedTours.map((tour) => {
                const status = getTourStatus(tour);
                const occupancyRate = getOccupancyRate(tour);
                const isFull = (tour.current_participants || 0) >= (tour.max_participants || 0);
                const isAvailable = (status === 'upcoming' || status === 'ongoing') && !isFull && !tour.is_closed;
                
                return (
                  <tr key={tour.id} className={`hover:bg-gray-50 ${
                    tour.is_closed ? 'bg-red-50 opacity-75' : 
                    status === 'completed' ? 'bg-gray-100 opacity-60' :
                    isAvailable ? 'bg-green-50' : ''
                  }`}>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isAvailable && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="예약 가능" />
                        )}
                        <div>
                          <Link 
                            href={`/admin/tours/${tour.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {tour.title}
                          </Link>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            {tour.golf_course && (
                              <>
                                <MapPin className="w-3 h-3" />
                                {tour.golf_course}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(tour.start_date)} - {formatDate(tour.end_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        기사: {tour.driver_name}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">
                            {tour.current_participants || 0} / {tour.max_participants || 0}
                          </div>
                          <div className="ml-2 w-20">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  occupancyRate >= 80 ? 'bg-green-600' : 
                                  occupancyRate >= 50 ? 'bg-yellow-600' : 
                                  'bg-gray-400'
                                }`}
                                style={{ width: `${occupancyRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/admin/tours/${tour.id}/participants`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 inline mr-1" />
                          관리
                        </Link>
                        <Link
                          href={`/admin/payments?tourId=${tour.id}`}
                          className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded-md hover:bg-green-50 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                          결제
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {tour.is_closed && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" />
                            마감
                          </span>
                        )}
                        {getStatusBadge(status)}
                        {!tour.is_closed && (status === 'upcoming' || status === 'ongoing') && (
                          <button
                            onClick={() => onToggleClosed(tour)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                            title="투어 마감"
                          >
                            마감하기
                          </button>
                        )}
                        {tour.is_closed && status !== 'completed' && (
                          <button
                            onClick={() => onToggleClosed(tour)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded-md hover:bg-green-50 transition-colors"
                            title="마감 해제"
                          >
                            마감해제
                          </button>
                        )}
                      </div>
                      {tour.closed_reason && (
                        <div className="text-xs text-red-600 mt-1">
                          사유: {tour.closed_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                      {((tour.price || 0) * (tour.current_participants || 0)).toLocaleString()}원
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium" style={{overflow: 'visible'}}>
                      <div className="relative flex items-center justify-end" ref={showDropdown === tour.id ? dropdownRef : null}>
                        <button
                          onClick={() => setShowDropdown(showDropdown === tour.id ? null : tour.id)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {showDropdown === tour.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" style={{zIndex: 9999}}>
                            <div className="py-1" role="menu">
                              <Link
                                href={`/admin/tours/${tour.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(null)}
                              >
                                상세보기
                              </Link>
                              <Link
                                href={`/admin/tours/${tour.id}/edit`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(null)}
                              >
                                수정
                              </Link>
                              <Link
                                href={`/admin/tours/${tour.id}/participants`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(null)}
                              >
                                참가자 관리
                              </Link>
                              <Link
                                href={`/admin/payments?tourId=${tour.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(null)}
                              >
                                결제 관리
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(null);
                                  onDelete(tour.id);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourListEnhanced;