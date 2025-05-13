'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchTourAndSchedules } from "./actions";
import ProductInfo from "@/components/ProductInfo";
import { Metadata } from "next";

export default function ProductInfoPage() {
  const params = useParams();
  const [data, setData] = useState<{ tour: any; schedules: any[] }>({ tour: null, schedules: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!params?.tourId) {
        setError('투어 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const result = await fetchTourAndSchedules(params.tourId as string);
        setData(result);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params?.tourId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="p-8 text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!data.tour) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="p-8 text-center text-red-500">투어 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <ProductInfo tour={data.tour} schedules={data.schedules || []} />
      </div>
    </div>
  );
} 