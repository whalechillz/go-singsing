"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, MapPin, Users, Calendar, Plus, Search, Trash2, Edit2 } from 'lucide-react';

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

// 문서 타입별 설정
const documentTypes = {
  'tour-schedule': { name: '투어 일정표', icon: FileText },
  'boarding-guide': { name: '탑승지 안내', icon: MapPin },
  'rounding-timetable': { name: '라운딩 시간표', icon: Calendar },
  'boarding-guide-staff': { name: '탑승지 배정 (스탭용)', icon: MapPin },
  'room-assignment-staff': { name: '객실 배정 (스탭용)', icon: Users },
};

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
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
        if (error) throw error;
        setDocuments(data || []);
      } catch (err) {
        setError('문서 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 문서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(id);
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      setError('문서 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.tour.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

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
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            onClick={() => router.push('/admin/documents/new')}
          >
            <Plus className="w-5 h-5 mr-2" />
            새 문서
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="투어명으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">모든 문서 유형</option>
              {Object.entries(documentTypes).map(([type, { name }]) => (
                <option key={type} value={type}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 문서 목록 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수정일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => {
                  const Icon = documentTypes[doc.type as keyof typeof documentTypes]?.icon || FileText;
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {doc.tour.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {doc.tour.start_date} ~ {doc.tour.end_date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onClick={() => router.push(`/document/${doc.tour_id}/${doc.type}`)}
                          tabIndex={0}
                          aria-label={`문서 상세: ${documentTypes[doc.type as keyof typeof documentTypes]?.name}`}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/document/${doc.tour_id}/${doc.type}`); }}
                        >
                          <Icon className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-900 underline hover:text-blue-700 transition-colors">
                            {documentTypes[doc.type as keyof typeof documentTypes]?.name}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          onClick={() => router.push(`/admin/documents/${doc.id}/edit`)}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(doc.id)}
                          disabled={isDeleting === doc.id}
                        >
                          {isDeleting === doc.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 