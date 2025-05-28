"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Plus, Calendar, User, MessageSquare } from "lucide-react";

interface WorkMemo {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
  status: string;
  created_by: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export default function WorkMemosPage() {
  const [memos, setMemos] = useState<WorkMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<WorkMemo | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general",
    priority: 0,
    assigned_to: "",
    due_date: ""
  });
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    const { data, error } = await supabase
      .from("singsing_work_memos")
      .select(`
        *,
        comments:singsing_work_memo_comments(*)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMemos(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("singsing_work_memos")
      .insert({
        ...form,
        created_by: "관리자"
      });

    if (!error) {
      setShowModal(false);
      setForm({
        title: "",
        content: "",
        category: "general",
        priority: 0,
        assigned_to: "",
        due_date: ""
      });
      fetchMemos();
    }
  };

  const addComment = async (memoId: string) => {
    if (!comment.trim()) return;

    const { error } = await supabase
      .from("singsing_work_memo_comments")
      .insert({
        memo_id: memoId,
        content: comment,
        created_by: "관리자"
      });

    if (!error) {
      setComment("");
      fetchMemos();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("singsing_work_memos")
      .update({ status })
      .eq("id", id);

    if (!error) {
      fetchMemos();
    }
  };

  const categories = {
    general: { label: "일반", color: "gray" },
    notice: { label: "공지", color: "blue" },
    meeting: { label: "회의", color: "green" },
    todo: { label: "할일", color: "orange" }
  };

  const priorities = {
    0: { label: "보통", color: "gray" },
    1: { label: "중요", color: "yellow" },
    2: { label: "긴급", color: "red" }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          업무 메모
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          메모 추가
        </button>
      </div>

      {/* 메모 목록 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {memos.map((memo) => {
          const category = categories[memo.category as keyof typeof categories];
          const priority = priorities[memo.priority as keyof typeof priorities];
          
          return (
            <div
              key={memo.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              {/* 헤더 */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{memo.title}</h3>
                <div className="flex gap-1">
                  <span className={`px-2 py-1 rounded text-xs bg-${category.color}-100 text-${category.color}-800`}>
                    {category.label}
                  </span>
                  {memo.priority > 0 && (
                    <span className={`px-2 py-1 rounded text-xs bg-${priority.color}-100 text-${priority.color}-800`}>
                      {priority.label}
                    </span>
                  )}
                </div>
              </div>

              {/* 내용 */}
              <p className="text-gray-600 mb-3 line-clamp-3">{memo.content}</p>

              {/* 메타 정보 */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>{memo.created_by}</span>
                </div>
                {memo.assigned_to && (
                  <div className="flex items-center gap-2">
                    <span>담당: {memo.assigned_to}</span>
                  </div>
                )}
                {memo.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>기한: {new Date(memo.due_date).toLocaleDateString("ko-KR")}</span>
                  </div>
                )}
                {memo.comments && memo.comments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    <span>댓글 {memo.comments.length}개</span>
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <button
                  onClick={() => setSelectedMemo(memo)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  상세보기
                </button>
                {memo.status !== "completed" && (
                  <button
                    onClick={() => updateStatus(memo.id, "completed")}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    완료
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 메모 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">업무 메모 추가</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {Object.entries(priorities).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자
                </label>
                <input
                  type="text"
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="선택사항"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  마감일
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {selectedMemo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedMemo.title}</h2>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs bg-${categories[selectedMemo.category as keyof typeof categories].color}-100`}>
                    {categories[selectedMemo.category as keyof typeof categories].label}
                  </span>
                  {selectedMemo.priority > 0 && (
                    <span className={`px-2 py-1 rounded text-xs bg-${priorities[selectedMemo.priority as keyof typeof priorities].color}-100`}>
                      {priorities[selectedMemo.priority as keyof typeof priorities].label}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedMemo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap">{selectedMemo.content}</p>
            </div>

            {/* 댓글 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">댓글</h3>
              
              {selectedMemo.comments?.map((c) => (
                <div key={c.id} className="mb-3 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{c.created_by}</span>
                    <span>{new Date(c.created_at).toLocaleString("ko-KR")}</span>
                  </div>
                  <p>{c.content}</p>
                </div>
              ))}

              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  onClick={() => addComment(selectedMemo.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
