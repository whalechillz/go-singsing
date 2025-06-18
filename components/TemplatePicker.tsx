'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, X, Copy, MessageCircle, Search } from 'lucide-react';

interface NoticeTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  short_content: string | null;
  variables: string[];
}

interface TemplatePickerProps {
  onSelect: (content: string, shortContent?: string) => void;
  onClose: () => void;
  mode?: 'full' | 'message'; // full: 전체 내용, message: 메시지용
  tourData?: {
    title?: string;
    start_date?: string;
    end_date?: string;
    manager_phone?: string;
    driver_phone?: string;
    hotel_name?: string;
    golf_course?: string;
  };
}

const categoryLabels: Record<string, { label: string; color: string; icon: string }> = {
  weather: { label: '날씨/환불', color: 'bg-blue-100 text-blue-800', icon: '☔' },
  payment: { label: '결제', color: 'bg-green-100 text-green-800', icon: '💳' },
  schedule: { label: '일정', color: 'bg-yellow-100 text-yellow-800', icon: '📅' },
  emergency: { label: '긴급', color: 'bg-red-100 text-red-800', icon: '🚨' },
  dress: { label: '복장', color: 'bg-purple-100 text-purple-800', icon: '👔' },
  transport: { label: '교통', color: 'bg-indigo-100 text-indigo-800', icon: '🚌' },
  facility: { label: '시설', color: 'bg-gray-100 text-gray-800', icon: '🏨' },
  other: { label: '기타', color: 'bg-gray-100 text-gray-800', icon: '📌' }
};

export default function TemplatePicker({ onSelect, onClose, mode = 'full', tourData = {} }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<NoticeTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notice_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });
        
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: NoticeTemplate) => {
    setSelectedTemplate(template);
    
    // 투어 데이터에서 자동으로 변수 값 채우기
    const autoFilledValues: Record<string, string> = {};
    template.variables.forEach((variable) => {
      if (tourData[variable as keyof typeof tourData]) {
        autoFilledValues[variable] = tourData[variable as keyof typeof tourData] as string;
      }
    });
    setVariableValues(autoFilledValues);
  };

  const handleConfirm = async () => {
    if (!selectedTemplate) return;
    
    let content = selectedTemplate.content;
    let shortContent = selectedTemplate.short_content || '';
    
    // 변수 치환
    Object.entries(variableValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
      shortContent = shortContent.replace(regex, value);
    });
    
    // 사용 횟수 증가
    try {
      await supabase.rpc('increment', { 
        row_id: selectedTemplate.id, 
        table_name: 'notice_templates', 
        column_name: 'usage_count' 
      });
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
    
    if (mode === 'message' && shortContent) {
      onSelect(shortContent);
    } else {
      onSelect(content, shortContent);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              공지사항 템플릿 선택
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 검색 및 필터 */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="템플릿 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {Object.entries(categoryLabels).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{value.icon}</span>
                <span>{value.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* 템플릿 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              템플릿을 불러오는 중...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map((template) => {
                const category = categoryLabels[template.category] || categoryLabels.other;
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{template.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                          {category.icon} {category.label}
                        </span>
                      </div>
                      {mode === 'message' && !template.short_content && (
                        <span className="text-xs text-orange-600">메시지 버전 없음</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {mode === 'message' && template.short_content 
                        ? template.short_content 
                        : template.content}
                    </div>
                    {template.variables.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <span key={variable} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* 변수 입력 (선택된 템플릿이 있고 변수가 있을 때) */}
        {selectedTemplate && selectedTemplate.variables.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">변수 값 입력</h3>
            <div className="grid grid-cols-2 gap-3">
              {selectedTemplate.variables.map((variable) => (
                <div key={variable}>
                  <label className="block text-xs text-gray-600 mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    value={variableValues[variable] || ''}
                    onChange={(e) => setVariableValues({
                      ...variableValues,
                      [variable]: e.target.value
                    })}
                    placeholder={`{{${variable}}}`}
                    className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 액션 버튼 */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {mode === 'message' ? '메시지 선택' : '템플릿 적용'}
          </button>
        </div>
      </div>
    </div>
  );
}
