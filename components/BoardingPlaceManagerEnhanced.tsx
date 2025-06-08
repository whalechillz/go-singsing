"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MapPin, 
  Bus, 
  Car, 
  Edit2, 
  Trash2, 
  Plus,
  X,
  Map,
  Navigation,
  Search,
  Building,
  Coffee,
  ShoppingBag,
  Camera,
  Utensils,
  Clock,
  List,
  ArrowUpDown,
  Grip,
  ChevronUp,
  ChevronDown,
  Users
} from "lucide-react";

type BoardingPlace = {
  id: string;
  name: string;
  address: string;
  boarding_main?: string;
  boarding_sub?: string;
  parking_main?: string;
  parking_map_url?: string;
  created_at?: string;
  parking_info?: string;
  place_type?: 'boarding' | 'rest_area' | 'mart' | 'tourist_spot' | 'restaurant';
  image_url?: string;
  attraction_id?: string;
  attraction?: any;
  order_index?: number;
  arrival_time?: string;
  stay_duration?: string;
  distance_from_prev?: string;
  duration_from_prev?: string;
  passenger_count?: number;
  notes?: string;
};

const placeTypeMap: Record<string, { label: string; icon: any; color: string }> = {
  'boarding': { label: '탑승지', icon: Bus, color: 'blue' },
  'rest_area': { label: '휴게소', icon: Coffee, color: 'green' },
  'mart': { label: '마트', icon: ShoppingBag, color: 'purple' },
  'tourist_spot': { label: '관광지', icon: Camera, color: 'orange' },
  'restaurant': { label: '식당', icon: Utensils, color: 'red' }
};

