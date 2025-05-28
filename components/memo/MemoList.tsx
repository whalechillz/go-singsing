"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Memo, MEMO_CATEGORIES, MEMO_STATUS, MEMO_PRIORITY } from "@/@types/memo";
import { Clock, User, CheckCircle, AlertTriangle } from "lucide-react";

interface MemoListProps {
  participantId?: string;
  tourId?: string;
  limit?: number;
  priority?: number;
  status?: string;
  showActions?: boolean;
}

export default function MemoList({ 
  participantId, 
  tourId, 
  limit = 10,
  priority,
  status,
  showActions = true 
}: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMemo, setExpandedMemo] = useState<string | null>(null);

  useEffect(() => {
    fetchMemos();
  }, [participantId, tourId, priority, status]);

  const fetchMemos = async () => {
    let query = supabase
      .from('singsing_memos')
      .select(`
        *,
        participant:participant_id(name, phone),
        tour:tour_id(title, start_date)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (participantId) query = query.eq('participant_id', participantId);
    if (tourId) query = query.eq('tour_id', tourId);
    if (priority !== undefined) query = query.eq('priority', priority);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    
    if (!error && data) {
      setMemos(data as any);
    }
    setLoading(false);
  };

  const updateStatus = async (memoId: string, newStatus: Memo['status']) => {
    const { error } = await supabase
      .from('singsing_memos')
      .update({ 
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
        resolved_by: '관리자' // TODO: 실제 사용자로 변경
      })
      .eq('id', memoId);

    if (!error) {
      fetchMemos();
    }
  };

  const deleteMemo = async (memoId: string) => {
    if (!window.confirm('메모를 삭제하시겠습니까?')) return;
    
    const { error } = await supabase
      .from('singsing_memos')
      .delete()
      .eq('id', memoId);

    if (!error) {
      fetchMemos();
    }
  };

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (memos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        메모가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memos.map((memo) => {
        const category = MEMO_CATEGORIES[memo.category];
        const priorityConfig = MEMO_PRIORITY[memo.priority];
        const statusConfig = MEMO_STATUS[memo.status];
        
        return (
          <div 
            key={memo.id} 
            className={`
              border rounded-lg p-4 transition-all cursor-pointer
              ${memo.priority === 2 ? 'border-red-400 bg-red-50' : 
                memo.priority === 1 ? 'border-yellow-400 bg-yellow-50' : 
                'border-gray-200 bg-white'}
              ${expandedMemo === memo.id ? 'shadow-lg' : 'hover:shadow-md'}
            `}
            onClick={() => setExpandedMemo(expandedMemo === memo.id ? null : memo.id)}
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.bgColor} ${category.textColor}`}>
                  {category.icon} {category.label}
                </span>
                {memo.priority > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    memo.priority === 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {priorityConfig.label}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  memo.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                  memo.status === 'follow_up' ? 'bg-blue-100 text-blue-800' : 
                  'bg-orange-100 text-orange-800'
                }`}>
                  {statusConfig.label}
                </span>
              </div>
              
              {showActions && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {memo.status !== 'resolved' && (
                    <>
                      {memo.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(memo.id, 'follow_up')}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="후속조치 필요"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(memo.id, 'resolved')}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="완료 처리"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteMemo(memo.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="삭제"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* 내용 */}
            <div className="text-gray-700 mb-3 whitespace-pre-wrap">
              {expandedMemo === memo.id ? (
                memo.content
              ) : (
                <div className="line-clamp-2">
                  {memo.content}
                </div>
              )}
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                {memo.participant && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {memo.participant.name}
                  </span>
                )}
                {memo.tour && (
                  <span>{memo.tour.title}</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(memo.created_at).toLocaleString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* 해결 정보 */}
            {memo.status === 'resolved' && memo.resolved_at && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                {new Date(memo.resolved_at).toLocaleString('ko-KR')}에 {memo.resolved_by || '관리자'}님이 처리 완료
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
