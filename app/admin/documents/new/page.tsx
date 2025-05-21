"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  'tour-schedule': { name: '투어 일정표', icon: FileText },
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
  const [productUsage, setProductUsage] = useState<{ usage_hotel?: string; usage_meal?: string; usage_locker?: string }>({});
  const [mealSchedules, setMealSchedules] = useState<any[]>([]);

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

  // 투어/상품/일정 fetch 및 안내문 자동 생성
  useEffect(() => {
    const fetchProductAndSchedules = async () => {
      if (!selectedTour || selectedType !== 'room-assignment') return;
      // 투어 정보
      const { data: tour } = await supabase.from('singsing_tours').select('*').eq('id', selectedTour).single();
      if (!tour) return;
      // 상품 정보
      let usage = {};
      if (tour.tour_product_id) {
        const { data: product } = await supabase.from('tour_products').select('usage_hotel, usage_meal, usage_locker').eq('id', tour.tour_product_id).single();
        usage = product || {};
      }
      setProductUsage(usage);
      // 일정 정보(조식/중식/석식 OX, 메뉴)
      const { data: schedules } = await supabase.from('singsing_schedules').select('date, title, meal_breakfast, meal_lunch, meal_dinner, menu_breakfast, menu_lunch, menu_dinner').eq('tour_id', selectedTour).order('date', { ascending: true });
      setMealSchedules(schedules || []);
      // 안내문 자동 생성
      let html = `<h2 class='text-xl font-bold mb-2 text-blue-800'>객실 이용 안내</h2>`;
      if (usage.usage_hotel) html += `<div class='mb-4 text-gray-800'>${usage.usage_hotel.replace(/\n/g, '<br/>')}</div>`;
      html += `<h2 class='text-xl font-bold mb-2 text-blue-800'>식사 안내</h2>`;
      if (usage.usage_meal) html += `<div class='mb-4 text-gray-800'>${usage.usage_meal.replace(/\n/g, '<br/>')}</div>`;
      if (mealSchedules.length > 0) {
        html += `<table class='w-full table-auto border mb-4'><thead><tr><th class='border px-2 py-1'>날짜</th><th class='border px-2 py-1'>제목</th><th class='border px-2 py-1'>조식</th><th class='border px-2 py-1'>중식</th><th class='border px-2 py-1'>석식</th></tr></thead><tbody>`;
        mealSchedules.forEach(s => {
          html += `<tr><td class='border px-2 py-1'>${s.date || ''}</td><td class='border px-2 py-1'>${s.title || ''}</td><td class='border px-2 py-1'>${s.meal_breakfast ? 'O' : 'X'}${s.menu_breakfast ? ' (' + s.menu_breakfast + ')' : ''}</td><td class='border px-2 py-1'>${s.meal_lunch ? 'O' : 'X'}${s.menu_lunch ? ' (' + s.menu_lunch + ')' : ''}</td><td class='border px-2 py-1'>${s.meal_dinner ? 'O' : 'X'}${s.menu_dinner ? ' (' + s.menu_dinner + ')' : ''}</td></tr>`;
        });
        html += `</tbody></table>`;
      }
      if (usage.usage_locker) html += `<h2 class='text-xl font-bold mb-2 text-blue-800'>락카 이용 안내</h2><div class='mb-4 text-gray-800'>${usage.usage_locker.replace(/\n/g, '<br/>')}</div>`;
      setContent(html);
      if (editor) editor.commands.setContent(html);
    };
    fetchProductAndSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTour, selectedType]);

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