// MarketingContentManager.tsx
// 마케팅 콘텐츠 관리 컴포넌트

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Copy } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface MarketingContent {
  id?: string;
  tour_product_id?: string;
  tour_id?: string;
  content_type: 'included' | 'excluded' | 'special_benefit';
  display_order: number;
  icon: string;
  title: string;
  description: string;
  sub_items?: string[];
  highlight?: boolean;
  is_active: boolean;
}

interface MarketingContentManagerProps {
  tourProductId?: string;
  tourId?: string;
}

const MarketingContentManager: React.FC<MarketingContentManagerProps> = ({ tourProductId, tourId }) => {
  const [contents, setContents] = useState<MarketingContent[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'included' | 'excluded' | 'special_benefit'>('included');

  // 아이콘 옵션
  const iconOptions = [
    '🏨', '⛳', '🍽️', '🚌', '✈️', '🎁', '💰', '🛡️', '📸', '🎯',
    '🏌️‍♀️', '🏌️‍♂️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎮', '🎲'
  ];

  // 템플릿에서 추가
  const addFromTemplate = (template: any) => {
    const newContent: MarketingContent = {
      tour_product_id: tourProductId,
      tour_id: tourId,
      content_type: activeTab,
      display_order: contents.filter(c => c.content_type === activeTab).length,
      icon: template.icon,
      title: template.title,
      description: template.description,
      sub_items: template.sub_items || [],
      highlight: false,
      is_active: true
    };
    
    setContents([...contents, newContent]);
  };

  // 새 항목 추가
  const addNewContent = () => {
    const newContent: MarketingContent = {
      tour_product_id: tourProductId,
      tour_id: tourId,
      content_type: activeTab,
      display_order: contents.filter(c => c.content_type === activeTab).length,
      icon: '🎯',
      title: '',
      description: '',
      sub_items: [],
      highlight: false,
      is_active: true
    };
    
    setContents([...contents, newContent]);
    setEditingId('new-' + Date.now());
  };

  // 서브 아이템 추가
  const addSubItem = (contentIndex: number) => {
    const updated = [...contents];
    if (!updated[contentIndex].sub_items) {
      updated[contentIndex].sub_items = [];
    }
    updated[contentIndex].sub_items!.push('');
    setContents(updated);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">마케팅 콘텐츠 관리</h2>
      
      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('included')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'included' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          ✅ 포함사항
        </button>
        <button
          onClick={() => setActiveTab('excluded')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'excluded' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          ❌ 불포함사항
        </button>
        <button
          onClick={() => setActiveTab('special_benefit')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'special_benefit' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          🎁 특별혜택
        </button>
      </div>

      {/* 템플릿 섹션 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">빠른 추가 (템플릿)</h3>
        <div className="flex flex-wrap gap-2">
          {templates
            .filter(t => t.content_type === activeTab)
            .map((template, idx) => (
              <button
                key={idx}
                onClick={() => addFromTemplate(template)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-purple-50 hover:border-purple-300"
              >
                {template.icon} {template.title}
              </button>
            ))}
        </div>
      </div>

      {/* 콘텐츠 리스트 */}
      <div className="space-y-4">
        {contents
          .filter(content => content.content_type === activeTab)
          .sort((a, b) => a.display_order - b.display_order)
          .map((content, index) => (
            <div 
              key={content.id || index} 
              className={`p-4 border rounded-lg ${content.highlight ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
            >
              {editingId === (content.id || index) ? (
                // 편집 모드
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {/* 아이콘 선택 */}
                    <select
                      value={content.icon}
                      onChange={(e) => {
                        const updated = [...contents];
                        updated[index].icon = e.target.value;
                        setContents(updated);
                      }}
                      className="px-2 py-1 border rounded"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    
                    {/* 제목 입력 */}
                    <input
                      type="text"
                      value={content.title}
                      onChange={(e) => {
                        const updated = [...contents];
                        updated[index].title = e.target.value;
                        setContents(updated);
                      }}
                      placeholder="제목"
                      className="flex-1 px-3 py-1 border rounded"
                    />
                    
                    {/* 하이라이트 토글 */}
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={content.highlight}
                        onChange={(e) => {
                          const updated = [...contents];
                          updated[index].highlight = e.target.checked;
                          setContents(updated);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">강조</span>
                    </label>
                  </div>
                  
                  {/* 설명 입력 */}
                  <textarea
                    value={content.description}
                    onChange={(e) => {
                      const updated = [...contents];
                      updated[index].description = e.target.value;
                      setContents(updated);
                    }}
                    placeholder="설명"
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                  
                  {/* 서브 아이템 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">세부 항목</span>
                      <button
                        onClick={() => addSubItem(index)}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        + 추가
                      </button>
                    </div>
                    {content.sub_items?.map((item, subIndex) => (
                      <div key={subIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...contents];
                            updated[index].sub_items![subIndex] = e.target.value;
                            setContents(updated);
                          }}
                          placeholder="세부 항목"
                          className="flex-1 px-3 py-1 border rounded text-sm"
                        />
                        <button
                          onClick={() => {
                            const updated = [...contents];
                            updated[index].sub_items!.splice(subIndex, 1);
                            setContents(updated);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Save size={16} className="inline mr-1" /> 저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        // 취소 로직
                      }}
                      className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      <X size={16} className="inline mr-1" /> 취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{content.icon}</span>
                      <h4 className="font-semibold">{content.title}</h4>
                      {content.highlight && (
                        <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{content.description}</p>
                    {content.sub_items && content.sub_items.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {content.sub_items.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-500 ml-8">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(content.id || index.toString())}
                      className="p-1 text-gray-500 hover:text-purple-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        const updated = contents.filter((_, i) => i !== index);
                        setContents(updated);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* 새 항목 추가 버튼 */}
      <button
        onClick={addNewContent}
        className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600"
      >
        <Plus size={20} className="inline mr-2" />
        새 항목 추가
      </button>

      {/* 미리보기 섹션 */}
      <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">마케팅 페이지 미리보기</h3>
        <div className="bg-white p-4 rounded-lg shadow">
          {contents
            .filter(content => content.content_type === activeTab && content.is_active)
            .sort((a, b) => a.display_order - b.display_order)
            .map((content, index) => (
              <div key={index} className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{content.icon}</span>
                  <span className="font-medium">{content.title}</span>
                  {content.highlight && (
                    <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                      HOT
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 ml-7">{content.description}</p>
                {content.sub_items && content.sub_items.length > 0 && (
                  <div className="ml-7 mt-1 text-xs text-gray-500">
                    {content.sub_items.join(' • ')}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingContentManager;
