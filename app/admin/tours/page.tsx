"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourListSimple from "@/components/admin/tours/TourListSimple";

type Tour = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  golf_course?: string;
  current_participants?: number;
  max_participants?: number;
};

const TourListPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchTours = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 투어 기본 정보와 상품 정보 조인해서 가져오기
      const { data: toursData, error: toursError } = await supabase
        .from("singsing_tours")
        .select(`
          *,
          tour_products (
            golf_course
          )
        `)
        .order("start_date", { ascending: false });
      
      if (toursError) throw toursError;
      
      // 각 투어의 참가자 수 계산
      if (toursData) {
        const toursWithParticipants = await Promise.all(
          toursData.map(async (tour) => {
            const { count } = await supabase
              .from("singsing_participants")
              .select("*", { count: 'exact', head: true })
              .eq("tour_id", tour.id);
            
            return {
              id: tour.id,
              title: tour.title,
              start_date: tour.start_date,
              end_date: tour.end_date,
              golf_course: tour.tour_products?.golf_course || tour.golf_course,
              current_participants: count || 0,
              max_participants: tour.max_participants || 40
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
      const { count } = await supabase
        .from("singsing_participants")
        .select("*", { count: 'exact', head: true })
        .eq("tour_id", id);
      
      if (count && count > 0) {
        if (!window.confirm(`이 투어에는 ${count}명의 참가자가 등록되어 있습니다. 정말 삭제하시겠습니까?`)) {
          return;
        }
      }
      
      const { error } = await supabase
        .from("singsing_tours")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setTours((prev) => prev.filter((t) => t.id !== id));
      alert("투어가 삭제되었습니다.");
      
    } catch (error: any) {
      alert("삭제 실패: " + error.message);
    }
  };

  return (
    <TourListSimple
      tours={tours}
      loading={loading}
      error={error}
      onDelete={handleDelete}
    />
  );
};

export default TourListPage;