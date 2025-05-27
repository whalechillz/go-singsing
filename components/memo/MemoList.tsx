"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Check, Clock, MoreVertical } from "lucide-react";
import { Memo, MEMO_CATEGORIES, MEMO_STATUS } from "@/@types/memo";

interface MemoListProps {
  participantId?: string;
  tourId?: string;
  limit?: number;
  showActions?: boolean;
}

export default function MemoList({ participantId, tourId, limit, showActions = true }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemos();
  }, [participantId, tourId]);

  const fetchMemos = async () => {
    let query = supabase
      .from('singsing_memos')
      .select(`
        *,
        participant:singsing_participants!participant_id(name, phone),
        tour:singsing_tours!tour_id(title, start_date)
      `)
      .order('created_at', { ascending: false });

    if (participantId) query = query.eq('participant_id', participantId);
    if (tourId) query = query.eq('tour_id', tourId);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    
    if (data && !error) {
      setMemos(data as any);
    }
    setLoading(false);
  };

  const updateMemoStatus = async (memoId: string, status: Memo['status']) => {
    const updates: any = { status };
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = '관리자'; // TODO: 실제 사용자 정보
    }

    const { error } = await supabase
      .from('singsing_memos')
      .update(updates)
      .eq('id', memoId);

    if (!error) {
      fetchMemos();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-20 rounded"></div>;
  }

  if (memos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>등록된 메모가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {memos.map((memo) => {
        const category = MEMO_CATEGORIES[memo.category];
        const status = MEMO_STATUS[memo.status];
        
        return (
          <div 
            key={memo.id}
            className={`
              p-3 rounded-lg border transition-all
              ${memo.priority === 2 ? 'border-red-300 bg-red-50' : 
                memo.priority === 1 ? 'border-yellow-300 bg-yellow-50' : 
                'border-gray-200 bg-white'}
              ${memo.status === 'resolved' ? 'opacity-60' : ''}
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* 헤더 */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded text-xs font-medium
                    ${category.bgColor} ${category.textColor}
                  `}>
                    {category.icon} {category.label}
                  </span>
                  
                  {memo.priority === 2 && (
                    <span className="text-xs font-medium text-red-600">긴급</span>
                  )}
                  
                  {!participantId && memo.participant && (
                    <span className="text-xs text-gray-600">
                      {memo.participant.name}
                    </span>
                  )}
                  
                  <span className="text-xs text-gray-500">
                    {formatDate(memo.created_at)}
                  </span>
                </div>

                {/* 내용 */}
                <p className={`text-sm ${memo.status === 'resolved' ? 'line-through' : ''}`}>
                  {memo.content}
                </p>

                {/* 상태 */}
                {memo.status !== 'pending' && (
                  <div className="mt-1 text-xs text-gray-500">
                    {memo.status === 'resolved' && memo.resolved_at && (
                      <span>✓ {formatDate(memo.resolved_at)}에 처리됨</span>
                    )}
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              {showActions && memo.status !== 'resolved' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateMemoStatus(memo.id, 'resolved')}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                    title="완료 처리"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  
                  {memo.status === 'pending' && (
                    <button
                      onClick={() => updateMemoStatus(memo.id, 'follow_up')}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="후속조치 필요"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
