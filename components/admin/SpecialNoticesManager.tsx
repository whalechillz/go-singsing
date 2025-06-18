'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, ChevronDown, ChevronUp, Cloud, Clock, Info, AlertCircle, MessageSquare, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Notice {
  id: string;
  content: string;
  priority: number;
  type: 'general' | 'weather' | 'checkin' | 'important';
  created_at?: string;
  showConditions?: {
    hoursBeforeCheckin?: number;
    weather?: string[];
  };
}

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  type: 'general' | 'weather' | 'checkin' | 'important';
  variables?: string[];
}

interface SpecialNoticesManagerProps {
  tourId: string;
  notices: Notice[];
  onUpdate: (notices: Notice[]) => void;
  tourStartDate?: string;
}

const noticeTypeConfig = {
  general: { 
    icon: Info, 
    label: '일반',
    bgColor: 'bg-red-100', 
    iconColor: 'text-red-600',
    borderColor: 'border-red-300'
  },
  weather: { 
    icon: Cloud, 
    label: '날씨',
    bgColor: 'bg-blue-100', 
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-300' 
  },
  checkin: { 
    icon: Clock, 
    label: '체크인',
    bgColor: 'bg-green-100', 
    iconColor: 'text-green-600',
    borderColor: 'border-green-300' 
  },
  important: { 
    icon: AlertCircle, 
    label: '중요',
    bgColor: 'bg-orange-100', 
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-300' 
  }
};

// 공지사항 템플릿
const noticeTemplates: Template[] = [
  {
    id: '1',
    name: '우천시 환불 규정',
    category: '날씨',
    type: 'weather',
    content: '☔ 우천시 환불 규정 안내\n• 1홀까지: 전액-기본요금\n• 2~9홀: 차등환불\n• 10홀이상: 환불불가\n• 캐디피: 1홀 3만/2~9홀 8만/10홀이상 15만',
    variables: []
  },
  {
    id: '2',
    name: '룸키 수령 안내',
    category: '체크인',
    type: 'checkin',
    content: '🔑 룸키 수령 안내\n• 2팀 이상: 각 팀 총무님 수령\n• 1팀: 대표자님 수령\n• 프론트에서 성함 말씀해주세요',
    variables: []
  },
  {
    id: '3',
    name: '식음료 결제 안내',
    category: '일반',
    type: 'general',
    content: '📢 식음료 결제 안내\n• 골프장 식당 이용시 당일 결제\n• 객실 미니바 이용시 체크아웃시 결제\n• 단체 식사는 투어비에 포함되어 있습니다',
    variables: []
  },
  {
    id: '4',
    name: '출발 시간 변경',
    category: '중요',
    type: 'important',
    content: '🚌 출발 시간 변경 안내\n• 출발 시간이 {이전시간}에서 {변경시간}으로 변경되었습니다\n• 탑승 위치는 동일합니다\n• 늦지 않도록 주의해주세요',
    variables: ['이전시간', '변경시간']
  },
  {
    id: '5',
    name: '골프장 드레스 코드',
    category: '일반',
    type: 'general',
    content: '🏌️ 골프장 드레스 코드\n• 상의: 카라 있는 셔츠 필수\n• 하의: 청바지 불가\n• 모자 착용 권장',
    variables: []
  },
  {
    id: '6',
    name: '집합 장소 안내',
    category: '일반',
    type: 'general',
    content: '📍 집합 장소 안내\n• 1차: {1차장소} ({1차시간})\n• 2차: {2차장소} ({2차시간})\n• 버스 번호: {버스번호}',
    variables: ['1차장소', '1차시간', '2차장소', '2차시간', '버스번호']
  }
];

