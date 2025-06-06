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
  Building
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
};

const placeTypeMap: Record<string, string> = {
  'boarding': '탑승지',
  'rest_area': '휴게소',
  'mart': '마트',
  'tourist_spot': '관광지',
  'restaurant': '맛집'
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
  attraction_id: ""
});
const [editingId, setEditingId] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [attractions, setAttractions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  // 목록 조회
  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("singsing_boarding_places")
      .select("*")
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
    const { name, value } = e.target;
    if (name === 'place_type' && value === 'tourist_spot') {
      // 관광지 타입 선택시 관광지 선택 필드 활성화
      setForm({ ...form, [name]: value });
    } else if (name === 'attraction_id') {
      // 관광지 선택시 해당 정보로 자동 채우기
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
      setForm({ ...form, [name]: value });
    }
  };

  // 추가/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!form.name || !form.address) {
      setError("탑승지명과 주소는 필수입니다.");
      setLoading(false);
      return;
    }
    
    if (editingId) {
      const { error } = await supabase
        .from("singsing_boarding_places")
        .update(form)
        .eq("id", editingId);
      
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setShowForm(false);
      }
    } else {
      const { error } = await supabase
        .from("singsing_boarding_places")
        .insert([{ ...form }]);
      
      if (error) setError(error.message);
      else setShowForm(false);
    }
    
    setForm({ 
      name: "", 
      address: "", 
      boarding_main: "", 
      boarding_sub: "", 
      parking_main: "", 
      parking_map_url: "",
      parking_info: ""
    });
    setLoading(false);
    fetchPlaces();
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
      attraction_id: place.attraction_id || ""
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
      attraction_id: ""
    });
    setShowForm(false);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">여정 관리</h1>
            <p className="text-sm text-gray-500 mt-1">투어 탑승지, 경유지, 관광지를 통합 관리합니다</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 탑승지</p>
              <p className="text-2xl font-bold text-gray-900">{places.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">버스 탑승지</p>
              <p className="text-2xl font-bold text-gray-900">
                {places.filter(p => p.boarding_main).length}
              </p>
            </div>
            <Bus className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">주차장 정보</p>
              <p className="text-2xl font-bold text-gray-900">
                {places.filter(p => p.parking_main).length}
              </p>
            </div>
            <Car className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">지도 연결</p>
              <p className="text-2xl font-bold text-gray-900">
                {places.filter(p => p.parking_map_url).length}
              </p>
            </div>
            <Map className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg p-4 mb-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'all' 
                ? 'bg-blue-600 text-white' 
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {value}
            </button>
          ))}
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
              {editingId ? "탑승지 수정" : "새 탑승지 추가"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    <option key={key} value={key}>{value}</option>
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
                    placeholder="예: 신논현역 9번출구"
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
            
            <div className="space-y-4">
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

      {/* 탑승지 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && !showForm ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">탑승지 목록을 불러오는 중...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 탑승지가 없습니다."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                첫 탑승지 추가하기
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    장소 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    버스 탑승 안내
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주차장 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주차비
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlaces.map((place) => (
                  <tr key={place.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {place.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            place.place_type === 'boarding' ? 'bg-blue-100 text-blue-800' :
                            place.place_type === 'rest_area' ? 'bg-gray-100 text-gray-800' :
                            place.place_type === 'tourist_spot' ? 'bg-green-100 text-green-800' :
                            place.place_type === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {placeTypeMap[place.place_type || 'boarding']}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {place.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {place.boarding_main ? (
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
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {place.parking_main ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {place.parking_main}
                          </div>
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
                    <td className="px-6 py-4">
                      {place.parking_info ? (
                        <span className="text-sm text-gray-900">{place.parking_info}</span>
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
        )}
      </div>
    </div>
  );
};

export default BoardingPlaceManagerEnhanced;
