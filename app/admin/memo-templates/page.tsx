"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Plus, Edit2, Trash2, Copy } from "lucide-react";
import { MEMO_CATEGORIES } from "@/@types/memo";

interface Template {
  id: string;
  category: string;
  title: string;
  content_template: string;
  usage_count: number;
  created_at: string;
}

export default function MemoTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState({
    category: "general",
    title: "",
    content_template: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("singsing_memo_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("usage_count", { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    console.log("템플릿 저장 시도:", form);

    try {
      if (editingTemplate) {
        // 수정
        const { error } = await supabase
          .from("singsing_memo_templates")
          .update({
            category: form.category,
            title: form.title,
            content_template: form.content_template
          })
          .eq("id", editingTemplate.id);

        if (error) {
          console.error("템플릿 수정 오류:", error);
          setError(`템플릿 수정 실패: ${error.message}`);
        } else {
          setShowModal(false);
          resetForm();
          fetchTemplates();
        }
      } else {
        // 추가
        const { data, error } = await supabase
          .from("singsing_memo_templates")
          .insert({
            category: form.category,
            title: form.title,
            content_template: form.content_template
          })
          .select();

        if (error) {
          console.error("템플릿 추가 오류:", error);
          setError(`템플릿 추가 실패: ${error.message}`);
        } else {
          console.log("템플릿 추가 성공:", data);
          setShowModal(false);
          resetForm();
          fetchTemplates();
        }
      }
    } catch (err) {
      console.error("예상치 못한 오류:", err);
      setError("템플릿 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setForm({
      category: template.category,
      title: template.title,
      content_template: template.content_template
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 템플릿을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("singsing_memo_templates")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchTemplates();
    }
  };

  const resetForm = () => {
    setForm({
      category: "general",
      title: "",
      content_template: ""
    });
    setEditingTemplate(null);
    setError("");
  };

  // 기본 템플릿 일괄 추가
  const addDefaultTemplates = async () => {
    const defaultTemplates = [
      // 결제 관련
      { category: 'payment', title: '결제 확인 요청', content_template: '결제 확인 필요 - 금액: {금액}원, 방법: {카드/현금/계좌이체}' },
      { category: 'payment', title: '환불 요청', content_template: '환불 요청 - 사유: {사유}, 금액: {금액}원' },
      { category: 'payment', title: '홀정산 요청', content_template: '홀정산 요청 - {우천취소/일정변경/기타}, 정산금액: {금액}원' },
      { category: 'payment', title: '부분 정산', content_template: '부분 정산 필요 - 사유: {사유}, 차감액: {금액}원' },
      
      // 일정 변경
      { category: 'boarding', title: '탑승지 변경', content_template: '탑승지 변경: {기존} → {변경}' },
      { category: 'boarding', title: '객실 변경 요청', content_template: '객실 변경 요청: {기존 객실} → {희망 객실}, 사유: {사유}' },
      { category: 'boarding', title: '티오프 시간 변경', content_template: '티오프 시간 변경 요청: {기존 시간} → {희망 시간}' },
      
      // 긴급/중요
      { category: 'urgent', title: '스탭 전달사항', content_template: '[기사/가이드] 전달사항: {내용}' },
      { category: 'urgent', title: '내부 인수인계', content_template: '[인수인계] {담당자}님께 전달: {내용}' },
      { category: 'urgent', title: '고객 컴플레인', content_template: '[컴플레인] {내용} - 조치필요' },
      
      // 일반 요청
      { category: 'request', title: '식사 요청사항', content_template: '식사 관련: {알레르기/종교/채식} - {상세내용}' },
      { category: 'request', title: '특별 요청', content_template: '특별 요청사항: {내용}' },
      { category: 'general', title: '연락처 변경', content_template: '연락처 변경: {이전} → {변경}' }
    ];

    for (const template of defaultTemplates) {
      await supabase
        .from("singsing_memo_templates")
        .insert(template);
    }

    fetchTemplates();
    alert("기본 템플릿이 추가되었습니다!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          메모 템플릿 관리
        </h1>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <button
              onClick={addDefaultTemplates}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              기본 템플릿 추가
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            템플릿 추가
          </button>
        </div>
      </div>

      {/* 카테고리별 템플릿 표시 */}
      {loading ? (
        <div className="text-center py-10">로딩 중...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">등록된 템플릿이 없습니다.</p>
          <button
            onClick={addDefaultTemplates}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            기본 템플릿 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(MEMO_CATEGORIES).map(([categoryKey, categoryInfo]) => {
            const categoryTemplates = templates.filter(t => t.category === categoryKey);
            
            if (categoryTemplates.length === 0) return null;

            return (
              <div key={categoryKey} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${categoryInfo.textColor}`}>
                  <span className={`px-2 py-1 rounded ${categoryInfo.bgColor}`}>
                    {categoryInfo.icon} {categoryInfo.label}
                  </span>
                </h2>
                
                <div className="space-y-2">
                  {categoryTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.content_template}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          사용 횟수: {template.usage_count || 0}회
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 템플릿 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? "템플릿 수정" : "템플릿 추가"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {Object.entries(MEMO_CATEGORIES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.icon} {info.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  템플릿 제목
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="예: 탑승지 변경"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  템플릿 내용
                </label>
                <textarea
                  value={form.content_template}
                  onChange={(e) => setForm({ ...form, content_template: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="예: 탑승지 변경: {기존} → {변경}"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {`{}`} 안의 내용은 사용자가 직접 입력할 수 있는 부분입니다.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? "저장 중..." : (editingTemplate ? "수정" : "추가")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
