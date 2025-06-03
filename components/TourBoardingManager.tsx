"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MapPin, 
  Clock, 
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Bus,
  Map,
  Building,
  Coffee,
  ChevronUp,
  ChevronDown,
  Calendar,
  Navigation
} from "lucide-react";

interface TourBoardingPlace {
  id: string;
  tour_id: string;
  boarding_place_id: string;
  departure_time: string;
  arrival_time?: string;
  order_no: number;
  is_waypoint?: boolean;
  waypoint_name?: string;
  waypoint_duration?: number;
  waypoint_description?: string;
  visit_date?: string;
  boarding_place?: {
    id: string;
    name: string;
    address: string;
    boarding_main?: string;
    boarding_sub?: string;
    parking_main?: string;
    parking_map_url?: string;
    parking_info?: string;
  };
}

interface BoardingPlace {
  id: string;
  name: string;
  address: string;
  boarding_main?: string;
  boarding_sub?: string;
  parking_main?: string;
  parking_map_url?: string;
  parking_info?: string;
}

interface TourBoardingManagerProps {
  tourId: string;
}

interface TourData {
  id: string;
  start_date: string;
  end_date: string;
}

export default function TourBoardingManager({ tourId }: TourBoardingManagerProps) {
  const [tourBoardingPlaces, setTourBoardingPlaces] = useState<TourBoardingPlace[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<BoardingPlace[]>([]);
  const [tourData, setTourData] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    boarding_place_id: "",
    departure_time: "",
    is_waypoint: false,
    waypoint_name: "",
    waypoint_duration: 20,
    waypoint_description: "",
    visit_date: ""
  });

  useEffect(() => {
    fetchTourData();
    fetchTourBoardingPlaces();
    fetchAvailablePlaces();
  }, [tourId]);

  const fetchTourData = async () => {
    const { data, error } = await supabase
      .from('singsing_tours')
      .select('id, start_date, end_date')
      .eq('id', tourId)
      .single();

    if (data) {
      setTourData(data);
      // 기본 날짜를 첫날로 설정
      setFormData(prev => ({ ...prev, visit_date: data.start_date.split('T')[0] }));
    }
  };

  const fetchTourBoardingPlaces = async () => {
    setLoading(true);
    
    // 데이터 조회
    const { data, error } = await supabase
      .from('singsing_tour_boarding_times')
      .select(`
        *,
        boarding_place:singsing_boarding_places (*)
      `)
      .eq('tour_id', tourId)
      .order('visit_date, order_no');

    if (error) {
      console.error('Error fetching tour boarding places:', error);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      // 테이블이 없을 수 있으므로 빈 배열로 설정
      setTourBoardingPlaces([]);
    } else {
      console.log('Fetched tour boarding places:', data);
      setTourBoardingPlaces(data || []);
    }
    setLoading(false);
  };

  const fetchAvailablePlaces = async () => {
    const { data, error } = await supabase
      .from('singsing_boarding_places')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching available places:', error);
    } else {
      setAvailablePlaces(data || []);
    }
  };

  const calculateArrivalTime = (departureTime: string): string => {
    if (!departureTime) return '';
    const [hours, minutes] = departureTime.split(':').map(Number);
    let arrivalMinutes = minutes - 20;
    let arrivalHours = hours;
    
    if (arrivalMinutes < 0) {
      arrivalMinutes += 60;
      arrivalHours = arrivalHours === 0 ? 23 : arrivalHours - 1;
    }
    
    return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
  };

  const handleAddBoardingPlace = async () => {
    setLoading(true);
    
    const placesOnDate = tourBoardingPlaces.filter(p => p.visit_date === formData.visit_date);
    const nextOrderNo = placesOnDate.length + 1;
    
    const insertData: any = {
      tour_id: tourId,
      order_no: nextOrderNo,
      is_waypoint: formData.is_waypoint
    };

    if (formData.is_waypoint) {
      insertData.waypoint_name = formData.waypoint_name;
      insertData.waypoint_duration = formData.waypoint_duration;
      insertData.waypoint_description = formData.waypoint_description;
      insertData.visit_date = formData.visit_date;
    } else {
      if (!formData.boarding_place_id || !formData.departure_time) {
        alert('탑승지와 출발 시간을 선택해주세요.');
        setLoading(false);
        return;
      }
      insertData.boarding_place_id = formData.boarding_place_id;
      insertData.departure_time = `${formData.departure_time}:00`; // TIME 형식에 맞게 :00 추가
      insertData.arrival_time = `${calculateArrivalTime(formData.departure_time)}:00`;
      insertData.visit_date = formData.visit_date;
    }

    console.log('저장할 데이터:', insertData);

    const { data, error } = await supabase
      .from('singsing_tour_boarding_times')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Error adding boarding place:', error);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      alert(`저장 오류: ${error.message}\n${error.details || ''}\n${error.hint || ''}`);
    } else {
      console.log('저장 성공:', data);
      fetchTourBoardingPlaces();
      setShowAddForm(false);
      setFormData({
        boarding_place_id: "",
        departure_time: "",
        is_waypoint: false,
        waypoint_name: "",
        waypoint_duration: 20,
        waypoint_description: "",
        visit_date: tourData?.start_date.split('T')[0] || ""
      });
    }
    setLoading(false);
  };

  const handleUpdateTime = async (id: string, departureTime: string) => {
    const { error } = await supabase
      .from('singsing_tour_boarding_times')
      .update({
        departure_time: `${departureTime}:00`,
        arrival_time: `${calculateArrivalTime(departureTime)}:00`
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating time:', error);
    } else {
      fetchTourBoardingPlaces();
      setEditingId(null);
    }
  };

  const handleUpdateWaypoint = async (id: string, data: any) => {
    const { error } = await supabase
      .from('singsing_tour_boarding_times')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating waypoint:', error);
    } else {
      fetchTourBoardingPlaces();
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const { error } = await supabase
      .from('singsing_tour_boarding_times')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting:', error);
    } else {
      // 날짜별로 순서 재정렬
      await reorderPlaces();
    }
  };

  const reorderPlaces = async () => {
    // 날짜별로 그룹화하여 재정렬
    const groupedByDate = tourBoardingPlaces.reduce((acc, item) => {
      const date = item.visit_date || 'no-date';
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, typeof tourBoardingPlaces>);

    for (const [date, items] of Object.entries(groupedByDate)) {
      const sortedItems = items.sort((a, b) => a.order_no - b.order_no);
      for (let i = 0; i < sortedItems.length; i++) {
        await supabase
          .from('singsing_tour_boarding_times')
          .update({ order_no: i + 1 })
          .eq('id', sortedItems[i].id);
      }
    }
    
    fetchTourBoardingPlaces();
  };

  const moveUp = async (itemId: string) => {
    const currentItem = tourBoardingPlaces.find(p => p.id === itemId);
    if (!currentItem) return;
    
    // 같은 날짜의 아이템들만 필터링
    const sameDateItems = tourBoardingPlaces
      .filter(p => p.visit_date === currentItem.visit_date)
      .sort((a, b) => a.order_no - b.order_no);
    
    const currentIndex = sameDateItems.findIndex(p => p.id === itemId);
    if (currentIndex <= 0) return;
    
    const previousItem = sameDateItems[currentIndex - 1];
    
    // order_no 교환
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: previousItem.order_no })
      .eq('id', currentItem.id);
      
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: currentItem.order_no })
      .eq('id', previousItem.id);
      
    fetchTourBoardingPlaces();
  };

  const moveDown = async (itemId: string) => {
    const currentItem = tourBoardingPlaces.find(p => p.id === itemId);
    if (!currentItem) return;
    
    // 같은 날짜의 아이템들만 필터링
    const sameDateItems = tourBoardingPlaces
      .filter(p => p.visit_date === currentItem.visit_date)
      .sort((a, b) => a.order_no - b.order_no);
    
    const currentIndex = sameDateItems.findIndex(p => p.id === itemId);
    if (currentIndex >= sameDateItems.length - 1) return;
    
    const nextItem = sameDateItems[currentIndex + 1];
    
    // order_no 교환
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: nextItem.order_no })
      .eq('id', currentItem.id);
      
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: currentItem.order_no })
      .eq('id', nextItem.id);
      
    fetchTourBoardingPlaces();
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">탑승지 및 경유지 관리</h2>
          <p className="text-sm text-gray-600 mt-1">이 투어의 탑승지와 경유지 정보를 관리합니다</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {/* 추가 폼 */}
      {showAddForm && (
        <div className="bg-white border border-blue-500 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">새 항목 추가</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜 선택</label>
            <input
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
              min={tourData?.start_date.split('T')[0]}
              max={tourData?.end_date.split('T')[0]}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_waypoint}
                onChange={(e) => setFormData({ ...formData, is_waypoint: e.target.checked })}
                className="rounded"
              />
              경유지/관광지로 추가
            </label>
          </div>

          {formData.is_waypoint ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">경유지명</label>
                <input
                  type="text"
                  value={formData.waypoint_name}
                  onChange={(e) => setFormData({ ...formData, waypoint_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="예: 여산 휴게소, 싱싱마트"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">정차 시간 (분)</label>
                <input
                  type="number"
                  value={formData.waypoint_duration}
                  onChange={(e) => setFormData({ ...formData, waypoint_duration: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.waypoint_description}
                  onChange={(e) => setFormData({ ...formData, waypoint_description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="예: 화장실 이용 및 휴식"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">탑승지</label>
                <select
                  value={formData.boarding_place_id}
                  onChange={(e) => setFormData({ ...formData, boarding_place_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!formData.is_waypoint}
                >
                  <option value="">선택하세요</option>
                  {availablePlaces.map(place => (
                    <option key={place.id} value={place.id}>
                      {place.name} - {place.address}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">출발 시간</label>
                <input
                  type="time"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!formData.is_waypoint}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddBoardingPlace}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              추가
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  boarding_place_id: "",
                  departure_time: "",
                  is_waypoint: false,
                  waypoint_name: "",
                  waypoint_duration: 20,
                  waypoint_description: "",
                  visit_date: tourData?.start_date.split('T')[0] || ""
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 탑승지/경유지 목록 */}
      <div className="space-y-6">
        {loading && !showAddForm ? (
          <div className="text-center py-8 text-gray-500">불러오는 중...</div>
        ) : tourBoardingPlaces.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">아직 등록된 탑승지나 경유지가 없습니다</p>
          </div>
        ) : (
          // 날짜별로 그룹화
          Object.entries(
            tourBoardingPlaces.reduce((acc, item) => {
              const date = item.visit_date || '날짜 없음';
              if (!acc[date]) acc[date] = [];
              acc[date].push(item);
              return acc;
            }, {} as Record<string, typeof tourBoardingPlaces>)
          ).map(([date, items]) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* 날짜 헤더 */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">
                    {date === '날짜 없음' ? date : new Date(date).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </h3>
                  {tourData && date === tourData.start_date.split('T')[0] && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">가는 날</span>
                  )}
                  {tourData && date === tourData.end_date.split('T')[0] && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">오는 날</span>
                  )}
                </div>
              </div>

              {/* 아이템 목록 */}
              <div className="divide-y">
                {items.sort((a, b) => a.order_no - b.order_no).map((item, index) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* 순서 번호 */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>

                      {/* 내용 */}
                      <div className="flex-1">
                        {item.is_waypoint ? (
                          // 경유지 카드
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Coffee className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                {editingId === item.id ? (
                                  <div className="space-y-3">
                                    <input
                                      type="text"
                                      defaultValue={item.waypoint_name}
                                      className="w-full px-3 py-2 border rounded-lg"
                                      placeholder="경유지명"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateWaypoint(item.id, { 
                                            waypoint_name: (e.target as HTMLInputElement).value 
                                          });
                                        }
                                      }}
                                    />
                                    <div className="flex gap-2">
                                      <input
                                        type="number"
                                        defaultValue={item.waypoint_duration}
                                        className="w-24 px-3 py-2 border rounded-lg"
                                        placeholder="분"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleUpdateWaypoint(item.id, { 
                                              waypoint_duration: parseInt((e.target as HTMLInputElement).value) || 20
                                            });
                                          }
                                        }}
                                      />
                                      <span className="py-2 text-gray-600">분 정차</span>
                                    </div>
                                    <textarea
                                      defaultValue={item.waypoint_description}
                                      className="w-full px-3 py-2 border rounded-lg"
                                      placeholder="설명"
                                      rows={2}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                          handleUpdateWaypoint(item.id, { 
                                            waypoint_description: (e.target as HTMLTextAreaElement).value 
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <h3 className="text-lg font-semibold text-orange-900">
                                      {item.waypoint_name}
                                    </h3>
                                    <p className="text-sm text-orange-700 mt-1">
                                      정차 시간: 약 {item.waypoint_duration}분
                                    </p>
                                    {item.waypoint_description && (
                                      <p className="text-sm text-orange-600 mt-2">
                                        {item.waypoint_description}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // 탑승지 카드
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Bus className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-900">
                                  {item.boarding_place?.name}
                                </h3>
                                <p className="text-sm text-blue-700 mt-1">
                                  {item.boarding_place?.address}
                                </p>
                                
                                <div className="mt-3 flex items-center gap-6">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    {editingId === item.id ? (
                                      <input
                                        type="time"
                                        defaultValue={item.departure_time?.slice(0, 5) || ''}
                                        className="px-2 py-1 border rounded"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleUpdateTime(item.id, (e.target as HTMLInputElement).value);
                                          }
                                        }}
                                        onBlur={(e) => handleUpdateTime(item.id, e.target.value)}
                                      />
                                    ) : (
                                      <span className="font-bold text-red-600 text-lg">
                                        {item.departure_time?.slice(0, 5) || ''} 출발
                                      </span>
                                    )}
                                  </div>
                                  
                                  {item.arrival_time && (
                                    <span className="text-sm text-gray-600">
                                      ({item.arrival_time.slice(0, 5)} 도착 예정)
                                    </span>
                                  )}
                                </div>

                                {item.boarding_place?.boarding_main && (
                                  <div className="mt-3 bg-white p-3 rounded">
                                    <p className="text-sm font-medium text-gray-700">
                                      <Navigation className="w-4 h-4 inline mr-1" />
                                      버스 탑승 위치
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {item.boarding_place.boarding_main}
                                    </p>
                                    {item.boarding_place.boarding_sub && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {item.boarding_place.boarding_sub}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {item.boarding_place?.parking_info && (
                                  <div className="mt-2">
                                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                                      주차: {item.boarding_place.parking_info}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => moveUp(item.id)}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => moveDown(item.id)}
                          disabled={index === items.length - 1}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
