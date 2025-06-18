'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Plus, Edit2, Trash2, Copy, MessageCircle, ChevronRight, Search, X, Check } from 'lucide-react';

interface NoticeTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  short_content: string | null;
  variables: string[];
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export default function NoticeTemplatesPage() {
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NoticeTemplate | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    content: '',
    short_content: '',
    variables: [] as string[]
  });
  
  // 변수 입력 상태
  const [variableInput, setVariableInput] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notice_templates')
        .select('*')
        .order('usage_count', { ascending: false });
        
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('템플릿을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        // 수정
        const { error } = await supabase
          .from('notice_templates')
          .update({
            title: formData.title,
            category: formData.category,
            content: formData.content,
            short_content: formData.short_content || null,
            variables: formData.variables
          })
          .eq('id', editingTemplate.id);
          
        if (error) throw error;
        alert('템플릿이 수정되었습니다.');
      } else {
        // 생성
        const { error } = await supabase
          .from('notice_templates')
          .insert({
            title: formData.title,
            category: formData.category,
            content: formData.content,
            short_content: formData.short_content || null,
            variables: formData.variables
          });
          
        if (error) throw error;
        alert('템플릿이 생성되었습니다.');
      }
      
      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('템플릿 저장 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (template: NoticeTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      category: template.category,
      content: template.content,
      short_content: template.short_content || '',
      variables: template.variables || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('notice_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      alert('템플릿이 삭제되었습니다.');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('템플릿 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('notice_templates')
        .update({ is_active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling template status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const addVariable = () => {
    if (variableInput && !formData.variables.includes(variableInput)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput]
      });
      setVariableInput('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable)
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'other',
      content: '',
      short_content: '',
      variables: []
    });
    setEditingTemplate(null);
    setVariableInput('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('템플릿이 클립보드에 복사되었습니다.');
  };

  const incrementUsageCount = async (id: string) => {
    try {
      await supabase.rpc('increment', { row_id: id, table_name: 'notice_templates', column_name: 'usage_count' });
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  };

  // 필터링된 템플릿
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory && template.is_active;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">공지사항 템플릿 관리</h1>
        <p className="text-gray-600">
          자주 사용하는 공지사항을 템플릿으로 관리하고 빠르게 활용하세요.
        </p>
      </div>

      {/* 상단 컨트롤 */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 템플릿 만들기
          </button>
        </div>
        
        {/* 검색 및 필터 */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
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
              className={`px-4 py-2 rounded-lg transition-colors ${
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
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
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
      </div>

      {/* 템플릿 목록 */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-8 rounded-lg text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => {
            const category = categoryLabels[template.category] || categoryLabels.other;
            
            return (
              <div key={template.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{template.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                          {category.icon} {category.label}
                        </span>
                        {template.usage_count > 0 && (
                          <span className="text-xs text-gray-500">
                            사용 {template.usage_count}회
                          </span>
                        )}
                      </div>
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>변수:</span>
                          {template.variables.map((variable) => (
                            <span key={variable} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(template.id, template.is_active)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title={template.is_active ? '비활성화' : '활성화'}
                      >
                        {template.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 내용 미리보기 */}
                  <div className="mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                      {template.content}
                    </div>
                    {showPreview === template.id && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                        {template.content}
                      </div>
                    )}
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        copyToClipboard(template.content);
                        incrementUsageCount(template.id);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      전체 복사
                    </button>
                    {template.short_content && (
                      <button
                        onClick={() => {
                          copyToClipboard(template.short_content || '');
                          incrementUsageCount(template.id);
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        메시지용 복사
                      </button>
                    )}
                    <button
                      onClick={() => setShowPreview(showPreview === template.id ? null : template.id)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${showPreview === template.id ? 'rotate-90' : ''}`} />
                      {showPreview === template.id ? '접기' : '전체보기'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {editingTemplate ? '템플릿 수정' : '새 템플릿 만들기'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    템플릿 제목 *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* 카테고리 */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(categoryLabels).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.icon} {value.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 내용 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    템플릿 내용 *
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="공지사항 내용을 입력하세요..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    변수는 {`{{변수명}}`} 형식으로 입력하세요. 예: {`{{manager_phone}}`}
                  </p>
                </div>
                
                {/* 짧은 내용 (메시지용) */}
                <div>
                  <label htmlFor="short_content" className="block text-sm font-medium text-gray-700 mb-1">
                    메시지용 짧은 버전 (선택)
                  </label>
                  <textarea
                    id="short_content"
                    value={formData.short_content}
                    onChange={(e) => setFormData({ ...formData, short_content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="카카오톡이나 문자 발송용 짧은 버전..."
                  />
                </div>
                
                {/* 변수 관리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    치환 변수 설정
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={variableInput}
                      onChange={(e) => setVariableInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                      placeholder="변수명 입력 (예: manager_phone)"
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addVariable}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      추가
                    </button>
                  </div>
                  {formData.variables.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                        >
                          {`{{${variable}}}`}
                          <button
                            type="button"
                            onClick={() => removeVariable(variable)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingTemplate ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
