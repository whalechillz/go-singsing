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
  place_type?: 'boarding';
  passenger_count?: number;
  notes?: string;
};

const BoardingPlaceManager: React.FC = () => {
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
    passenger_count: 0,
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 목록 조회
  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("singsing_boarding_places")
      .select("*")
      .eq("place_type", "boarding")
      .order("name", { ascending: true });
    
    if (error) setError(error.message);
    else setPlaces(data || []);
    setLoading(false);
  };

  useEffect(() => { 
    fetchPlaces();
  }, []);

  // 필터링된 장소 목록
  const filteredPlaces = places.filter(place => {
    return place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 입력값 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value 
    });
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
    
    const dataToSubmit: any = {
      name: form.name,
      address: form.address,
      boarding_main: form.boarding_main || null,
      boarding_sub: form.boarding_sub || null,
      parking_main: form.parking_main || null,
      parking_map_url: form.parking_map_url || null,
      parking_info: form.parking_info || null,
      place_type: 'boarding',
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
      setForm({ 
        name: "", 
        address: "", 
        boarding_main: "", 
        boarding_sub: "", 
        parking_main: "", 
        parking_map_url: "",
        parking_info: "",
        place_type: "boarding",
        passenger_count: 0,
        notes: ""
      });
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
      place_type: "boarding",
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
      passenger_count: 0,
      notes: ""
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
            <h1 className="text-2xl font-bold text-gray-900">탑승지 관리</h1>
            <p className="text-sm text-gray-500 mt-1">투어 버스 탑승 장소를 관리합니다</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            탑승지 추가
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 탑승지</p>
              <p className="text-2xl font-bold text-gray-900">{places.length}</p>
            </div>
            <Bus className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">예상 탑승 인원</p>
              <p className="text-2xl font-bold text-gray-900">
                {places.reduce((sum, p) => sum + (p.passenger_count || 0), 0)}명
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">주차 가능</p>
              <p className="text-2xl font-bold text-gray-900">
                {places.filter(p => p.parking_main).length}
              </p>
            </div>
            <Car className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg p-4 mb-6">
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
                    예상 탑승 인원
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
                    탑승지 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    버스 탑승 안내
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주차장 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    탑승 인원
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
                          <Bus className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {place.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {place.address}
                        </div>
                        {place.notes && (
                          <div className="text-sm text-gray-400 mt-1">
                            {place.notes}
                          </div>
                        )}
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
                    <td className="px-6 py-4">
                      {place.passenger_count && place.passenger_count > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                          <Users className="w-4 h-4 text-gray-500" />
                          {place.passenger_count}명
                        </span>
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

export default BoardingPlaceManager;
