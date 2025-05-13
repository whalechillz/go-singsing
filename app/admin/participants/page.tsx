"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, UserPlus, Edit, Trash2, Check, X, Calendar } from "lucide-react";

interface Tour {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  status?: string;
}

interface Participant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  team_name?: string;
  tour_id: string;
  room_type?: string;
  pickup_location?: string;
  is_confirmed: boolean;
  note?: string;
  emergency_contact?: string;
  join_count: number;
  group_size?: number;
  companion_names?: string;
  companions?: string[];
  isPayingForGroup: boolean;
}

const pickupOptions = [
  "군포 차고지 (산본역 1번출구 근방)",
  "양재 매헌 윤봉길의사 기념관",
  "수원월드컵 경기장 축구공 조형물 앞",
  "평택 동성골프연습장",
  "부천체육관",
  "송탄 우주골프연습장"
];
const roomTypeOptions = ["4인실", "2인실"];

const AdminParticipantsPage = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: tourData } = await supabase.from("singsing_tours").select("*").order("created_at", { ascending: false });
      setTours(tourData || []);
      const { data: participantData } = await supabase.from("singsing_participants").select("*");
      setParticipants(participantData || []);
      setFilteredParticipants(participantData || []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let currentFiltered = participants;
    if (selectedTour) currentFiltered = currentFiltered.filter(p => p.tour_id === selectedTour.id);
    if (searchTerm) {
      currentFiltered = currentFiltered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        (p.team_name && p.team_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.companions && p.companions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (p.note && p.note.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (activeTab === "confirmed") currentFiltered = currentFiltered.filter(p => p.is_confirmed);
    else if (activeTab === "unconfirmed") currentFiltered = currentFiltered.filter(p => !p.is_confirmed);
    else if (activeTab === "vip") currentFiltered = currentFiltered.filter(p => p.join_count >= 5);
    else if (activeTab === "active") {
      const activeTourIds = tours.filter(t => t.status === "active").map(t => t.id);
      currentFiltered = currentFiltered.filter(p => activeTourIds.includes(p.tour_id));
    } else if (activeTab === "canceled") {
      const canceledTourIds = tours.filter(t => t.status === "canceled").map(t => t.id);
      currentFiltered = currentFiltered.filter(p => canceledTourIds.includes(p.tour_id));
    }
    setFilteredParticipants(currentFiltered);
  }, [searchTerm, selectedTour, activeTab, participants, tours]);

  const handleSave = async () => {
    if (!currentParticipant?.name || !currentParticipant.phone || !currentParticipant.tour_id) {
      setErrorMessage("이름, 전화번호, 투어는 필수입니다.");
      return;
    }
    if (currentParticipant.id) {
      await supabase.from("singsing_participants").update(currentParticipant).eq("id", currentParticipant.id);
      setParticipants(participants.map((p) => (p.id === currentParticipant.id ? currentParticipant : p)));
    } else {
      const { data } = await supabase.from("singsing_participants").insert([currentParticipant]).select();
      setParticipants([...participants, ...(data || [])]);
    }
    setIsModalOpen(false);
    setErrorMessage("");
  };
  const handleDelete = async (id: string) => {
    await supabase.from("singsing_participants").delete().eq("id", id);
    setParticipants(participants.filter((p) => p.id !== id));
  };
  const toggleConfirmation = async (id: string) => {
    const p = participants.find((p) => p.id === id);
    if (!p) return;
    await supabase.from("singsing_participants").update({ ...p, is_confirmed: !p.is_confirmed }).eq("id", id);
    setParticipants(participants.map((p) => (p.id === id ? { ...p, is_confirmed: !p.is_confirmed } : p)));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto max-w-5xl px-2 py-8">
        {/* 상단 컨트롤 카드 (sticky) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative w-48">
                <select
                  className="w-full border rounded-lg px-4 py-2 pr-10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onChange={(e) => {
                    const tourId = e.target.value;
                    const tour = tours.find((t) => t.id === tourId);
                    setSelectedTour(tour || null);
                  }}
                  value={selectedTour?.id || ""}
                  aria-label="투어 선택"
                >
                  <option value="">전체 투어</option>
                  {tours.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title} {tour.date ? `(${tour.date})` : ""}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="이름, 전화번호, 팀, 동반자, 참고 검색..."
                  className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="검색"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap"
              onClick={() => {
                setCurrentParticipant({
                  id: "",
                  name: "",
                  phone: "",
                  email: "",
                  team_name: "",
                  tour_id: selectedTour?.id || "",
                  room_type: "",
                  pickup_location: "",
                  is_confirmed: false,
                  note: "",
                  emergency_contact: "",
                  join_count: 0,
                  group_size: 1,
                  isPayingForGroup: false,
                  companions: []
                });
                setIsModalOpen(true);
              }}
              aria-label="참가자 추가"
            >
              <UserPlus className="w-5 h-5" />
              <span>참가자 추가</span>
            </button>
          </div>
          <div className="flex border-b">
            <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === "all" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setActiveTab("all")}>전체 ({participants.length})</button>
            <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === "confirmed" ? "border-b-2 border-green-600 text-green-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setActiveTab("confirmed")}>확정 ({participants.filter((p) => p.is_confirmed).length})</button>
            <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === "unconfirmed" ? "border-b-2 border-red-600 text-red-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setActiveTab("unconfirmed")}>미확정 ({participants.filter((p) => !p.is_confirmed).length})</button>
            <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === "vip" ? "border-b-2 border-amber-600 text-amber-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setActiveTab("vip")}>VIP ({participants.filter((p) => p.join_count >= 5).length})</button>
          </div>
        </div>
        {/* 하단 테이블 카드 (가로 스크롤만) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">연락처</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">팀/동호회</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">투어</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">탑승지</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">객실</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">동반자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal min-w-[160px]">참고사항</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">참여횟수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">데이터 로딩 중...</td>
                  </tr>
                ) : filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">조건에 맞는 참가자가 없습니다.</td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const tour = tours.find((t) => t.id === p.tour_id);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2 whitespace-nowrap min-w-[80px]">
                          {p.name}
                          {p.group_size && p.group_size > 1 && (
                            <span className="ml-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">+{p.group_size - 1}명</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap min-w-[120px]">{p.phone}</td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap min-w-[120px]">{p.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">{p.team_name ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{p.team_name}</span> : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">{tour?.title || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">{p.pickup_location ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{p.pickup_location}</span> : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap min-w-[80px]">{p.room_type || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap min-w-[80px]">{p.companions && p.companions.length > 0 ? p.companions.join(', ') : '-'}</td>
                        <td className="px-6 py-4 text-gray-700 whitespace-normal min-w-[160px]">{p.note || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap min-w-[80px]">
                          <span className={`font-medium ${p.join_count >= 5 ? "text-amber-600" : "text-gray-900"}`}>{p.join_count}회</span>
                          {p.join_count >= 5 && <span className="ml-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">VIP</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap min-w-[80px]">
                          <button className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors duration-200 ${p.is_confirmed ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`} onClick={() => toggleConfirmation(p.id)} aria-label={p.is_confirmed ? "확정 해제" : "확정 처리"}>{p.is_confirmed ? (<><Check className="w-3 h-3" /><span>확정</span></>) : (<><X className="w-3 h-3" /><span>미확정</span></>)}</button>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap min-w-[80px]">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3" onClick={() => { setCurrentParticipant(p); setIsModalOpen(true); }} aria-label="수정"><Edit className="w-5 h-5" /></button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(p.id)} aria-label="삭제"><Trash2 className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* 통계 요약 */}
        <div className="mt-6 text-sm text-gray-700 bg-white p-4 rounded-2xl shadow-lg">
          <div className="font-bold text-gray-900 mb-3 border-b pb-2">참가자 현황 요약 ({selectedTour ? selectedTour.title : "전체"})</div>
          {selectedTour && (
            <div className="text-gray-600 text-sm mb-3">투어 기간: {selectedTour.start_date || selectedTour.date || "미정"}{selectedTour.end_date && ` ~ ${selectedTour.end_date}`}</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><span className="font-semibold text-blue-800">총 참가자:</span> <span className="text-lg font-bold">{participants.length}</span>명</div>
            <div><span className="font-semibold text-green-700">확정:</span> <span className="text-lg font-bold">{participants.filter((p) => p.is_confirmed).length}</span>명</div>
            <div><span className="font-semibold text-red-700">미확정:</span> <span className="text-lg font-bold">{participants.filter((p) => !p.is_confirmed).length}</span>명</div>
            <div><span className="font-semibold text-amber-700">VIP (5회 이상):</span> <span className="text-lg font-bold">{participants.filter((p) => p.join_count >= 5).length}</span>명</div>
          </div>
          {(selectedTour || searchTerm || activeTab !== "all") && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-gray-600">
              현재 목록 (<span className="font-medium">{filteredParticipants.length}</span>명)
              <span className="ml-4">확정: {filteredParticipants.filter((p) => p.is_confirmed).length}명</span>
              <span className="ml-4">미확정: {filteredParticipants.filter((p) => !p.is_confirmed).length}명</span>
            </div>
          )}
        </div>
        {/* 참가자 추가/수정 모달 */}
        {isModalOpen && currentParticipant && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-xl font-bold text-gray-900">{currentParticipant.id ? "참가자 정보 수정" : "새 참가자 추가"}</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => { setCurrentParticipant(null); setIsModalOpen(false); setErrorMessage(""); }} aria-label="닫기"><X className="w-6 h-6" /></button>
              </div>
              {errorMessage && (<div className="mb-4 bg-red-100 text-red-800 p-3 rounded-lg text-sm">{errorMessage}</div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.name} onChange={e => setCurrentParticipant({ ...currentParticipant, name: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.phone} onChange={e => setCurrentParticipant({ ...currentParticipant, phone: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">이메일</label><input type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.email || ""} onChange={e => setCurrentParticipant({ ...currentParticipant, email: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">팀/동호회</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.team_name || ""} onChange={e => setCurrentParticipant({ ...currentParticipant, team_name: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">객실</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.room_type || ""} onChange={e => setCurrentParticipant({ ...currentParticipant, room_type: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">탑승지</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.pickup_location || ""} onChange={e => setCurrentParticipant({ ...currentParticipant, pickup_location: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">비상 연락처</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.emergency_contact || ""} onChange={e => setCurrentParticipant({ ...currentParticipant, emergency_contact: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">참여 횟수</label><input type="number" min="0" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={currentParticipant.join_count || 0} onChange={e => setCurrentParticipant({ ...currentParticipant, join_count: parseInt(e.target.value) || 0 })} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">참고사항</label><textarea className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" rows={3} value={currentParticipant.note || ""} onChange={e => setCurrentParticipant({ ...currentParticipant, note: e.target.value })}></textarea></div>
                <div className="flex items-center"><input type="checkbox" id="is_confirmed" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={currentParticipant.is_confirmed || false} onChange={e => setCurrentParticipant({ ...currentParticipant, is_confirmed: e.target.checked })} /><label htmlFor="is_confirmed" className="ml-2 block text-sm text-gray-900">확정 상태</label></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleSave}>저장</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminParticipantsPage; 