export default function SpecialNoticesManager({ tourId, notices, onUpdate, tourStartDate }: SpecialNoticesManagerProps) {
  const [localNotices, setLocalNotices] = useState<Notice[]>(notices || []);
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalNotices(notices || []);
  }, [notices]);

  const handleAddNotice = () => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      content: '',
      priority: localNotices.length,
      type: 'general',
      created_at: new Date().toISOString()
    };
    const updated = [...localNotices, newNotice];
    setLocalNotices(updated);
    setExpandedNotice(newNotice.id);
    onUpdate(updated);
  };

  const handleUpdateNotice = (index: number, field: keyof Notice, value: any) => {
    const updated = [...localNotices];
    updated[index] = { ...updated[index], [field]: value };
    setLocalNotices(updated);
    onUpdate(updated);
  };

  const handleDeleteNotice = (index: number) => {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      const updated = localNotices.filter((_, i) => i !== index);
      // 우선순위 재정렬
      updated.forEach((notice, i) => {
        notice.priority = i;
      });
      setLocalNotices(updated);
      onUpdate(updated);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const draggedNotice = localNotices[draggedIndex];
    const updated = localNotices.filter((_, i) => i !== draggedIndex);
    updated.splice(index, 0, draggedNotice);
    
    // 우선순위 재정렬
    updated.forEach((notice, i) => {
      notice.priority = i;
    });

    setLocalNotices(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onUpdate(localNotices);
  };

  const applyTemplate = (template: Template) => {
    let content = template.content;
    
    // 변수 치환
    if (template.variables) {
      template.variables.forEach(variable => {
        const value = templateValues[variable] || `{${variable}}`;
        content = content.replace(new RegExp(`{${variable}}`, 'g'), value);
      });
    }

    const newNotice: Notice = {
      id: Date.now().toString(),
      content: content,
      priority: localNotices.length,
      type: template.type,
      created_at: new Date().toISOString()
    };

    const updated = [...localNotices, newNotice];
    setLocalNotices(updated);
    onUpdate(updated);
    
    setShowTemplates(false);
    setSelectedTemplate(null);
    setTemplateValues({});
  };

  const sendNoticeMessage = async (notice: Notice) => {
    const confirmed = confirm(
      `이 공지사항을 모든 참가자에게 발송하시겠습니까?\n\n${notice.content}`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/tours/${tourId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId,
          message: notice.content,
          messageType: 'sms' // 기본은 SMS, 나중에 옵션 추가 가능
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `메시지 발송 완료!\n\n` +
          `총 수신자: ${result.results.totalRecipients}명\n` +
          `성공: ${result.results.successCount}명\n` +
          `실패: ${result.results.failedCount}명`
        );
      } else {
        alert(`메시지 발송 실패: ${result.error}`);
      }
      
    } catch (error) {
      console.error('메시지 발송 실패:', error);
      alert('메시지 발송에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">긴급공지사항 관리</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <Copy className="w-4 h-4" />
            템플릿
          </button>
          <button
            type="button"
            onClick={handleAddNotice}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            공지 추가
          </button>
        </div>
      </div>

      {/* 템플릿 선택 */}
      {showTemplates && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3">공지사항 템플릿</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {noticeTemplates.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template)}
                className={`text-left p-3 border rounded-lg hover:bg-white ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500">{template.category}</div>
              </button>
            ))}
          </div>

          {selectedTemplate && (
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2">템플릿 미리보기</h5>
              <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.content}</pre>
              </div>

              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div className="space-y-2 mb-3">
                  <h6 className="text-sm font-medium">변수 입력</h6>
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable} className="flex items-center gap-2">
                      <label className="text-sm w-24">{variable}:</label>
                      <input
                        type="text"
                        value={templateValues[variable] || ''}
                        onChange={(e) => setTemplateValues({
                          ...templateValues,
                          [variable]: e.target.value
                        })}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        placeholder={`${variable} 입력`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => applyTemplate(selectedTemplate)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                템플릿 적용
              </button>
            </div>
          )}
        </div>
      )}

      {/* 공지사항 목록 */}
      <div className="space-y-3">
        {localNotices.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            공지사항이 없습니다. 추가 버튼을 눌러 추가해주세요.
          </div>
        ) : (
          localNotices.map((notice, index) => {
            const config = noticeTypeConfig[notice.type];
            const Icon = config.icon;
            const isExpanded = expandedNotice === notice.id;

            return (
              <div
                key={notice.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`border rounded-lg p-4 bg-white ${config.borderColor} ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="cursor-move pt-1">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className={`${config.bgColor} rounded-full p-2`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <select
                        value={notice.type}
                        onChange={(e) => handleUpdateNotice(index, 'type', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        {Object.entries(noticeTypeConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-500">
                        우선순위: {notice.priority + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedNotice(isExpanded ? null : notice.id)}
                        className="ml-auto text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    <textarea
                      value={notice.content}
                      onChange={(e) => handleUpdateNotice(index, 'content', e.target.value)}
                      placeholder="공지사항 내용을 입력하세요..."
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={3}
                    />

                    {isExpanded && (
                      <div className="mt-3 space-y-3 border-t pt-3">
                        {/* 조건부 표시 설정 */}
                        <div>
                          <h5 className="text-sm font-medium mb-2">표시 조건 (선택사항)</h5>
                          {notice.type === 'checkin' && (
                            <div className="flex items-center gap-2">
                              <label className="text-sm">체크인</label>
                              <input
                                type="number"
                                value={notice.showConditions?.hoursBeforeCheckin || ''}
                                onChange={(e) => {
                                  const hours = e.target.value ? parseInt(e.target.value) : undefined;
                                  handleUpdateNotice(index, 'showConditions', {
                                    ...notice.showConditions,
                                    hoursBeforeCheckin: hours
                                  });
                                }}
                                className="w-16 px-2 py-1 border rounded text-sm"
                                placeholder="24"
                              />
                              <span className="text-sm">시간 전부터 표시</span>
                            </div>
                          )}
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => sendNoticeMessage(notice)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <MessageSquare className="w-4 h-4" />
                            메시지 발송
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(index)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {localNotices.length > 0 && (
        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
          💡 공지사항을 드래그하여 순서를 변경할 수 있습니다. 우선순위가 낮을수록 먼저 표시됩니다.
        </div>
      )}
    </div>
  );
}
