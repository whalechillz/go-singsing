"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Tour = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  driver_name: string;
};

const TourListPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("singsing_tours").select("*").order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setTours(data as Tour[]);
      setLoading(false);
    };
    fetchTours();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_tours").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
      return;
    }
    setTours((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">투어 관리</h1>
        <div className="flex gap-2">
          {/* <Link href="/admin/boarding-places" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700" aria-label="탑승지 관리">탑승지 관리</Link> */}
          <Link href="/admin/tours/new" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700" aria-label="투어 생성">+ 투어 생성</Link>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">불러오는 중...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-2 px-4 text-left">제목</th>
              <th className="py-2 px-4 text-left">날짜</th>
              <th className="py-2 px-4 text-left">기사님</th>
              <th className="py-2 px-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr key={tour.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-2 px-4 dark:text-gray-100">
                  <Link href={`/admin/tours/${tour.id}`} className="underline text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
                    {tour.title}
                  </Link>
                </td>
                <td className="py-2 px-4 dark:text-gray-100">{tour.start_date} ~ {tour.end_date}</td>
                <td className="py-2 px-4 dark:text-gray-100">{tour.driver_name}</td>
                <td className="py-2 px-4 flex gap-2">
                  <Link href={`/admin/tours/${tour.id}/edit`} className="text-blue-800 dark:text-blue-400 underline hover:text-blue-600 focus:text-blue-600 dark:hover:text-blue-300 dark:focus:text-blue-300" aria-label="수정">수정</Link>
                  <button className="text-red-600 dark:text-red-400 underline hover:text-red-400 focus:text-red-400" aria-label="삭제" onClick={() => handleDelete(tour.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TourListPage; 