"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

type Product = {
  id: string;
  name: string;
};

const ProductToursPage: React.FC = () => {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchProductAndTours = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 상품 정보 가져오기
      const { data: productData, error: productError } = await supabase
        .from("tour_products")
        .select("id, name")
        .eq("id", productId)
        .single();
        
      if (productError) throw productError;
      setProduct(productData);
      
      // 해당 상품의 투어만 가져오기
      const { data: toursData, error: toursError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("tour_product_id", productId)
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
              golf_course: tour.golf_course,
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
    if (productId) {
      fetchProductAndTours();
    }
  }, [productId]);

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
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              {product ? `${product.name} 투어 일정` : '투어 일정'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              이 상품으로 생성된 투어 목록
            </p>
          </div>
          <a
            href="/admin/tour-products"
            className="text-blue-600 hover:text-blue-800"
          >
            ← 상품 목록으로
          </a>
        </div>
      </div>

      {/* 투어 목록 */}
      <TourListSimple
        tours={tours}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProductToursPage;