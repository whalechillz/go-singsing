"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MemoList from "./MemoList";
import { X, MessageSquare } from "lucide-react";

interface MemoViewerProps {
  participantId: string;
  participantName: string;
  tourId: string;
  memoCount: number;
}

export default function MemoViewer({ 
  participantId, 
  participantName, 
  tourId,
  memoCount 
}: MemoViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 메모 개수 클릭 버튼 */}
      {memoCount > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-xs ml-1"
          title={`${memoCount}개의 메모 보기`}
        >
          ({memoCount})
        </button>
      )}

      {/* 메모 보기 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {participantName}님의 메모
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 메모 리스트 */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <MemoList 
                participantId={participantId}
                tourId={tourId}
                showActions={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
