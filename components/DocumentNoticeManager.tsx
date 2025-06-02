"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Plus, X, Save, Eye, Copy, ChevronUp, ChevronDown } from "lucide-react";

interface NoticeBlock {
  order: number;
  content: string;
}

interface DocumentTemplate {
  id: string;
  template_name: string;
  document_type: string;
  content_blocks: NoticeBlock[];
  is_default: boolean;
}

interface DocumentNotice {
  id?: string;
  tour_id: string;
  document_type: string;
  notices: NoticeBlock[];
}

const DOCUMENT_TYPES = [
  { value: "customer_schedule", label: "고객용 일정표", icon: "📋" },
  { value: "customer_boarding", label: "고객용 탑승안내서", icon: "🚌" },
  { value: "staff_boarding", label: "스탭용 탑승안내서", icon: "👥" },
  { value: "room_assignment", label: "객실 배정표", icon: "🏨" },
  { value: "tee_time", label: "티타임표", icon: "⛳" },
  { value: "simplified", label: "간편 일정표", icon: "📄" },
];

interface Props {
  tourId: string;
  onSave?: () => void;
}

export default function DocumentNoticeManager({ tourId, onSave }: Props) {
  const [notices, setNotices] = useState<Record<string, DocumentNotice>>({});
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [activeTemplate, setActiveTemplate] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 문서별 공지사항 가져오기
      const { data: noticesData, error: noticesError } = await supabase
        .from("document_notices")
        .select("*")
        .eq("tour_id", tourId);

      if (noticesError) throw noticesError;

      // 기본 템플릿 가져오기
      const { data: templatesData, error: templatesError } = await supabase
        .from("document_templates")
        .select("*")
        .order("document_type");

      if (templatesError) throw templatesError;

      // 데이터 구조화
      const noticesByType: Record<string, DocumentNotice> = {};
      
      // 각 문서 타입에 대해 초기화
      DOCUMENT_TYPES.forEach(docType => {
        const existingNotice = noticesData?.find(n => n.document_type === docType.value);
        if (existingNotice) {
          noticesByType[docType.value] = existingNotice;
        } else {
          // 템플릿에서 기본값 가져오기
          const defaultTemplate = templatesData?.find(t => t.document_type === docType.value && t.is_default);
          noticesByType[docType.value] = {
            tour_id: tourId,
            document_type: docType.value,
            notices: defaultTemplate?.content_blocks || []
          };
        }
      });

      setNotices(noticesByType);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (docType: string) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(docType)) {
      newExpanded.delete(docType);
    } else {
      newExpanded.add(docType);
    }
    setExpandedDocs(newExpanded);
  };

  const addNotice = (docType: string) => {
    const currentNotices = notices[docType]?.notices || [];
    const newOrder = Math.max(...currentNotices.map(n => n.order), 0) + 1;
    
    setNotices({
      ...notices,
      [docType]: {
        ...notices[docType],
        notices: [...currentNotices, { order: newOrder, content: "" }]
      }
    });
  };

  const updateNotice = (docType: string, index: number, content: string) => {
    const updatedNotices = [...(notices[docType]?.notices || [])];
    updatedNotices[index].content = content;
    
    setNotices({
      ...notices,
      [docType]: {
        ...notices[docType],
        notices: updatedNotices
      }
    });
  };

  const removeNotice = (docType: string, index: number) => {
    const updatedNotices = notices[docType]?.notices.filter((_, i) => i !== index) || [];
    
    setNotices({
      ...notices,
      [docType]: {
        ...notices[docType],
        notices: updatedNotices
      }
    });
  };

  const applyTemplate = (docType: string, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setNotices({
      ...notices,
      [docType]: {
        ...notices[docType],
        notices: [...template.content_blocks]
      }
    });
    setActiveTemplate("");
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // 모든 문서별 공지사항 저장
      for (const [docType, notice] of Object.entries(notices)) {
        const validNotices = notice.notices.filter(n => n.content.trim());
        
        if (notice.id) {
          // 기존 항목 업데이트
          await supabase
            .from("document_notices")
            .update({
              notices: validNotices,
              updated_at: new Date().toISOString()
            })
            .eq("id", notice.id);
        } else if (validNotices.length > 0) {
          // 새 항목 추가
          await supabase
            .from("document_notices")
            .insert({
              tour_id: tourId,
              document_type: docType,
              notices: validNotices
            });
        }
      }
      
      if (onSave) onSave();
      await fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error("Error saving notices:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          문서별 공지사항 관리
        </h3>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "저장 중..." : "전체 저장"}
        </button>
      </div>

      <div className="grid gap-4">
        {DOCUMENT_TYPES.map(docType => {
          const isExpanded = expandedDocs.has(docType.value);
          const docNotices = notices[docType.value];
          const relevantTemplates = templates.filter(t => t.document_type === docType.value);

          return (
            <div key={docType.value} className="border rounded-lg bg-white shadow-sm">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpanded(docType.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{docType.icon}</span>
                  <div>
                    <h4 className="font-medium">{docType.label}</h4>
                    <p className="text-sm text-gray-500">
                      {docNotices?.notices.length || 0}개의 공지사항
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>

              {isExpanded && (
                <div className="border-t p-4 space-y-4">
                  {/* 템플릿 선택 */}
                  {relevantTemplates.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <select
                        value={activeTemplate}
                        onChange={(e) => setActiveTemplate(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded"
                      >
                        <option value="">템플릿 선택...</option>
                        {relevantTemplates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.template_name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => applyTemplate(docType.value, activeTemplate)}
                        disabled={!activeTemplate}
                        className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        적용
                      </button>
                    </div>
                  )}

                  {/* 공지사항 목록 */}
                  <div className="space-y-2">
                    {docNotices?.notices.map((notice, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="mt-2 text-sm text-gray-500 w-8">{notice.order}.</span>
                        <textarea
                          value={notice.content}
                          onChange={(e) => updateNotice(docType.value, idx, e.target.value)}
                          placeholder="공지사항 내용"
                          rows={2}
                          className="flex-1 px-3 py-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeNotice(docType.value, idx)}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )) || (
                      <p className="text-gray-400 text-center py-4">
                        공지사항이 없습니다. 추가 버튼을 눌러 추가하세요.
                      </p>
                    )}
                  </div>

                  {/* 추가 버튼 */}
                  <button
                    onClick={() => addNotice(docType.value)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    공지사항 추가
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>팁:</strong> 각 문서의 하단에 표시될 공지사항을 관리합니다. 
          템플릿을 활용하여 빠르게 기본 공지사항을 설정할 수 있습니다.
        </p>
      </div>
    </div>
  );
}