'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Navigation, Coffee, Utensils, Hotel, 
  Camera, Plus, Filter, Map, List, Calendar, ChevronRight,
  Bus, Users, ArrowUpDown, Grip, Edit, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface JourneyPlace {
  id: string;
  order: number;
  name: string;
  address: string;
  category: 'boarding' | 'rest' | 'tour' | 'meal' | 'hotel';
  type: string;
  time?: string;
  passengers?: number;
  distance?: string;
  duration?: string;
  stayTime?: string;
  meal?: string;
  notes?: string;
}

export default function JourneyManagement() {
  const [viewMode, setViewMode] = useState<'timeline' | 'category' | 'map'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [journeyPlaces, setJourneyPlaces] = useState<JourneyPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryConfig = {
    boarding: { icon: Bus, color: 'blue', label: '탑승지' },
    rest: { icon: Coffee, color: 'amber', label: '휴게소' },
    tour: { icon: Camera, color: 'green', label: '관광지' },
    meal: { icon: Utensils, color: 'orange', label: '식당' },
    hotel: { icon: Hotel, color: 'purple', label: '숙소' }
  };

  useEffect(() => {
    fetchJourneyPlaces();
  }, []);

  const fetchJourneyPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('journey_places')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setJourneyPlaces(data || []);
    } catch (error) {
      console.error('Error fetching journey places:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryConfig[category as keyof typeof categoryConfig]?.icon || MapPin;
    return <Icon className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig]?.color || 'gray';
  };

  const updateOrder = async (placeId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('journey_places')
        .update({ order: newOrder })
        .eq('id', placeId);

      if (error) throw error;
      await fetchJourneyPlaces();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deletePlace = async (placeId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('journey_places')
        .delete()
        .eq('id', placeId);

      if (error) throw error;
      await fetchJourneyPlaces();
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  // 타임라인 뷰
  const TimelineView = () => (
    <div className="space-y-4">
      {journeyPlaces.map((place, index) => (
        <div key={place.id} className="relative">
          {/* 연결선 */}
          {index < journeyPlaces.length - 1 && (
            <div className="absolute left-10 top-20 w-0.5 h-24 bg-gray-300">
              {place.duration && place.distance && (
                <div className="absolute -left-16 top-1/2 text-xs text-gray-500 bg-white px-1 whitespace-nowrap">
                  {place.duration} • {place.distance}
                </div>
              )}
            </div>
          )}
          
          {/* 장소 카드 */}
          <div className="flex gap-4 bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            {/* 순서 번호 */}
            <div className={`w-12 h-12 rounded-full bg-${getCategoryColor(place.category)}-100 flex items-center justify-center flex-shrink-0`}>
              <span className={`text-${getCategoryColor(place.category)}-600 font-bold`}>{place.order}</span>
            </div>
            
            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {getCategoryIcon(place.category)}
                <h3 className="font-semibold text-lg">{place.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full bg-${getCategoryColor(place.category)}-100 text-${getCategoryColor(place.category)}-700`}>
                  {place.type}
                </span>
                {place.passengers && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {place.passengers}명
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{place.address}</p>
              
              <div className="flex items-center gap-4 text-sm flex-wrap">
                {place.time && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-4 h-4" />
                    {place.time} 도착
                  </span>
                )}
                {place.stayTime && (
                  <span className="text-gray-500">
                    체류: {place.stayTime}
                  </span>
                )}
                {place.meal && (
                  <span className="text-orange-600">
                    메뉴: {place.meal}
                  </span>
                )}
                {place.notes && (
                  <span className="text-gray-500 italic">
                    {place.notes}
                  </span>
                )}
              </div>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => {/* 순서 변경 로직 */}}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => {/* 편집 로직 */}}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => deletePlace(place.id)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 카테고리 뷰
  const CategoryView = () => {
    const filteredPlaces = selectedCategory === 'all' 
      ? journeyPlaces 
      : journeyPlaces.filter(p => p.category === selectedCategory);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaces.map(place => (
          <div key={place.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(place.category)}
              <h3 className="font-semibold">{place.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{place.address}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded bg-${getCategoryColor(place.category)}-100 text-${getCategoryColor(place.category)}-700`}>
                  {place.type}
                </span>
                <span className="text-xs text-gray-500">순서: {place.order}번째</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {/* 편집 로직 */}}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-3 h-3 text-gray-600" />
                </button>
                <button 
                  onClick={() => deletePlace(place.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 요약 통계
  const stats = {
    total: journeyPlaces.length,
    boarding: journeyPlaces.filter(p => p.category === 'boarding').length,
    tour: journeyPlaces.filter(p => p.category === 'tour').length,
    meal: journeyPlaces.filter(p => p.category === 'meal').length,
    rest: journeyPlaces.filter(p => p.category === 'rest').length,
    totalPassengers: journeyPlaces.filter(p => p.passengers).reduce((sum, p) => sum + (p.passengers || 0), 0)
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">여정 관리</h1>
        <p className="text-gray-600">투어 일정의 모든 경유지를 순서대로 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">전체</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.boarding}</div>
          <div className="text-sm text-gray-600">탑승지</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.tour}</div>
          <div className="text-sm text-gray-600">관광지</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.meal}</div>
          <div className="text-sm text-gray-600">식당</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-600">{stats.rest}</div>
          <div className="text-sm text-gray-600">휴게소</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.totalPassengers}</div>
          <div className="text-sm text-gray-600">총 승객</div>
        </div>
      </div>

      {/* 툴바 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 뷰 모드 선택 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Navigation className="w-4 h-4" />
              타임라인
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'category' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              카테고리
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
              지도
            </button>
          </div>

          {/* 카테고리 필터 (카테고리 뷰일 때만) */}
          {viewMode === 'category' && (
            <div className="flex gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="boarding">탑승지</option>
                <option value="tour">관광지</option>
                <option value="meal">식당</option>
                <option value="rest">휴게소</option>
                <option value="hotel">숙소</option>
              </select>
            </div>
          )}

          {/* 액션 버튼 */}
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
            <Plus className="w-4 h-4" />
            장소 추가
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="bg-gray-50 rounded-lg p-6">
        {viewMode === 'timeline' && <TimelineView />}
        {viewMode === 'category' && <CategoryView />}
        {viewMode === 'map' && (
          <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">지도 뷰 (구현 예정)</p>
          </div>
        )}
      </div>
    </div>
  );
}
