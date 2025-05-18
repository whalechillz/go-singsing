"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, MapPin, Users, Calendar, Save, ArrowLeft } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// 문서 타입 정의
interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

// 문서 타입별 설정
const documentTypes = {
  'product-info': { name: '상품 정보 (일정표)', icon: FileText },
  'boarding-guide': { name: '탑승지 안내', icon: MapPin },
  'room-assignment': { name: '객실 배정', icon: Users },
  'rounding-timetable': { name: '라운딩 시간표', icon: Calendar },
  'boarding-guide-staff': { name: '탑승지 배정 (스탭용)', icon: MapPin },
  'room-assignment-staff': { name: '객실 배정 (스탭용)', icon: Users },
};

export default function NewDocumentPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('singsing_tours')
          .select('*')
          .order('start_date', { ascending: false });
        if (error) throw error;
        setTours(data || []);
      } catch (err) {
        setError('투어 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, [router]);

  const handleSave = async () => {
    if (!selectedTour || !selectedType || !content) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('documents')
        .insert([
          {
            tour_id: selectedTour,
            type: selectedType,
            content: content,
          }
        ]);

      if (error) throw error;
      router.push('/admin/documents');
    } catch (err) {
      setError('문서 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            className="mr-4 text-gray-600 hover:text-gray-800"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">새 문서 생성</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* 투어 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              투어 선택
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedTour}
              onChange={(e) => setSelectedTour(e.target.value)}
            >
              <option value="">투어를 선택하세요</option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.title} ({tour.start_date} ~ {tour.end_date})
                </option>
              ))}
            </select>
          </div>

          {/* 문서 유형 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문서 유형
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(documentTypes).map(([type, { name, icon: Icon }]) => (
                <button
                  key={type}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">{name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 내용 작성 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문서 내용
            </label>
            <div className="border rounded-lg min-h-[24rem] bg-white">
              <EditorContent editor={editor} className="prose max-w-none min-h-[22rem] p-4 outline-none" />
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving || !selectedTour || !selectedType || !content}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  저장
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 