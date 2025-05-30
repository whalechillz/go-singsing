"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductListSimple from "@/components/admin/products/ProductListSimple";

// 상품 타입
interface TourProduct {
  id: string;
  name: string;
  golf_course?: string;
  hotel?: string;
}

const TourProductsPage = () => {
  const [products, setProducts] = useState<TourProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("tour_products")
        .select("id, name, golf_course, hotel")
        .order("created_at", { ascending: false });
        
      if (productsError) throw productsError;
      
      setProducts(productsData || []);
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

  return (
    <ProductListSimple
      products={products}
      loading={loading}
      error={error}
      onDelete={handleDelete}
    />
  );
};

export default TourProductsPage;