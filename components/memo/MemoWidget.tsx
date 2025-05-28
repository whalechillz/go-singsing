"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AlertCircle, MessageSquare, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import MemoList from "@/components/memo/MemoList";

export default function MemoWidget() {
  const [stats, setStats] = useState({
    urgent: 0,
    pending: 0,
    today: 0,
    total: 0
  });
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // 전체 메모 통계
    const { data } = await supabase
      .from('singsing_memos')
      .select('id, priority, status, created_at');

    if (data) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setStats({
        urgent: data.filter(m => m.priority === 2 && m.status !== 'resolved').length,
        pending: data.filter(m => m.status === 'pending').length,
        today: data.filter(m => new Date(m.created_at) >= today).length,
        total: data.length
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            메모 현황
          </h3>
          <button
            onClick={() => setShowList(!showList)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showList ? '접기' : '펼치기'}
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <AlertCircle className="w-4 h-4 text-red-600 mr-1" />
            <span className="text-2xl font-bold text-red-600">{stats.urgent}</span>
          </div>
          <p className="text-xs text-gray-600">긴급 처리</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-2xl font-bold text-orange-600">{stats.pending}</span>
          </div>
          <p className="text-xs text-gray-600">대기 중</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-2xl font-bold text-blue-600">{stats.today}</span>
          </div>
          <p className="text-xs text-gray-600">오늘 등록</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <MessageSquare className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-2xl font-bold text-gray-600">{stats.total}</span>
          </div>
          <p className="text-xs text-gray-600">전체 메모</p>
        </div>
      </div>

      {/* 긴급 메모 알림 */}
      {stats.urgent > 0 && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            🚨 긴급 처리가 필요한 메모가 {stats.urgent}건 있습니다!
          </p>
        </div>
      )}

      {/* 최근 메모 리스트 */}
      {showList && (
        <div className="border-t border-gray-200">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">최근 메모</h4>
            <MemoList limit={5} showActions={false} />
            
            <div className="mt-4 text-center">
              <Link 
                href="/admin/memos"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                전체 메모 보기 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
