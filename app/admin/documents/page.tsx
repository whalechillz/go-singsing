"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, MapPin, Users, Calendar, Plus, Search, Trash2, Edit2, Copy, Settings, Eye, Save } from 'lucide-react';
import DocumentNoticeManager from '@/components/DocumentNoticeManager';

// 문서 타입 정의
interface Document {
  id: string;
  tour_id: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
  tour: {
    title: string;
    start_date: string;
    end_date: string;
  };
}

interface DocumentTemplate {
  id: string;
  template_name: string;
  document_type: string;
  content_blocks: any[];
  is_default: boolean;
}

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

// 문서 타입별 설정
const DOCUMENT_TYPES = [
  { value: 'customer_schedule', label: '고객용 일정표', icon: '📋' },
  { value: 'customer_boarding', label: '고객용 탑승안내서', icon: '🚌' },
  { value: 'staff_boarding', label: '스탭용 탑승안내서', icon: '👥' },
  { value: 'room_assignment', label: '객실 배정표', icon: '🏨' },
  { value: 'tee_time', label: '티타임표', icon: '⛳' },
  { value: 'simplified', label: '간편 일정표', icon: '📄' }
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'templates' | 'tour-notices'>('documents');
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    document_type: 'customer_schedule',
    content_blocks: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 문서 목록 가져오기
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select(`
          *,
          tour:singsing_tours (
            title,
            start_date,
            end_date
          )
        `)
        .order('created_at', { ascending: false });
      
      if (docsError) throw docsError;
      setDocuments(docsData || []);

      // 템플릿 목록 가져오기
      const { data: templatesData, error: templatesError } = await supabase
        .from('document_templates')
        .select('*')
        .order('document_type, template_name');
      
      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // 투어 목록 가져오기
      const { data: toursData, error: toursError } = await supabase
        .from('singsing_tours')
        .select('id, title, start_date, end_date')
        .order('start_date', { ascending: false })
        .limit(20);
      
      if (toursError) throw toursError;
      setTours(toursData || []);
      
      // 첫 번째 투어 자동 선택
      if (toursData && toursData.length > 0 && !selectedTour) {
        setSelectedTour(toursData[0].id);
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .insert([newTemplate]);
      
      if (error) throw error;
      
      setShowTemplateModal(false);
      setNewTemplate({
        template_name: '',
        document_type: 'customer_schedule',
        content_blocks: []
      });
      fetchData();
    } catch (err) {
      setError('템플릿 생성 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      setError('템플릿 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSetDefaultTemplate = async (id: string, documentType: string) => {
    try {
      // 같은 타입의 모든 템플릿의 is_default를 false로
      await supabase
        .from('document_templates')
        .update({ is_default: false })
        .eq('document_type', documentType);
      
      // 선택한 템플릿을 기본값으로 설정
      const { error } = await supabase
        .from('document_templates')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
      fetchData();
    } catch (err) {
      setError('기본 템플릿 설정 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3">데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">문서 관리</h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'documents' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('documents')}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                문서 목록
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'templates' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('templates')}
              >
                <Copy className="w-4 h-4 inline mr-2" />
                템플릿 관리
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'tour-notices' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('tour-notices')}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                투어별 공지사항
              </button>
            </div>
          </div>
        </div>

        {/* 문서 목록 탭 */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">생성된 문서</h2>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  onClick={() => router.push('/admin/documents/new')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  새 문서
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        투어
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        문서 유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => {
                      const docType = DOCUMENT_TYPES.find(t => t.value === doc.type);
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {doc.tour.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(doc.tour.start_date).toLocaleDateString('ko-KR')} ~ 
                              {new Date(doc.tour.end_date).toLocaleDateString('ko-KR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-2xl mr-2">{docType?.icon}</span>
                            <span className="text-sm text-gray-900">{docType?.label}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              onClick={() => router.push(`/document/${doc.tour_id}/${doc.type}`)}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900 mr-4"
                              onClick={() => router.push(`/admin/documents/${doc.id}/edit`)}
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => console.log('Delete document', doc.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 템플릿 관리 탭 */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">문서 템플릿</h2>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  onClick={() => setShowTemplateModal(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  새 템플릿
                </button>
              </div>

              {DOCUMENT_TYPES.map(docType => {
                const typeTemplates = templates.filter(t => t.document_type === docType.value);
                
                return (
                  <div key={docType.value} className="mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="text-2xl mr-2">{docType.icon}</span>
                      {docType.label}
                    </h3>
                    
                    {typeTemplates.length === 0 ? (
                      <p className="text-gray-500 text-sm ml-10">템플릿이 없습니다.</p>
                    ) : (
                      <div className="grid gap-3 ml-10">
                        {typeTemplates.map(template => (
                          <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {template.template_name}
                                  {template.is_default && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                      기본
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {template.content_blocks.length}개의 콘텐츠 블록
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {!template.is_default && (
                                  <button
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    onClick={() => handleSetDefaultTemplate(template.id, template.document_type)}
                                  >
                                    기본으로 설정
                                  </button>
                                )}
                                <button
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 투어별 공지사항 탭 */}
        {activeTab === 'tour-notices' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                투어 선택
              </label>
              <select
                value={selectedTour}
                onChange={(e) => setSelectedTour(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">투어를 선택하세요</option>
                {tours.map(tour => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title} ({new Date(tour.start_date).toLocaleDateString('ko-KR')})
                  </option>
                ))}
              </select>
            </div>

            {selectedTour && (
              <DocumentNoticeManager 
                tourId={selectedTour} 
                onSave={() => {
                  // 저장 후 처리
                  console.log('Notices saved');
                }}
              />
            )}
          </div>
        )}

        {/* 템플릿 생성 모달 */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">새 템플릿 만들기</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    템플릿 이름
                  </label>
                  <input
                    type="text"
                    value={newTemplate.template_name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 기본 고객용 일정표"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    문서 유형
                  </label>
                  <select
                    value={newTemplate.document_type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, document_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {DOCUMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}