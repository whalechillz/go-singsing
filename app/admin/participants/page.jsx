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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-2xl font-bold">싱싱골프투어 참가자 관리 (관리자/스탭 전용)</h1>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {isLoading ? (
          <div className="text-center py-10">데이터를 불러오는 중...</div>
        ) : (
          <>
            {/* 상단 컨트롤 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <select className="border rounded-lg px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" onChange={e => setSelectedTour(tours.find(t => t.id === e.target.value) || null)} value={selectedTour?.id || ''}>
                    <option value="">전체 투어</option>
                    {tours.map(tour => <option key={tour.id} value={tour.id}>{tour.title}</option>)}
                  </select>
                  <input type="text" placeholder="이름, 전화번호, 팀 검색..." className="border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <button className="bg-blue-700 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-800 transition-colors" onClick={() => { setCurrentParticipant({ id: null, name: '', phone: '', email: '', team_name: '', tour_id: selectedTour?.id || '', room_type: '', pickup_location: '', is_confirmed: false, note: '', emergency_contact: '', join_count: 0 }); setIsModalOpen(true); }}>+ 참가자 추가</button>
              </div>
              {/* 탭 필터 */}
              <div className="flex gap-2 mb-4">
                <button className={`px-4 py-1 rounded-full font-medium ${activeTab === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`} onClick={() => setActiveTab('all')}>전체 ({participants.length})</button>
                <button className={`px-4 py-1 rounded-full font-medium ${activeTab === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`} onClick={() => setActiveTab('confirmed')}>확정 ({participants.filter(p => p.is_confirmed).length})</button>
                <button className={`px-4 py-1 rounded-full font-medium ${activeTab === 'unconfirmed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`} onClick={() => setActiveTab('unconfirmed')}>미확정 ({participants.filter(p => !p.is_confirmed).length})</button>
                <button className={`px-4 py-1 rounded-full font-medium ${activeTab === 'vip' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`} onClick={() => setActiveTab('vip')}>VIP ({participants.filter(p => p.join_count >= 5).length})</button>
              </div>
            </div>
            {/* 테이블 */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
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
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredParticipants.length === 0 ? (
                      <tr><td colSpan="9" className="py-6 text-center text-gray-400">참가자가 없습니다.</td></tr>
                    ) : (
                      filteredParticipants.map((p) => {
                        const tour = tours.find(t => t.id === p.tour_id);
                        return (
                          <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{p.name}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-200">{p.phone}</td>
                            <td className="px-6 py-4">{p.team_name ? <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{p.team_name}</span> : '-'}</td>
                            <td className="px-6 py-4">{tour?.title || '-'}</td>
                            <td className="px-6 py-4">{p.pickup_location ? <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{p.pickup_location}</span> : '-'}</td>
                            <td className="px-6 py-4">{p.room_type ? <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">{p.room_type}</span> : '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`font-semibold ${p.join_count >= 5 ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'}`}>{p.join_count}회</span>
                              {p.join_count >= 5 && <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">VIP</span>}
                            </td>
                            <td className="px-6 py-4">
                              <button className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${p.is_confirmed ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`} onClick={() => toggleConfirmation(p.id)}>{p.is_confirmed ? (<><Check className="w-3 h-3" /><span>확정</span></>) : (<><X className="w-3 h-3" /><span>미확정</span></>)}</button>
                            </td>
                            <td className="px-6 py-4 text-right text-sm">
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
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 text-sm">
              <div className="flex-1"><span className="font-bold text-blue-700 dark:text-blue-300">총 참가자:</span> {participants.length}명</div>
              <div className="flex-1"><span className="font-bold text-green-700 dark:text-green-300">확정:</span> {participants.filter(p => p.is_confirmed).length}명</div>
              <div className="flex-1"><span className="font-bold text-red-700 dark:text-red-300">미확정:</span> {participants.filter(p => !p.is_confirmed).length}명</div>
              <div className="flex-1"><span className="font-bold text-amber-700 dark:text-amber-300">VIP (5회 이상):</span> {participants.filter(p => p.join_count >= 5).length}명</div>
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
