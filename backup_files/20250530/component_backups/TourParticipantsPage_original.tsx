"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Users, UserPlus, Edit, Trash2, Mail, Phone } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: 'male' | 'female';
  group_name?: string;
  team_number?: number;
  payment_status?: string;
  created_at: string;
};

type Tour = {
  id: string;
  title: string;
  date: string;
  max_participants?: number;
  current_participants?: number;
};

export default function TourParticipantsPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTourAndParticipants();
  }, [tourId]);

  const fetchTourAndParticipants = async () => {
    try {
      setLoading(true);
      
      // 투어 정보 가져오기 (singsing_tours가 실제 투어)
      const { data: tourData, error: tourError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", tourId)
        .single();
        
      if (tourError) throw tourError;
      
      // 참가자 목록 가져오기
      const { data: participantsData, error: participantsError } = await supabase
        .from("singsing_participants")
        .select(`
          *,
          singsing_payments(payment_status)
        `)
        .eq("tour_id", tourId)
        .order("created_at", { ascending: false });
        
      if (participantsError) throw participantsError;
      
      // 참가자 수 계산
      const participantCount = participantsData?.length || 0;
      
      setTour({
        ...tourData,
        current_participants: participantCount,
        max_participants: tourData.max_participants || 40
      });
      
      setParticipants(participantsData?.map(p => ({
        ...p,
        payment_status: p.singsing_payments?.[0]?.payment_status || 'pending'
      })) || []);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!window.confirm("정말 이 참가자를 삭제하시겠습니까?")) return;
    
    try {
      const { error } = await supabase
        .from("singsing_participants")
        .delete()
        .eq("id", participantId);
        
      if (error) throw error;
      
      // 목록 새로고침
      fetchTourAndParticipants();
    } catch (error: any) {
      alert("삭제 실패: " + error.message);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">결제완료</span>;
      case 'partial':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">부분결제</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">대기중</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (loading) return <div className="p-8">로딩중...</div>;
  if (error) return <div className="p-8 text-red-500">에러: {error}</div>;
  if (!tour) return <div className="p-8">투어를 찾을 수 없습니다.</div>;

  return (
    <div className="p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{tour.title}</h1>
          <p className="text-gray-500">참가자 관리</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          참가자 추가
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">총 참가자</p>
              <p className="text-2xl font-bold">
                {tour.current_participants || 0} / {tour.max_participants || 40}명
              </p>
              <p className="text-xs text-gray-500">
                {((tour.current_participants || 0) / (tour.max_participants || 40) * 100).toFixed(0)}% 예약됨
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">결제 완료</p>
              <p className="text-2xl font-bold">
                {participants.filter(p => p.payment_status === 'completed').length}명
              </p>
              <p className="text-xs text-gray-500">
                전체의 {((participants.filter(p => p.payment_status === 'completed').length / participants.length) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">그룹/팀 현황</p>
              <p className="text-2xl font-bold">
                {new Set(participants.map(p => p.group_name).filter(Boolean)).size}개 그룹
              </p>
              <p className="text-xs text-gray-500">
                {new Set(participants.map(p => p.team_number).filter(Boolean)).size}개 팀
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 참가자 테이블 */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold">참가자 목록</h2>
          <p className="text-sm text-gray-500 mt-1">
            총 {participants.length}명의 참가자가 등록되어 있습니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-t border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">그룹</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">팀</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성별</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {participant.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participant.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {participant.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.group_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.team_number || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participant.gender === 'male' ? '남' : participant.gender === 'female' ? '여' : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPaymentStatusBadge(participant.payment_status!)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(participant.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => handleDeleteParticipant(participant.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}