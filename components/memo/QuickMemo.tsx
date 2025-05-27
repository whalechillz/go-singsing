"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MessageSquare, X, AlertCircle, Check } from "lucide-react";
import { Memo, MemoTemplate, MEMO_CATEGORIES, MEMO_STATUS } from "@/@types/memo";

interface QuickMemoProps {
  participantId: string;
  tourId: string;
  participantName: string;
  onClose?: () => void;
  onSave?: () => void;
}

export default function QuickMemo({ participantId, tourId, participantName, onClose, onSave }: QuickMemoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Memo['category']>('general');
  const [priority, setPriority] = useState<Memo['priority']>(0);
  const [content, setContent] = useState('');
  const [templates, setTemplates] = useState<MemoTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, category]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('singsing_memo_templates')
      .select('*')
      .eq('category', category)
      .order('usage_count', { ascending: false });
    
    if (data) setTemplates(data);
  };

  const handleTemplateSelect = (template: MemoTemplate) => {
    setContent(template.content_template);
    setSelectedTemplate(template.id);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    
    const { error } = await supabase
      .from('singsing_memos')
      .insert({
        participant_id: participantId,
        tour_id: tourId,
        category,
        priority,
        content: content.trim(),
        status: 'pending',
        created_by: '관리자' // TODO: 실제 사용자 정보로 변경
      });
    
    if (!error) {
      // 템플릿 사용 횟수 증가
      if (selectedTemplate) {
        await supabase
          .from('singsing_memo_templates')
          .update({ usage_count: templates.find(t => t.id === selectedTemplate)?.usage_count || 0 + 1 })
          .eq('id', selectedTemplate);
      }
      
      setContent('');
      setCategory('general');
      setPriority(0);
      setIsOpen(false);
      onSave?.();
    }
    
    setLoading(false);
  };

  return (
    <>
      {/* 메모 추가 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-blue-600 transition-colors"
        title="메모 추가"
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {/* 메모 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">
                {participantName}님 메모 추가
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-4 space-y-4">
              {/* 카테고리 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(MEMO_CATEGORIES).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key as Memo['category'])}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-all
                        ${category === key 
                          ? `${config.bgColor} ${config.textColor}` 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      <span className="mr-1">{config.icon}</span>
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 우선순위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p as Memo['priority'])}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1
                        ${priority === p 
                          ? p === 2 ? 'bg-red-100 text-red-800' 
                          : p === 1 ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-200 text-gray-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {p === 2 ? '🚨 긴급' : p === 1 ? '⚠️ 중요' : '📌 보통'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 템플릿 */}
              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    빠른 템플릿
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 메모 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {content.length}/500
                </p>
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
