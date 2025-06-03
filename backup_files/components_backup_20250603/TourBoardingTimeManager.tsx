"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Clock, Save, Plus, Trash2, MapPin } from "lucide-react";

interface BoardingPlace {
  id: string;
  name: string;
  address?: string;
}

interface TourBoardingTime {
  id?: string;
  tour_id: string;
  boarding_place_id: string;
  pickup_time: string;
  arrival_time?: string;
  notes?: string;
  boarding_place?: BoardingPlace;
}

interface Props {
  tourId: string;
}

const TourBoardingTimeManager: React.FC<Props> = ({ tourId }) => {
  const [boardingPlaces, setBoardingPlaces] = useState<BoardingPlace[]>([]);
  const [tourBoardingTimes, setTourBoardingTimes] = useState<TourBoardingTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 탑승지 목록 가져오기
  const fetchBoardingPlaces = async () => {
    const { data, error } = await supabase
      .from("singsing_boarding_places")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("탑승지 로드 오류:", error);
      setError(error.message);
    } else {
      setBoardingPlaces(data || []);
    }
  };

  // 투어별 탑승 시간 가져오기
  const fetchTourBoardingTimes = async () => {
    const { data, error } = await supabase
      .from("singsing_tour_boarding_times")
      .select(`
        *,
        boarding_place:singsing_boarding_places(id, name, address)
      `)
      .eq("tour_id", tourId)
      .order("pickup_time");
    
    if (error) {
      console.error("투어 탑승 시간 로드 오류:", error);
      setError(error.message);
    } else {
      setTourBoardingTimes(data || []);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBoardingPlaces(), fetchTourBoardingTimes()]);
      setLoading(false);
    };
    loadData();
  }, [tourId]);

  // 출발시간 변경 시 도착시간 자동 계산 (20분 전)
  const calculateArrivalTime = (pickupTime: string): string => {
    if (!pickupTime) return "";
    try {
      const [hours, minutes] = pickupTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 20;
      const arrivalHours = Math.floor(totalMinutes / 60);
      const arrivalMinutes = totalMinutes % 60;
      return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
    } catch {
      return "";
    }
  };

  // 새 탑승지 시간 추가
  const handleAddBoardingTime = () => {
    const newTime: TourBoardingTime = {
      tour_id: tourId,
      boarding_place_id: "",
      pickup_time: "06:00",
      arrival_time: "05:40",
      notes: ""
    };
    setTourBoardingTimes([...tourBoardingTimes, newTime]);
  };

  // 탑승지 시간 업데이트
  const handleUpdateTime = (index: number, field: keyof TourBoardingTime, value: string) => {
    const updated = [...tourBoardingTimes];
    updated[index] = { ...updated[index], [field]: value };
    
    // 출발시간 변경 시 도착시간 자동 계산
    if (field === 'pickup_time') {
      updated[index].arrival_time = calculateArrivalTime(value);
    }
    
    setTourBoardingTimes(updated);
  };

  // 탑승지 시간 삭제
  const handleDeleteTime = async (index: number) => {
    const timeToDelete = tourBoardingTimes[index];
    
    if (timeToDelete.id) {
      // DB에서 삭제
      const { error } = await supabase
        .from("singsing_tour_boarding_times")
        .delete()
        .eq("id", timeToDelete.id);
      
      if (error) {
        setError(error.message);
        return;
      }
    }
    
    // 로컬 상태에서 제거
    const updated = tourBoardingTimes.filter((_, i) => i !== index);
    setTourBoardingTimes(updated);
  };

  // 전체 저장
  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // 유효성 검사
      const invalidTimes = tourBoardingTimes.filter(t => !t.boarding_place_id || !t.pickup_time);
      if (invalidTimes.length > 0) {
        setError("모든 탑승지와 시간을 입력해주세요.");
        setSaving(false);
        return;
      }
      
      // 중복 체크
      const duplicates = tourBoardingTimes.filter((time, index) => 
        tourBoardingTimes.findIndex(t => t.boarding_place_id === time.boarding_place_id) !== index
      );
      if (duplicates.length > 0) {
        setError("중복된 탑승지가 있습니다.");
        setSaving(false);
        return;
      }
      
      // 기존 데이터와 새 데이터 분리
      const toUpdate = tourBoardingTimes.filter(t => t.id);
      const toInsert = tourBoardingTimes.filter(t => !t.id);
      
      // 업데이트
      for (const time of toUpdate) {
        const { id, boarding_place, ...updateData } = time;
        const { error } = await supabase
          .from("singsing_tour_boarding_times")
          .update(updateData)
          .eq("id", id);
        
        if (error) throw error;
      }
      
      // 삽입
      if (toInsert.length > 0) {
        const insertData = toInsert.map(({ boarding_place, ...data }) => data);
        const { error } = await supabase
          .from("singsing_tour_boarding_times")
          .insert(insertData);
        
        if (error) throw error;
      }
      
      // 데이터 새로고침
      await fetchTourBoardingTimes();
      
      alert("저장되었습니다.");
    } catch (error: any) {
      console.error("저장 오류:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          투어별 탑승 시간 설정
        </h3>
        <button
          onClick={handleAddBoardingTime}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          탑승지 추가
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {tourBoardingTimes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            탑승 시간이 설정되지 않았습니다.
          </div>
        ) : (
          tourBoardingTimes.map((time, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  탑승지
                </label>
                <select
                  value={time.boarding_place_id}
                  onChange={(e) => handleUpdateTime(index, 'boarding_place_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={!!time.id}
                >
                  <option value="">선택하세요</option>
                  {boardingPlaces.map(place => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출발시간
                </label>
                <input
                  type="time"
                  value={time.pickup_time}
                  onChange={(e) => handleUpdateTime(index, 'pickup_time', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  도착시간
                </label>
                <input
                  type="time"
                  value={time.arrival_time || ''}
                  onChange={(e) => handleUpdateTime(index, 'arrival_time', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="자동계산"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비고
                </label>
                <input
                  type="text"
                  value={time.notes || ''}
                  onChange={(e) => handleUpdateTime(index, 'notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="선택사항"
                />
              </div>
              
              <button
                onClick={() => handleDeleteTime(index)}
                className="text-red-600 hover:text-red-700 mt-6"
                title="삭제"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:bg-gray-400"
        >
          <Save className="w-4 h-4" />
          {saving ? "저장 중..." : "전체 저장"}
        </button>
      </div>
    </div>
  );
};

export default TourBoardingTimeManager;
