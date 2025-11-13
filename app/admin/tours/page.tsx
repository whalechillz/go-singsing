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
  actual_revenue?: number; // 실제 결제 금액
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
        .order("start_date", { ascending: true }); // 출발일 기준 오름차순 (가까운 날짜부터)
      
      if (toursError) throw toursError;
      
      // tour_products 정보 가져오기
      const { data: productsData } = await supabase
        .from("tour_products")
        .select("id, name, golf_course");
      
      const productsMap = new Map(productsData?.map(p => [p.id, p]) || []);
      
      // 각 투어의 참가자 수와 실제 결제 금액 계산
      if (toursData) {
        const toursWithoutProduct: any[] = []; // 상품명이 없는 투어 목록
        
        const toursWithParticipants = await Promise.all(
          toursData.map(async (tour) => {
            // 참가자 수 계산 (각 참가자는 1명으로 계산)
            const { count: participantCount } = await supabase
              .from("singsing_participants")
              .select("id", { count: 'exact', head: true })
              .eq("tour_id", tour.id);
            
            const totalParticipants = participantCount || 0;
            
            // 실제 결제 금액 계산
            const { data: paymentsData } = await supabase
              .from("singsing_payments")
              .select("amount, payment_status")
              .eq("tour_id", tour.id)
              .in("payment_status", ["completed", "pending"]); // 완료된 결제와 대기중인 결제만
            
            let totalRevenue = 0;
            if (paymentsData) {
              totalRevenue = paymentsData.reduce((sum, p) => {
                return sum + (p.amount || 0);
              }, 0);
            }
            
            const product = tour.tour_product_id ? productsMap.get(tour.tour_product_id) : null;
            const productName = product?.name || "";
            
            // 상품명이 없는 투어 확인
            if (!productName) {
              toursWithoutProduct.push({
                id: tour.id,
                title: tour.title,
                tour_product_id: tour.tour_product_id,
                start_date: tour.start_date,
                reason: tour.tour_product_id ? '상품이 삭제되었거나 존재하지 않음' : '상품 미지정'
              });
            }
            
            return {
              ...tour,
              golf_course: product?.golf_course || product?.name || "",
              product_name: productName, // 상품명 추가
              current_participants: totalParticipants, // 실제 참가자 수 (레코드 수)
              max_participants: tour.max_participants || 40, // 기본값 40명
              price: tour.price || 0,
              actual_revenue: totalRevenue // 실제 결제 금액 추가
            };
          })
        );
        
        // 상품명이 없는 투어가 있으면 콘솔에 출력
        if (toursWithoutProduct.length > 0) {
          console.warn('⚠️ 상품명이 없는 투어:', toursWithoutProduct);
          console.table(toursWithoutProduct);
        }
        
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
      // 관련 참가자가 있는지 확인 (레코드 수)
      const { count: participantCount } = await supabase
        .from("singsing_participants")
        .select("id", { count: 'exact', head: true })
        .eq("tour_id", id);
      
      const totalParticipants = participantCount || 0;
      
      if (totalParticipants > 0) {
        if (!window.confirm(`이 투어에는 ${totalParticipants}명의 참가자가 등록되어 있습니다. 정말 삭제하시겠습니까?`)) {
          return;
        }
      }
      
      // 관련 테이블 먼저 삭제 (CASCADE가 작동하지 않는 경우 대비)
      const relatedTables = [
        'marketing_contents',
        'tour_promotion_pages',
        'tour_attraction_options',
        'public_document_links',
        'document_send_history',
        'message_history'
      ];
      
      for (const table of relatedTables) {
        try {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq("tour_id", id);
          
          // 에러가 발생해도 계속 진행 (이미 삭제되었거나 없는 경우)
          if (error && !error.message.includes('does not exist') && !error.message.includes('relation') && !error.message.includes('permission')) {
            console.warn(`Failed to delete from ${table}:`, error.message);
          }
        } catch (tableError: any) {
          // 테이블이 존재하지 않거나 권한이 없는 경우 무시
          console.warn(`Error deleting from ${table}:`, tableError.message);
        }
      }
      
      // 스케줄 삭제 (투어 삭제 전)
      try {
        const { error: scheduleError } = await supabase
          .from("singsing_schedules")
          .delete()
          .eq("tour_id", id);
        
        if (scheduleError && !scheduleError.message.includes('does not exist') && !scheduleError.message.includes('relation')) {
          console.warn('Failed to delete schedules:', scheduleError.message);
        }
      } catch (scheduleError: any) {
        console.warn('Error deleting schedules:', scheduleError.message);
      }
      
      // 마지막으로 투어 삭제
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
      
      alert(newClosedStatus ? '모객 마감이 설정되었습니다.' : '모객 마감이 해제되었습니다.');
      
    } catch (error: any) {
      alert('마감 설정 실패: ' + error.message);
    }
  };

  const handleMarkCompleted = async (tour: Tour) => {
    if (!window.confirm('이 투어를 완료 처리하시겠습니까?\n\n완료 처리된 투어는 "완료된 투어" 탭으로 이동합니다.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from("singsing_tours")
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq("id", tour.id);
        
      if (error) throw error;
      
      // 로컬 상태 업데이트
      setTours(prev => prev.map(t => 
        t.id === tour.id 
          ? { ...t, status: 'completed' as const }
          : t
      ));
      
      alert('투어가 완료 처리되었습니다.');
      
      // 목록 새로고침
      await fetchTours();
      
    } catch (error: any) {
      alert('완료 처리 실패: ' + error.message);
    }
  };

  const handleUnmarkCompleted = async (tour: Tour) => {
    if (!window.confirm('이 투어의 완료 처리를 해제하시겠습니까?\n\n투어가 "현재/예정 투어" 탭으로 이동합니다.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from("singsing_tours")
        .update({
          status: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", tour.id);
        
      if (error) throw error;
      
      // 로컬 상태 업데이트
      setTours(prev => prev.map(t => 
        t.id === tour.id 
          ? { ...t, status: undefined }
          : t
      ));
      
      alert('완료 처리가 해제되었습니다.');
      
      // 목록 새로고침
      await fetchTours();
      
    } catch (error: any) {
      alert('완료 처리 해제 실패: ' + error.message);
    }
  };

  const handleRefresh = async () => {
    await fetchTours();
  };

  return (
    <TourListEnhanced
      tours={tours}
      loading={loading}
      error={error}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      onToggleClosed={handleToggleClosed}
      onMarkCompleted={handleMarkCompleted}
      onUnmarkCompleted={handleUnmarkCompleted}
    />
  );
};

export default TourListPage;