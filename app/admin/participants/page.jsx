"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, UserPlus, Edit, Trash2, Check, X, Calendar } from 'lucide-react';

const AdminParticipantsPage = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // 투어/참가자 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: tourData } = await supabase.from('singsing_tours').select('*').order('created_at', { ascending: false });
      setTours(tourData || []);
      const { data: participantData } = await supabase.from('singsing_participants').select('*');
      setParticipants(participantData || []);
      setFilteredParticipants(participantData || []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // 검색/필터
  useEffect(() => {
    let base = participants;
    if (selectedTour) base = base.filter(p => p.tour_id === selectedTour.id);
    base = base.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      (p.team_name && p.team_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (activeTab === 'confirmed') base = base.filter(p => p.is_confirmed);
    if (activeTab === 'unconfirmed') base = base.filter(p => !p.is_confirmed);
    if (activeTab === 'vip') base = base.filter(p => p.join_count >= 5);
    setFilteredParticipants(base);
  }, [searchTerm, participants, selectedTour, activeTab]);

  // 참가자 추가/수정/삭제
  const handleSave = async () => {
    if (!currentParticipant.name || !currentParticipant.phone || !currentParticipant.tour_id) {
      setErrorMessage('이름, 전화번호, 투어는 필수입니다.');
      return;
    }
    if (currentParticipant.id) {
      // 수정
      await supabase.from('singsing_participants').update(currentParticipant).eq('id', currentParticipant.id);
      setParticipants(participants.map(p => p.id === currentParticipant.id ? currentParticipant : p));
    } else {
      // 추가
      const { data } = await supabase.from('singsing_participants').insert([currentParticipant]).select();
      setParticipants([...participants, ...(data || [])]);
    }
    setIsModalOpen(false);
    setErrorMessage('');
  };
  const handleDelete = async (id) => {
    await supabase.from('singsing_participants').delete().eq('id', id);
    setParticipants(participants.filter(p => p.id !== id));
  };
  const toggleConfirmation = async (id) => {
    const p = participants.find(p => p.id === id);
    if (!p) return;
    await supabase.from('singsing_participants').update({ ...p, is_confirmed: !p.is_confirmed }).eq('id', id);
    setParticipants(participants.map(p => p.id === id ? { ...p, is_confirmed: !p.is_confirmed } : p));
  };

  // UI 렌더링
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-2xl font-bold">싱싱골프투어 참가자 관리</h1>
        </div>
      </div>
      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* 투어 선택 드롭다운 */}
                  <div className="relative">
                    <select
                      className="bg-white border rounded-lg px-4 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                      onChange={(e) => {
                        const tourId = e.target.value;
                        const tour = tours.find(t => t.id === tourId);
                        setSelectedTour(tour || null);
                      }}
                      value={selectedTour?.id || ''}
                    >
                      <option value="">전체 투어</option>
                      {tours.map(tour => (
                        <option key={tour.id} value={tour.id}>
                          {tour.title}
                        </option>
                      ))}
                    </select>
                    <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {/* 검색 입력 */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름, 전화번호, 팀 검색..."
                      className="bg-white border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {/* 참가자 추가 버튼 */}
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  onClick={() => { setCurrentParticipant({ id: null, name: '', phone: '', email: '', team_name: '', tour_id: selectedTour?.id || '', room_type: '', pickup_location: '', is_confirmed: false, note: '', emergency_contact: '', join_count: 0 }); setIsModalOpen(true); }}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>참가자 추가</span>
                </button>
              </div>
              {/* 탭 필터 */}
              <div className="flex border-b">
                <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('all')}>전체 ({participants.length})</button>
                <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'confirmed' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('confirmed')}>확정 ({participants.filter(p => p.is_confirmed).length})</button>
                <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'unconfirmed' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('unconfirmed')}>미확정 ({participants.filter(p => !p.is_confirmed).length})</button>
                <button className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'vip' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('vip')}>VIP ({participants.filter(p => p.join_count >= 5).length})</button>
              </div>
            </div>
            {/* Participants table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">팀/동호회</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">투어</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">탑승지</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">참여횟수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                          조건에 맞는 참가자가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => {
                        const tour = tours.find(t => t.id === p.tour_id);
                        return (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="font-medium text-gray-900">{p.name}</div>
                                {/* 그룹 인원수 뱃지 */}
                                {p.group_size > 1 && (
                                  <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                    +{p.group_size - 1}명
                                  </span>
                                )}
                              </div>
                              {/* 동반자 정보 */}
                              {p.companions && p.companions.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  동반자: {p.companions.join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {p.team_name ? (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {p.team_name}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tour ? (
                                <div>
                                  <div className="font-medium text-gray-900">{tour.title}</div>
                                  <div className="text-xs text-gray-500">{tour.start_date}~{tour.end_date}</div>
                                  {tour.price && (
                                    <div className="text-xs text-gray-500 mt-1">{tour.price.toLocaleString()}원</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {p.pickup_location ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  {p.pickup_location}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.room_type || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className={`font-medium ${p.join_count >= 5 ? 'text-amber-600' : 'text-gray-900'}`}>{p.join_count}회</span>
                                {p.join_count >= 5 && (
                                  <span className="ml-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">VIP</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors duration-200 ${p.is_confirmed ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                onClick={() => toggleConfirmation(p.id)}
                              >
                                {p.is_confirmed ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>확정</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3" />
                                    <span>미확정</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 mr-3" onClick={() => { setCurrentParticipant(p); setIsModalOpen(true); }}><Edit className="w-5 h-5" /></button>
                              <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(p.id)}><Trash2 className="w-5 h-5" /></button>
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
            <div className="mt-6 text-sm text-gray-700 bg-white p-4 rounded-lg shadow-md">
              <div className="font-bold text-gray-900 mb-3 border-b pb-2">참가자 현황 요약 ({selectedTour ? selectedTour.title : '전체'})</div>
              {selectedTour && (
                <div className="text-gray-600 text-sm mb-3">투어 기간: {selectedTour.start_date}~{selectedTour.end_date}</div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-semibold text-blue-800">총 참가자:</span> <span className="text-lg font-bold">{participants.length}</span>명
                </div>
                <div>
                  <span className="font-semibold text-green-700">확정:</span> <span className="text-lg font-bold">{participants.filter(p => p.is_confirmed).length}</span>명
                </div>
                <div>
                  <span className="font-semibold text-red-700">미확정:</span> <span className="text-lg font-bold">{participants.filter(p => !p.is_confirmed).length}</span>명
                </div>
                <div>
                  <span className="font-semibold text-amber-700">VIP (5회 이상):</span> <span className="text-lg font-bold">{participants.filter(p => p.join_count >= 5).length}</span>명
                </div>
              </div>
              {(selectedTour || searchTerm || activeTab !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-600">
                  현재 목록 (<span className="font-medium">{filteredParticipants.length}</span>명)
                  <span className="ml-4">확정: {filteredParticipants.filter(p => p.is_confirmed).length}명</span>
                  <span className="ml-4">미확정: {filteredParticipants.filter(p => !p.is_confirmed).length}명</span>
                </div>
              )}
            </div>
            {/* 참가자 추가/수정 모달 */}
            {isModalOpen && currentParticipant && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentParticipant.id ? '참가자 정보 수정' : '참가자 추가'}</h3>
                    <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
                  </div>
                  {errorMessage && (<div className="mb-4 bg-red-100 text-red-800 p-3 rounded-lg">{errorMessage}</div>)}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">이름 *</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.name} onChange={e => setCurrentParticipant({ ...currentParticipant, name: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">전화번호 *</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.phone} onChange={e => setCurrentParticipant({ ...currentParticipant, phone: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">이메일</label><input type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.email || ''} onChange={e => setCurrentParticipant({ ...currentParticipant, email: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">팀/동호회</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.team_name || ''} onChange={e => setCurrentParticipant({ ...currentParticipant, team_name: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">객실</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.room_type || ''} onChange={e => setCurrentParticipant({ ...currentParticipant, room_type: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">탑승지</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.pickup_location || ''} onChange={e => setCurrentParticipant({ ...currentParticipant, pickup_location: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">비상 연락처</label><input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.emergency_contact || ''} onChange={e => setCurrentParticipant({ ...currentParticipant, emergency_contact: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">참여 횟수</label><input type="number" min="0" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={currentParticipant.join_count || 0} onChange={e => setCurrentParticipant({ ...currentParticipant, join_count: parseInt(e.target.value) || 0 })} /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">참고사항</label><textarea className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" rows={3} value={currentParticipant.note || ''} onChange={e => setCurrentParticipant({ ...currentParticipant, note: e.target.value })}></textarea></div>
                    <div className="flex items-center"><input type="checkbox" id="is_confirmed" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={currentParticipant.is_confirmed || false} onChange={e => setCurrentParticipant({ ...currentParticipant, is_confirmed: e.target.checked })} /><label htmlFor="is_confirmed" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">확정 상태</label></div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" onClick={() => setIsModalOpen(false)}>취소</button>
                    <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleSave}>저장</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminParticipantsPage;
