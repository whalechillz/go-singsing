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
  Coffee
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
    
    const nextOrderNo = tourBoardingPlaces.length + 1;
    
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
      // 순서 재정렬
      await reorderPlaces();
    }
  };

  const reorderPlaces = async () => {
    const { data } = await supabase
      .from('singsing_tour_boarding_times')
      .select('*')
      .eq('tour_id', tourId)
      .order('order_no');

    if (data) {
      const updates = data.map((item, index) => ({
        id: item.id,
        order_no: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('singsing_tour_boarding_times')
          .update({ order_no: update.order_no })
          .eq('id', update.id);
      }
      
      fetchTourBoardingPlaces();
    }
  };

  const moveUp = async (itemId: string) => {
    const currentIndex = tourBoardingPlaces.findIndex(p => p.id === itemId);
    if (currentIndex <= 0) return;
    
    const current = tourBoardingPlaces[currentIndex];
    const previous = tourBoardingPlaces[currentIndex - 1];
    
    // 같은 날짜인지 확인
    if ((current.visit_date || '') !== (previous.visit_date || '')) return;
    
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: previous.order_no })
      .eq('id', current.id);
      
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: current.order_no })
      .eq('id', previous.id);
      
    fetchTourBoardingPlaces();
  };

  const moveDown = async (itemId: string) => {
    const currentIndex = tourBoardingPlaces.findIndex(p => p.id === itemId);
    if (currentIndex >= tourBoardingPlaces.length - 1) return;
    
    const current = tourBoardingPlaces[currentIndex];
    const next = tourBoardingPlaces[currentIndex + 1];
    
    // 같은 날짜인지 확인
    if ((current.visit_date || '') !== (next.visit_date || '')) return;
    
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: next.order_no })
      .eq('id', current.id);
      
    await supabase
      .from('singsing_tour_boarding_times')
      .update({ order_no: current.order_no })
      .eq('id', next.id);
      
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
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                {date === '날짜 없음' ? date : new Date(date).toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                })}
                {tourData && date === tourData.start_date.split('T')[0] && ' (가는 날)'}
                {tourData && date === tourData.end_date.split('T')[0] && ' (오는 날)'}
              </h3>
              {items.map((item, index) => (
            <div key={item.id} className="bg-white border rounded-lg p-6 relative">
              {/* 순서 변경 버튼 */}
              <div className="absolute right-4 top-4 flex flex-col gap-1">
                <button
                  onClick={() => moveUp(item.id)}
                  disabled={index === 0 || (index > 0 && (items[index-1]?.visit_date || '') !== (item.visit_date || ''))}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="위로 이동"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(item.id)}
                  disabled={index === items.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="아래로 이동"
                >
                  ▼
                </button>
              </div>

              {item.is_waypoint ? (
                // 경유지/관광지 표시
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Coffee className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          defaultValue={item.waypoint_name}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              handleUpdateWaypoint(item.id, { 
                                waypoint_name: target.value 
                              });
                            }
                          }}
                          className="px-2 py-1 border rounded"
                          placeholder="경유지명"
                        />
                        <input
                          type="number"
                          defaultValue={item.waypoint_duration}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              handleUpdateWaypoint(item.id, { 
                                waypoint_duration: parseInt(target.value) || 20
                              });
                            }
                          }}
                          className="px-2 py-1 border rounded w-20"
                          placeholder="시간(분)"
                        />
                        <textarea
                          defaultValue={item.waypoint_description}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              const target = e.target as HTMLTextAreaElement;
                              handleUpdateWaypoint(item.id, { 
                                waypoint_description: target.value 
                              });
                            }
                          }}
                          className="w-full px-2 py-1 border rounded"
                          placeholder="설명 (Ctrl+Enter로 저장)"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900">
                          {index + 1}. {item.waypoint_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          정차 시간: 약 {item.waypoint_duration}분
                        </p>
                        {item.waypoint_description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.waypoint_description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // 탑승지 표시
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Bus className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {index + 1}. {item.boarding_place?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.boarding_place?.address}
                    </p>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {editingId === item.id ? (
                          <input
                            type="time"
                            defaultValue={item.departure_time?.slice(0, 5) || ''}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                handleUpdateTime(item.id, target.value);
                              }
                            }}
                            onBlur={(e) => handleUpdateTime(item.id, e.target.value)}
                            className="px-2 py-1 border rounded"
                          />
                        ) : (
                          <span className="font-medium text-red-600">
                            출발: {item.departure_time?.slice(0, 5) || ''}
                          </span>
                        )}
                      </div>
                      
                      {item.arrival_time && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            도착: {item.arrival_time.slice(0, 5)}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.boarding_place?.boarding_main && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="font-medium">버스 탑승지:</p>
                        <p>{item.boarding_place.boarding_main}</p>
                        {item.boarding_place.boarding_sub && (
                          <p className="text-gray-500">{item.boarding_place.boarding_sub}</p>
                        )}
                      </div>
                    )}

                    {item.boarding_place?.parking_info && (
                      <div className="mt-2 text-sm">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          주차: {item.boarding_place.parking_info}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
