"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourListEnhanced from "@/components/admin/tours/TourListEnhanced";

type Tour = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  driver_name: string;
  price: number;
  max_participants: number;
  current_participants?: number;
  is_closed?: boolean;
  closed_reason?: string;
  closed_at?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  golf_course?: string;
  departure_location?: string;
  tour_product_id?: string;
};

const TourListPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchTours = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 투어 기본 정보 가져오기 (견적서는 제외)
      const { data: toursData, error: toursError } = await supabase
        .from("singsing_tours")
        .select("*")
        .is('quote_data', null)  // quote_data가 null인 것만 (정식 투어)
        .order("start_date", { ascending: false });
      
      if (toursError) throw toursError;
      
      // tour_products 정보 가져오기
      const { data: productsData } = await supabase
        .from("tour_products")
        .select("id, name, golf_course");
      
      const productsMap = new Map(productsData?.map(p => [p.id, p]) || []);
      
      // 각 투어의 참가자 수 계산
      if (toursData) {
        const toursWithParticipants = await Promise.all(
          toursData.map(async (tour) => {
            // 참가자 데이터와 group_size 가져오기
            const { data: participantsData } = await supabase
              .from("singsing_participants")
              .select("group_size")
              .eq("tour_id", tour.id);
            
            // 실제 참가자 수 = 각 참가자의 group_size 합곀4
            let totalParticipants = 0;
            if (participantsData) {
              totalParticipants = participantsData.reduce((sum, p) => {
                return sum + (p.group_size || 1);
              }, 0);
            }
            
            const product = tour.tour_product_id ? productsMap.get(tour.tour_product_id) : null;
            
            return {
              ...tour,
              golf_course: product?.golf_course || product?.name || "",
              current_participants: totalParticipants, // 그룹 인원수를 고려한 총 인원
              max_participants: tour.max_participants || 40, // 기본값 40명
              price: tour.price || 0
            };
          })
        );
        
        setTours(toursWithParticipants);
      }
    } catch (error: any) {
      setError(error.message || "투어 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    
    try {
      // 관련 참가자가 있는지 확인
      const { data: participantsData } = await supabase
        .from("singsing_participants")
        .select("group_size")
        .eq("tour_id", id);
      
      // 실제 참가 인원수 계산
      let totalParticipants = 0;
      if (participantsData) {
        totalParticipants = participantsData.reduce((sum, p) => {
          return sum + (p.group_size || 1);
        }, 0);
      }
      
      if (totalParticipants > 0) {
        if (!window.confirm(`이 투어에는 ${totalParticipants}명의 참가자가 등록되어 있습니다. 정말 삭제하시겠습니까?`)) {
          return;
        }
      }
      
      const { error } = await supabase
        .from("singsing_tours")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setTours((prev) => prev.filter((t) => t.id !== id));
      
      // 성공 메시지 표시
      alert("투어가 삭제되었습니다.");
      
    } catch (error: any) {
      alert("삭제 실패: " + error.message);
    }
  };
  
  const handleToggleClosed = async (tour: Tour) => {
    try {
      const newClosedStatus = !tour.is_closed;
      const updateData: any = {
        is_closed: newClosedStatus,
        closed_at: newClosedStatus ? new Date().toISOString() : null,
        closed_reason: newClosedStatus ? (
          tour.closed_reason || 
          ((tour.current_participants || 0) >= (tour.max_participants || 0) ? '조기 마감' : '마감')
        ) : null
      };
      
      const { error } = await supabase
        .from("singsing_tours")
        .update(updateData)
        .eq("id", tour.id);
        
      if (error) throw error;
      
      // 로컬 상태 업데이트
      setTours(prev => prev.map(t => 
        t.id === tour.id 
          ? { ...t, ...updateData }
          : t
      ));
      
      alert(newClosedStatus ? '투어가 마감되었습니다.' : '투어 마감이 해제되었습니다.');
      
    } catch (error: any) {
      alert('마감 설정 실패: ' + error.message);
    }
  };

  const handleRefresh = () => {
    fetchTours();
  };

  return (
    <TourListEnhanced
      tours={tours}
      loading={loading}
      error={error}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      onToggleClosed={handleToggleClosed}
    />
  );
};

export default TourListPage;