const BoardingPlaceManagerEnhanced: React.FC = () => {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [form, setForm] = useState<Omit<BoardingPlace, "id" | "created_at">>({
    name: "",
    address: "",
    boarding_main: "",
    boarding_sub: "",
    parking_main: "",
    parking_map_url: "",
    parking_info: "",
    place_type: "boarding",
    attraction_id: "",
    order_index: 0,
    arrival_time: "",
    stay_duration: "",
    distance_from_prev: "",
    duration_from_prev: "",
    passenger_count: 0,
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [attractions, setAttractions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // 목록 조회
  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("singsing_boarding_places")
      .select("*")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });
    
    if (error) setError(error.message);
    else setPlaces(data || []);
    setLoading(false);
  };

  // 관광지 목록 조회
  const fetchAttractions = async () => {
    const { data, error } = await supabase
      .from("tourist_attractions")
      .select("*")
      .eq("is_active", true)
      .order("name");
    
    if (error) console.error("Error fetching attractions:", error);
    else setAttractions(data || []);
  };

  useEffect(() => { 
    fetchPlaces();
    fetchAttractions();
  }, []);

  // 필터링된 장소 목록
  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || place.place_type === selectedType;
    return matchesSearch && matchesType;
  });

  // 입력값 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'place_type' && value === 'tourist_spot') {
      setForm({ ...form, [name]: value });
    } else if (name === 'attraction_id') {
      const attraction = attractions.find(a => a.id === value);
      if (attraction) {
        setForm({
          ...form,
          attraction_id: value,
          name: attraction.name,
          address: attraction.address || form.address
        });
      } else {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ 
        ...form, 
        [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value 
      });
    }
  };

  // 추가/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!form.name || !form.address) {
      setError("장소명과 주소는 필수입니다.");
      setLoading(false);
      return;
    }
    
    // 새로운 장소 추가시 order_index 자동 설정
    let orderIndex = form.order_index;
    if (!editingId && orderIndex === 0) {
      const maxOrder = Math.max(...places.map(p => p.order_index || 0), 0);
      orderIndex = maxOrder + 1;
    }
    
    const dataToSubmit: any = {
      name: form.name,
      address: form.address,
      boarding_main: form.boarding_main || null,
      boarding_sub: form.boarding_sub || null,
      parking_main: form.parking_main || null,
      parking_map_url: form.parking_map_url || null,
      parking_info: form.parking_info || null,
      place_type: form.place_type || 'boarding',
      image_url: form.image_url || null,
      attraction_id: form.attraction_id || null,
      order_index: orderIndex,
      arrival_time: form.arrival_time || null,
      stay_duration: form.stay_duration || null,
      distance_from_prev: form.distance_from_prev || null,
      duration_from_prev: form.duration_from_prev || null,
      passenger_count: form.passenger_count || null,
      notes: form.notes || null
    };
    
    let success = false;
    
    if (editingId) {
      const { error } = await supabase
        .from("singsing_boarding_places")
        .update(dataToSubmit)
        .eq("id", editingId);
      
      if (error) {
        console.error('Update error:', error);
        setError(error.message);
      } else {
        success = true;
        setEditingId(null);
        setShowForm(false);
      }
    } else {
      const { error } = await supabase
        .from("singsing_boarding_places")
        .insert([dataToSubmit]);
      
      if (error) {
        console.error('Insert error:', error);
        setError(error.message);
      } else {
        success = true;
        setShowForm(false);
      }
    }
    
    if (success) {
      resetForm();
      fetchPlaces();
    }
    setLoading(false);
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    const { error } = await supabase
      .from("singsing_boarding_places")
      .delete()
      .eq("id", id);
    
    if (error) setError(error.message);
    setLoading(false);
    fetchPlaces();
  };

  // 수정 모드 진입
  const handleEdit = (place: BoardingPlace) => {
    setEditingId(place.id);
    setForm({
      name: place.name,
      address: place.address,
      boarding_main: place.boarding_main || "",
      boarding_sub: place.boarding_sub || "",
      parking_main: place.parking_main || "",
      parking_map_url: place.parking_map_url || "",
      parking_info: place.parking_info || "",
      place_type: place.place_type || "boarding",
      attraction_id: place.attraction_id || "",
      order_index: place.order_index || 0,
      arrival_time: place.arrival_time || "",
      stay_duration: place.stay_duration || "",
      distance_from_prev: place.distance_from_prev || "",
      duration_from_prev: place.duration_from_prev || "",
      passenger_count: place.passenger_count || 0,
      notes: place.notes || ""
    });
    setShowForm(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setEditingId(null);
    setForm({ 
      name: "", 
      address: "", 
      boarding_main: "", 
      boarding_sub: "", 
      parking_main: "", 
      parking_map_url: "",
      parking_info: "",
      place_type: "boarding",
      attraction_id: "",
      order_index: 0,
      arrival_time: "",
      stay_duration: "",
      distance_from_prev: "",
      duration_from_prev: "",
      passenger_count: 0,
      notes: ""
    });
    setShowForm(false);
    setError(null);
  };

  // 순서 변경
  const updateOrder = async (placeId: string, direction: 'up' | 'down') => {
    const sortedPlaces = [...places].sort((a, b) => 
      (a.order_index || 0) - (b.order_index || 0)
    );
    
    const currentIndex = sortedPlaces.findIndex(p => p.id === placeId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedPlaces.length) return;
    
    const currentPlace = sortedPlaces[currentIndex];
    const targetPlace = sortedPlaces[targetIndex];
    
    const currentOrder = currentPlace.order_index || 0;
    const targetOrder = targetPlace.order_index || 0;
    
    // 순서 교환
    await supabase
      .from("singsing_boarding_places")
      .update({ order_index: targetOrder })
      .eq("id", currentPlace.id);
      
    await supabase
      .from("singsing_boarding_places")
      .update({ order_index: currentOrder })
      .eq("id", targetPlace.id);
      
    fetchPlaces();
  };

  // 장소 유형별 아이콘 가져오기
  const getPlaceIcon = (type?: string) => {
    const IconComponent = placeTypeMap[type || 'boarding']?.icon || Building;
    const color = placeTypeMap[type || 'boarding']?.color || 'gray';
    return <IconComponent className={`w-4 h-4 text-${color}-500`} />;
  };

  // 통계 계산
  const stats = {
    total: places.length,
    boarding: places.filter(p => p.place_type === 'boarding').length,
    tourist_spot: places.filter(p => p.place_type === 'tourist_spot').length,
    restaurant: places.filter(p => p.place_type === 'restaurant').length,
    rest_area: places.filter(p => p.place_type === 'rest_area').length,
    totalPassengers: places.reduce((sum, p) => sum + (p.passenger_count || 0), 0)
  };

  // 타임라인 뷰 컴포넌트
  const TimelineView = () => {
    const sortedPlaces = [...filteredPlaces].sort((a, b) => 
      (a.order_index || 999) - (b.order_index || 999)
    );

    return (
      <div className="space-y-4">
        {sortedPlaces.map((place, index) => (
          <div key={place.id} className="relative">
            {/* 연결선 */}
            {index < sortedPlaces.length - 1 && (
              <div className="absolute left-10 top-20 w-0.5 h-24 bg-gray-300">
                {place.duration_from_prev && place.distance_from_prev && (
                  <div className="absolute -left-16 top-1/2 text-xs text-gray-500 bg-white px-1 whitespace-nowrap">
                    {place.duration_from_prev} • {place.distance_from_prev}
                  </div>
                )}
              </div>
            )}
            
            {/* 장소 카드 */}
            <div className="flex gap-4 bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              {/* 순서 번호 */}
              <div className={`w-12 h-12 rounded-full bg-${placeTypeMap[place.place_type || 'boarding']?.color}-100 flex items-center justify-center flex-shrink-0`}>
                <span className={`text-${placeTypeMap[place.place_type || 'boarding']?.color}-600 font-bold`}>
                  {place.order_index || index + 1}
                </span>
              </div>
              
              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {getPlaceIcon(place.place_type)}
                  <h3 className="font-semibold text-lg">{place.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full bg-${placeTypeMap[place.place_type || 'boarding']?.color}-100 text-${placeTypeMap[place.place_type || 'boarding']?.color}-700`}>
                    {placeTypeMap[place.place_type || 'boarding']?.label}
                  </span>
                  {place.passenger_count && place.passenger_count > 0 && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {place.passenger_count}명
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{place.address}</p>
                
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  {place.arrival_time && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      {place.arrival_time} 도착
                    </span>
                  )}
                  {place.stay_duration && (
                    <span className="text-gray-500">
                      체류: {place.stay_duration}
                    </span>
                  )}
                  {place.parking_info && (
                    <span className="text-gray-500">
                      주차비: {place.parking_info}
                    </span>
                  )}
                  {place.notes && (
                    <span className="text-gray-500 italic">
                      {place.notes}
                    </span>
                  )}
                </div>
                
                {/* 탑승지 정보 */}
                {place.place_type === 'boarding' && place.boarding_main && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium text-blue-900">탑승 안내</div>
                    <div className="text-blue-700">{place.boarding_main}</div>
                    {place.boarding_sub && (
                      <div className="text-blue-600">{place.boarding_sub}</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* 액션 버튼 */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => updateOrder(place.id, 'up')}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => updateOrder(place.id, 'down')}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={index === sortedPlaces.length - 1}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <button 
                  onClick={() => handleEdit(place)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => handleDelete(place.id)}
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
  };

  // 테이블 뷰 컴포넌트
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              순서
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              장소 정보
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              도착/체류
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              버스 탑승 안내
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              주차장 정보
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredPlaces.sort((a, b) => (a.order_index || 999) - (b.order_index || 999)).map((place) => (
            <tr key={place.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-center">
                <span className="text-lg font-bold text-gray-600">
                  {place.order_index || '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    {getPlaceIcon(place.place_type)}
                    <span className="text-sm font-medium text-gray-900">
                      {place.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {placeTypeMap[place.place_type || 'boarding']?.label}
                    </span>
                    {place.passenger_count && place.passenger_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        {place.passenger_count}명
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {place.address}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {place.arrival_time || place.stay_duration ? (
                  <div>
                    {place.arrival_time && (
                      <div className="text-sm text-gray-900">
                        도착: {place.arrival_time}
                      </div>
                    )}
                    {place.stay_duration && (
                      <div className="text-sm text-gray-500">
                        체류: {place.stay_duration}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4">
                {place.place_type === 'boarding' && place.boarding_main ? (
                  <div>
                    <div className="text-sm text-gray-900">
                      {place.boarding_main}
                    </div>
                    {place.boarding_sub && (
                      <div className="text-sm text-gray-500 mt-1">
                        {place.boarding_sub}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">
                    {place.place_type !== 'boarding' ? '해당없음' : '-'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {place.parking_main || place.parking_info ? (
                  <div>
                    {place.parking_main && (
                      <div className="text-sm text-gray-900">
                        {place.parking_main}
                      </div>
                    )}
                    {place.parking_info && (
                      <div className="text-sm text-gray-600">
                        주차비: {place.parking_info}
                      </div>
                    )}
                    {place.parking_map_url && (
                      <a
                        href={place.parking_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <Map className="w-3 h-3" />
                        지도 보기
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <button
                  onClick={() => handleEdit(place)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(place.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">여정 관리</h1>
            <p className="text-sm text-gray-500 mt-1">투어 일정의 모든 경유지를 순서대로 관리합니다</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            장소 추가
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">전체</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.boarding}</div>
          <div className="text-sm text-gray-600">탑승지</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{stats.tourist_spot}</div>
          <div className="text-sm text-gray-600">관광지</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-2xl font-bold text-red-600">{stats.restaurant}</div>
          <div className="text-sm text-gray-600">식당</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.rest_area}</div>
          <div className="text-sm text-gray-600">휴게소</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{stats.totalPassengers}</div>
          <div className="text-sm text-gray-600">총 승객</div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg p-4 mb-6 space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Navigation className="w-4 h-4" />
              타임라인
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              테이블
            </button>
          </div>
          
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'all' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {Object.entries(placeTypeMap).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === key
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="장소명 또는 주소로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 입력/수정 폼 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? "장소 수정" : "새 장소 추가"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  장소 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="place_type"
                  value={form.place_type}
                  onChange={handleChange}
                  required
                >
                  {Object.entries(placeTypeMap).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>
              
              {form.place_type === 'tourist_spot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    관광지 선택
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="attraction_id"
                    value={form.attraction_id}
                    onChange={handleChange}
                  >
                    <option value="">직접 입력</option>
                    {attractions.map(attraction => (
                      <option key={attraction.id} value={attraction.id}>
                        {attraction.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  순서
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="order_index"
                  value={form.order_index}
                  onChange={handleChange}
                  placeholder="자동 설정"
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  장소명 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={
                      form.place_type === 'boarding' ? "예: 신논현역 9번출구" :
                      form.place_type === 'restaurant' ? "예: 강남 맛집" :
                      form.place_type === 'tourist_spot' ? "예: 남산타워" :
                      "장소명을 입력하세요"
                    }
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="서울시 강남구..."
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* 시간 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  도착 시간
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="arrival_time"
                  value={form.arrival_time}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  체류 시간
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="stay_duration"
                  value={form.stay_duration}
                  onChange={handleChange}
                  placeholder="예: 30분, 1시간"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이전 장소에서 거리
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="distance_from_prev"
                  value={form.distance_from_prev}
                  onChange={handleChange}
                  placeholder="예: 50km"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  소요 시간
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="duration_from_prev"
                  value={form.duration_from_prev}
                  onChange={handleChange}
                  placeholder="예: 1시간 30분"
                />
              </div>
            </div>
            
            {/* 탑승지 정보 */}
            {form.place_type === 'boarding' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      버스 탑승지 주 안내
                    </label>
                    <div className="relative">
                      <Bus className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="boarding_main"
                        value={form.boarding_main}
                        onChange={handleChange}
                        placeholder="예: 9번 출구 앞 버스 정류장"
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      탑승 인원
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="passenger_count"
                        value={form.passenger_count}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    버스 탑승지 보조 안내
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="boarding_sub"
                    value={form.boarding_sub}
                    onChange={handleChange}
                    placeholder="추가 안내사항"
                  />
                </div>
              </>
            )}
            
            {/* 주차장 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주차장 오시는 길
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="parking_main"
                    value={form.parking_main}
                    onChange={handleChange}
                    placeholder="주차장 위치 및 이용 안내"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    네이버 지도 링크
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="parking_map_url"
                      value={form.parking_map_url}
                      onChange={handleChange}
                      placeholder="https://naver.me/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주차비
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="parking_info"
                    value={form.parking_info}
                    onChange={handleChange}
                    placeholder="예: 7,000원 / 무료 / 10,000원 등"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비고
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="추가 메모사항"
                  rows={2}
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "처리중..." : (editingId ? "수정" : "추가")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 장소 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && !showForm ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">장소 목록을 불러오는 중...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 장소가 없습니다."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                첫 장소 추가하기
              </button>
            )}
          </div>
        ) : (
          <div>
            {viewMode === 'timeline' ? <TimelineView /> : <TableView />}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardingPlaceManagerEnhanced;
