"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Save, Plus, X, Users } from "lucide-react";
import Link from "next/link";
import type { Attendee, ActionItem } from "@/@types/meeting";
import MeetingAttachmentUploader from "@/components/admin/meetings/MeetingAttachmentUploader";

export default function MeetingNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    meeting_date: "",
    meeting_time: "",
    meeting_type: "in_person" as "phone" | "in_person" | "online",
    meeting_location: "",
    partner_company_id: "",
    attendees: [] as Attendee[],
    agenda: "",
    discussion: "",
    decisions: "",
    action_items: [] as ActionItem[],
    comparison_data: {} as Record<string, any>,
    details: {} as Record<string, any>,
    tags: [] as string[],
    status: "draft" as "draft" | "published" | "archived",
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data } = await supabase
        .from("partner_companies")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (data) setPartners(data);
    } catch (error) {
      console.error("협업 업체 조회 오류:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 참석자 관리
  const [newAttendee, setNewAttendee] = useState<Attendee>({
    name: "",
    role: "",
    company: "",
    type: "internal",
  });

  const addAttendee = () => {
    if (!newAttendee.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    setForm({
      ...form,
      attendees: [...form.attendees, { ...newAttendee }],
    });
    setNewAttendee({ name: "", role: "", company: "", type: "internal" });
  };

  const removeAttendee = (index: number) => {
    setForm({
      ...form,
      attendees: form.attendees.filter((_, i) => i !== index),
    });
  };

  // Action Item 관리
  const [newActionItem, setNewActionItem] = useState<ActionItem>({
    task: "",
    assignee: "",
    due_date: "",
    status: "pending",
  });

  const addActionItem = () => {
    if (!newActionItem.task.trim()) {
      alert("작업명을 입력해주세요.");
      return;
    }
    setForm({
      ...form,
      action_items: [...form.action_items, { ...newActionItem }],
    });
    setNewActionItem({ task: "", assignee: "", due_date: "", status: "pending" });
  };

  const removeActionItem = (index: number) => {
    setForm({
      ...form,
      action_items: form.action_items.filter((_, i) => i !== index),
    });
  };

  // 태그 관리
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (form.tags.includes(tag)) {
      alert("이미 추가된 태그입니다.");
      return;
    }
    setForm({ ...form, tags: [...form.tags, tag] });
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setForm({
      ...form,
      tags: form.tags.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      alert("회의 제목을 입력해주세요.");
      return;
    }
    if (!form.meeting_date) {
      alert("회의 날짜를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meeting_minutes")
        .insert([{
          ...form,
          attendees: form.attendees.length > 0 ? form.attendees : [],
          action_items: form.action_items.length > 0 ? form.action_items : [],
          tags: form.tags.length > 0 ? form.tags : [],
          comparison_data: Object.keys(form.comparison_data).length > 0 ? form.comparison_data : null,
          details: Object.keys(form.details).length > 0 ? form.details : null,
        }])
        .select()
        .single();

      if (error) throw error;

      alert("회의록이 저장되었습니다.");
      router.push(`/admin/meetings/${data.id}`);
    } catch (error: any) {
      console.error("저장 오류:", error);
      alert(`저장에 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/meetings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">회의록 작성</h1>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회의 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="예: 싱싱골프-코코넛 골프투어 협업 회의"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회의 날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="meeting_date"
                value={form.meeting_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회의 시간
              </label>
              <input
                type="time"
                name="meeting_time"
                value={form.meeting_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회의 유형 <span className="text-red-500">*</span>
              </label>
              <select
                name="meeting_type"
                value={form.meeting_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="phone">전화</option>
                <option value="in_person">대면</option>
                <option value="online">온라인</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회의 장소
              </label>
              <input
                type="text"
                name="meeting_location"
                value={form.meeting_location}
                onChange={handleChange}
                placeholder="예: 마스골프 오피스"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                협업 업체
              </label>
              <select
                name="partner_company_id"
                value={form.partner_company_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안함</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">초안</option>
                <option value="published">게시</option>
                <option value="archived">보관</option>
              </select>
            </div>
          </div>
        </div>

        {/* 참석자 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">참석자 정보</h2>
          
          {/* 참석자 추가 폼 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            <input
              type="text"
              placeholder="이름 *"
              value={newAttendee.name}
              onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="역할"
              value={newAttendee.role}
              onChange={(e) => setNewAttendee({ ...newAttendee, role: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="소속"
              value={newAttendee.company}
              onChange={(e) => setNewAttendee({ ...newAttendee, company: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={newAttendee.type}
                onChange={(e) => setNewAttendee({ ...newAttendee, type: e.target.value as "internal" | "external" })}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internal">내부</option>
                <option value="external">외부</option>
              </select>
              <button
                type="button"
                onClick={addAttendee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 참석자 목록 */}
          {form.attendees.length > 0 && (
            <div className="space-y-2">
              {form.attendees.map((attendee, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <span className="font-medium">{attendee.name}</span>
                    <span className="text-sm text-gray-600">{attendee.role || "-"}</span>
                    <span className="text-sm text-gray-600">{attendee.company || "-"}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      attendee.type === "internal" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {attendee.type === "internal" ? "내부" : "외부"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttendee(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 회의 내용 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">회의 내용</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                안건
              </label>
              <textarea
                name="agenda"
                value={form.agenda}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="회의 안건을 입력하세요..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                논의 사항
              </label>
              <textarea
                name="discussion"
                value={form.discussion}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="논의된 내용을 입력하세요..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                결정 사항
              </label>
              <textarea
                name="decisions"
                value={form.decisions}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="결정된 사항을 입력하세요..."
              />
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
          
          {/* Action Item 추가 폼 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            <input
              type="text"
              placeholder="작업명 *"
              value={newActionItem.task}
              onChange={(e) => setNewActionItem({ ...newActionItem, task: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="담당자"
              value={newActionItem.assignee}
              onChange={(e) => setNewActionItem({ ...newActionItem, assignee: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="마감일"
              value={newActionItem.due_date}
              onChange={(e) => setNewActionItem({ ...newActionItem, due_date: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={newActionItem.status}
                onChange={(e) => setNewActionItem({ ...newActionItem, status: e.target.value as any })}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">대기</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
              </select>
              <button
                type="button"
                onClick={addActionItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Items 목록 */}
          {form.action_items.length > 0 && (
            <div className="space-y-2">
              {form.action_items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <span className="font-medium">{item.task}</span>
                    <span className="text-sm text-gray-600">{item.assignee || "-"}</span>
                    <span className="text-sm text-gray-600">
                      {item.due_date ? new Date(item.due_date).toLocaleDateString("ko-KR") : "-"}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : item.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.status === "completed" ? "완료" : item.status === "in_progress" ? "진행중" : "대기"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeActionItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 태그 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">태그</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="태그 입력 후 Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              추가
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/meetings"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}


