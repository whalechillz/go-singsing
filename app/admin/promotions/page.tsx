"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Megaphone, 
  Calendar, 
  Users, 
  ExternalLink,
  Edit,
  Plus,
  Eye,
  Copy,
  CheckCircle2
} from "lucide-react";

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  created_at: string;
}

export default function PromotionsPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("singsing_tours")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching tours:", error);
    } else {
      setTours(data || []);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTourStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { status: "upcoming", text: `${daysUntil}일 후 출발`, color: "blue" };
    } else if (now > end) {
      return { status: "completed", text: "종료됨", color: "gray" };
    } else {
      return { status: "ongoing", text: "진행중", color: "green" };
    }
  };

  const copyPromotionLink = async (tourId: string) => {
    const link = `${window.location.origin}/promo/${tourId}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(tourId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Megaphone className="w-7 h-7 text-purple-600" />
              홍보 페이지 관리
            </h1>
            <p className="text-gray-600 mt-1">
              각 투어의 홍보 페이지를 관리하고 공유 링크를 생성합니다
            </p>
          </div>
        </div>
      </div>

      {/* 투어 목록 */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">홍보 페이지 목록을 불러오는 중...</p>
          </div>
        </div>
      ) : tours.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">등록된 투어가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => {
            const tourStatus = getTourStatus(tour.start_date, tour.end_date);
            const statusColorMap = {
              blue: "bg-blue-100 text-blue-700 border-blue-200",
              green: "bg-green-100 text-green-700 border-green-200",
              gray: "bg-gray-100 text-gray-700 border-gray-200"
            };

            return (
              <div
                key={tour.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200"
              >
                {/* 카드 헤더 */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {tour.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColorMap[tourStatus.color as keyof typeof statusColorMap]}`}>
                      {tourStatus.text}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(tour.start_date)} ~ {formatDate(tour.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>최대 {tour.max_participants}명</span>
                    </div>
                  </div>
                </div>

                {/* 카드 액션 */}
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/tours/${tour.id}/promotion`)}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      편집
                    </button>
                    
                    <button
                      onClick={() => window.open(`/promo/${tour.id}`, '_blank')}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      미리보기
                    </button>

                    <button
                      onClick={() => copyPromotionLink(tour.id)}
                      className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      title="링크 복사"
                    >
                      {copiedId === tour.id ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* 홍보 링크 */}
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">홍보 페이지 링크</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-blue-600 break-all flex-1">
                        {window.location.origin}/promo/{tour.id}
                      </code>
                      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-2">홍보 페이지 활용 방법</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span>각 투어별로 고유한 홍보 페이지가 생성됩니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span>편집 버튼을 눌러 홍보 페이지의 내용을 수정할 수 있습니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span>링크를 복사하여 카카오톡, 문자, 이메일 등으로 고객에게 전달하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span>미리보기로 고객이 보게 될 실제 페이지를 확인할 수 있습니다</span>
          </li>
        </ul>
      </div>
    </div>
  );
}