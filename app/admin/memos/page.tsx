"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MemoList from "@/components/memo/MemoList";
import { MessageSquare, Filter, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface Tour {
  id: string;
  title: string;
}

export default function MemosPage() {
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    const { data } = await supabase
      .from("singsing_tours")
      .select("id, title")
      .order("start_date", { ascending: false });
    
    if (data) {
      setTours(data);
    }
  };

  const handleExport = async () => {
    // 필터 조건에 맞는 메모 조회
    let query = supabase
      .from('singsing_memos')
      .select(`
        *,
        participant:participant_id(name, phone),
        tour:tour_id(title, start_date)
      `)
      .order('created_at', { ascending: false });

    if (selectedTour) query = query.eq('tour_id', selectedTour);
    if (selectedStatus) query = query.eq('status', selectedStatus);
    if (selectedPriority) query = query.eq('priority', parseInt(selectedPriority));
    if (selectedCategory) query = query.eq('category', selectedCategory);

    const { data } = await query;

    if (data && data.length > 0) {
      // 엑셀 데이터 준비
      const exportData = data.map(memo => ({
        "투어": memo.tour?.title || "-",
        "참가자": memo.participant?.name || "-",
        "연락처": memo.participant?.phone || "-",
        "카테고리": memo.category,
        "우선순위": memo.priority === 2 ? "긴급" : memo.priority === 1 ? "중요" : "보통",
        "상태": memo.status === 'resolved' ? "완료" : memo.status === 'follow_up' ? "후속조치" : "대기",
        "내용": memo.content,
        "작성일": new Date(memo.created_at).toLocaleString('ko-KR'),
        "작성자": memo.created_by || "-",
        "처리일": memo.resolved_at ? new Date(memo.resolved_at).toLocaleString('ko-KR') : "-",
        "처리자": memo.resolved_by || "-"
      }));

      // 엑셀 생성
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "메모목록");

      // 파일명 생성
      const today = new Date().toISOString().split('T')[0];
      const filename = `메모목록_${today}.xlsx`;
      
      XLSX.writeFile(wb, filename);
    } else {
      alert("내보낼 메모가 없습니다.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          메모 관리
        </h1>
        <p className="text-gray-600 mt-2">
          모든 참가자의 메모를 확인하고 관리합니다.
        </p>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium">필터</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 투어 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              투어
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTour}
              onChange={(e) => {
                setSelectedTour(e.target.value);
                setRefresh(r => r + 1);
              }}
            >
              <option value="">전체 투어</option>
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setRefresh(r => r + 1);
              }}
            >
              <option value="">전체 카테고리</option>
              <option value="urgent">긴급</option>
              <option value="payment">결제</option>
              <option value="boarding">탑승</option>
              <option value="request">요청</option>
              <option value="general">일반</option>
            </select>
          </div>

          {/* 우선순위 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              우선순위
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setRefresh(r => r + 1);
              }}
            >
              <option value="">전체</option>
              <option value="2">긴급</option>
              <option value="1">중요</option>
              <option value="0">보통</option>
            </select>
          </div>

          {/* 상태 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setRefresh(r => r + 1);
              }}
            >
              <option value="">전체 상태</option>
              <option value="pending">대기</option>
              <option value="follow_up">후속조치</option>
              <option value="resolved">완료</option>
            </select>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              엑셀 내보내기
            </button>
          </div>
        </div>
      </div>

      {/* 메모 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <MemoList 
          key={refresh}
          tourId={selectedTour || undefined}
          status={selectedStatus || undefined}
          priority={selectedPriority ? parseInt(selectedPriority) : undefined}
          limit={50}
        />
      </div>
    </div>
  );
}
