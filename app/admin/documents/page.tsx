"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, MapPin, Users, Calendar, Plus, Search, Trash2, Edit2, Settings, Eye, Save } from 'lucide-react';
// DocumentNoticeManager 제거됨

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

// Template 기능은 현재 사용하지 않음 (테이블 없음)

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
  // const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'tour-notices'>('documents');
  const [selectedTour, setSelectedTour] = useState<string>('');
  // Template 모달 관련 상태는 현재 사용하지 않음

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

      // 템플릿 기능은 현재 사용하지 않음 (테이블 없음)

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

  // 템플릿 관련 함수들은 현재 사용하지 않음

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
              {/* 템플릿 관리 탭은 현재 사용하지 않음 */}
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

        {/* 템플릿 관리 기능은 현재 사용하지 않음 */}

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
              <div className="p-6 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">투어별 공지사항 관리</h3>
                <p className="text-gray-600">
                  투어별 공지사항은 투어 관리 &gt; 일정 관리에서 설정할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 템플릿 생성 모달은 현재 사용하지 않음 */}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}