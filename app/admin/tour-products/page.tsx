"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductListEnhanced from "@/components/admin/products/ProductListEnhanced";

// 확장된 상품 타입
interface TourProduct {
  id: string;
  name: string;
  description?: string;
  golf_course?: string;
  hotel?: string;
  date?: string;
  price?: number;
  duration?: string;
  min_participants?: number;
  max_participants?: number;
  image_urls?: string[];
  thumbnail_url?: string;
  rating?: number;
  total_bookings?: number;
  is_active?: boolean;
  category?: string;
  tags?: string[];
  included_items?: any;
  excluded_items?: any;
  itinerary?: any;
  cancellation_policy?: string;
  special_notes?: string;
  created_at?: string;
  updated_at?: string;
}

const TourProductsPage = () => {
  const [products, setProducts] = useState<TourProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 모든 필요한 필드를 가져옴
      const { data: productsData, error: productsError } = await supabase
        .from("tour_products")
        .select(`
          id,
          name,
          description,
          golf_course,
          hotel,
          date,
          price,
          duration,
          min_participants,
          max_participants,
          image_urls,
          thumbnail_url,
          rating,
          total_bookings,
          is_active,
          category,
          tags,
          included_items,
          excluded_items,
          itinerary,
          cancellation_policy,
          special_notes,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });
        
      if (productsError) throw productsError;
      
      // 이미지 URL 처리 (thumbnail_url 또는 image_urls[0] 사용)
      const processedProducts = (productsData || []).map(product => ({
        ...product,
        image_url: product.thumbnail_url || (product.image_urls && product.image_urls[0]) || null
      }));
      
      setProducts(processedProducts);
    } catch (error: any) {
      setError(error.message || "상품 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    
    try {
      const { error } = await supabase
        .from("tour_products")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("상품이 삭제되었습니다.");
      
    } catch (error: any) {
      alert("삭제 실패: " + error.message);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  return (
    <ProductListEnhanced
      products={products}
      loading={loading}
      error={error}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
    />
  );
};

export default TourProductsPage;