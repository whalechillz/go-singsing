"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, MapPin, Users, Calendar, Plus, Edit, Trash2, Download, Eye } from 'lucide-react';

// 문서 타입 정의
interface Document {
  id: string;
  tour_id: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// 투어 타입 정의
interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

// 문서 타입별 설정
const documentTypes = {
  'product-info': { name: '상품 정보', icon: FileText },
  'boarding-guide': { name: '탑승지 안내', icon: MapPin },
  'room-assignment': { name: '객실 배정', icon: Users },
  'rounding-timetable': { name: '라운딩 시간표', icon: Calendar },
  'boarding-guide-staff': { name: '탑승지 배정 (스탭용)', icon: MapPin },
  'room-assignment-staff': { name: '객실 배정 (스탭용)', icon: Users },
};

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isAdmin = session?.user?.user_metadata?.is_admin || false;
      setIsAdmin(isAdmin);
      if (!isAdmin) {
        router.push('/');
      }
    };

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 투어 목록 가져오기
        const { data: toursData, error: toursError } = await supabase
          .from('singsing_tours')
          .select('*')
          .order('start_date', { ascending: false });

        if (toursError) throw toursError;
        setTours(toursData || []);

        // 문서 목록 가져오기
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (documentsError) throw documentsError;
        setDocuments(documentsData || []);

      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
    fetchData();
  }, [router]);

  if (!isAdmin) {
    return null; // 리다이렉트 중
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3">데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">오류 발생</h1>
          <p className="text-gray-600">{error}</p>
        </div>
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
            새 문서 생성
          </button>
        </div>

        {/* 문서 목록 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">문서 유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">투어</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => {
                  const tour = tours.find(t => t.id === doc.tour_id);
                  const docType = documentTypes[doc.type as keyof typeof documentTypes];
                  
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {docType && (
                            <>
                              {React.createElement(docType.icon, { className: "w-5 h-5 text-blue-600 mr-2" })}
                              <span className="font-medium text-gray-900">{docType.name}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tour?.title}</div>
                        <div className="text-xs text-gray-500">
                          {tour?.start_date} ~ {tour?.end_date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.updated_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => router.push(`/document/${doc.tour_id}/${doc.type}`)}
                            title="미리보기"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => {/* 다운로드 로직 */}}
                            title="다운로드"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            className="text-yellow-600 hover:text-yellow-800"
                            onClick={() => router.push(`/admin/documents/edit/${doc.id}`)}
                            title="수정"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {/* 삭제 로직 */}}
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 