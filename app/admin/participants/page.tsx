"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Participant {
  id: string;
  name: string;
  phone?: string;
  gender?: string;
  tour_id: string;
  created_at: string;
  tour?: {
    title: string;
    start_date: string;
    end_date: string;
  };
}

export default function AllParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTourId, setFilterTourId] = useState("");
  const [tours, setTours] = useState<any[]>([]);

  useEffect(() => {
    fetchParticipants();
    fetchTours();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      // 모든 참가자와 투어 정보를 조인하여 가져오기
      const { data, error } = await supabase
        .from('singsing_participants')
        .select(`
          *,
          tour:singsing_tours (
            title,
            start_date,
            end_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    const { data } = await supabase
      .from('singsing_tours')
      .select('id, title, start_date, end_date')
      .order('start_date', { ascending: false });
    
    setTours(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    const { error } = await supabase
      .from('singsing_participants')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('삭제 실패: ' + error.message);
      return;
    }
    
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // 필터링된 참가자 목록
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (participant.phone && participant.phone.includes(searchTerm));
    const matchesTour = !filterTourId || participant.tour_id === filterTourId;
    return matchesSearch && matchesTour;
  });

  // 통계 계산
  const stats = {
    total: filteredParticipants.length,
    male: filteredParticipants.filter(p => p.gender === '남').length,
    female: filteredParticipants.filter(p => p.gender === '여').length,
  };

  if (loading) {
    return <div className="text-center py-8">불러오는 중...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">전체 참가자 관리</h1>
        
        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">전체 참가자</div>
            <div className="text-2xl font-bold">{stats.total}명</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">남성</div>
            <div className="text-2xl font-bold text-blue-600">{stats.male}명</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">여성</div>
            <div className="text-2xl font-bold text-pink-600">{stats.female}명</div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="이름 또는 전화번호로 검색"
            className="flex-1 px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterTourId}
            onChange={(e) => setFilterTourId(e.target.value)}
          >
            <option value="">모든 투어</option>
            {tours.map(tour => (
              <option key={tour.id} value={tour.id}>
                {tour.title} ({new Date(tour.start_date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 참가자 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">이름</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">성별</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">전화번호</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">투어</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">등록일</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredParticipants.map(participant => (
              <tr key={participant.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{participant.name}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    participant.gender === '남' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {participant.gender || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {participant.phone || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    {participant.tour?.title || '-'}
                    {participant.tour && (
                      <div className="text-xs text-gray-500">
                        {new Date(participant.tour.start_date).toLocaleDateString()} ~ 
                        {new Date(participant.tour.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(participant.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(participant.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredParticipants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            참가자가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}