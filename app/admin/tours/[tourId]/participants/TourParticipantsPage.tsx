"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      
      // 투어 정보 가져오기 (schedules가 실제 투어)
      const { data: tourData, error: tourError } = await supabase
        .from("singsing_schedules")
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
        return <Badge className="bg-green-500">결제완료</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">부분결제</Badge>;
      case 'pending':
        return <Badge variant="outline">대기중</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          참가자 추가
        </Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              총 참가자
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tour.current_participants || 0} / {tour.max_participants || 40}명
            </div>
            <p className="text-xs text-muted-foreground">
              {((tour.current_participants || 0) / (tour.max_participants || 40) * 100).toFixed(0)}% 예약됨
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              결제 완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {participants.filter(p => p.payment_status === 'completed').length}명
            </div>
            <p className="text-xs text-muted-foreground">
              전체의 {((participants.filter(p => p.payment_status === 'completed').length / participants.length) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              그룹/팀 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(participants.map(p => p.group_name).filter(Boolean)).size}개 그룹
            </div>
            <p className="text-xs text-muted-foreground">
              {new Set(participants.map(p => p.team_number).filter(Boolean)).size}개 팀
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 참가자 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>참가자 목록</CardTitle>
          <CardDescription>
            총 {participants.length}명의 참가자가 등록되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>그룹</TableHead>
                <TableHead>팀</TableHead>
                <TableHead>성별</TableHead>
                <TableHead>결제상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {participant.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {participant.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {participant.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{participant.group_name || '-'}</TableCell>
                  <TableCell>{participant.team_number || '-'}</TableCell>
                  <TableCell>
                    {participant.gender === 'male' ? '남' : participant.gender === 'female' ? '여' : '-'}
                  </TableCell>
                  <TableCell>{getPaymentStatusBadge(participant.payment_status!)}</TableCell>
                  <TableCell>{new Date(participant.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteParticipant(participant.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}