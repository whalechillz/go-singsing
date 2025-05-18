"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, MapPin, Users, Calendar, Save, ArrowLeft } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BoardingGuideForm from "@/components/BoardingGuideForm";
import BoardingGuidePreview from "@/components/BoardingGuidePreview";

// 문서 타입 정의
interface Document {
  id: string;
  tour_id: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

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

export default function EditDocumentPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 라운딩 시간표 하단 입력 상태
  const [rtNotices, setRtNotices] = useState<any[]>([]);
  const [rtContacts, setRtContacts] = useState<any[]>([]);
  const [rtFooter, setRtFooter] = useState<string>("");

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  // content가 바뀔 때마다 editor에 반영
  React.useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDocument(data);
        setSelectedTour(data.tour_id);
        setSelectedType(data.type);
        setContent(data.content);
      } catch (err) {
        setError('문서를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTours = async () => {
      try {
        const { data, error } = await supabase
          .from('singsing_tours')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;
        setTours(data || []);
      } catch (err) {
        setError('투어 목록을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchDocument();
    fetchTours();
  }, [id, router]);

  // 라운딩 시간표 하단 데이터 불러오기
  useEffect(() => {
    if (selectedType === 'rounding-timetable' && selectedTour) {
      supabase.from('rounding_timetable_notices').select('*').eq('tour_id', selectedTour).order('order', { ascending: true }).then(({ data }) => setRtNotices(data || []));
      supabase.from('rounding_timetable_contacts').select('*').eq('tour_id', selectedTour).then(({ data }) => setRtContacts(data || []));
      supabase.from('rounding_timetable_footers').select('*').eq('tour_id', selectedTour).single().then(({ data }) => setRtFooter(data?.footer || ""));
    }
  }, [selectedType, selectedTour]);

  // 라운딩 시간표 하단 입력 핸들러
  const handleRtNoticeChange = (i: number, value: string) => setRtNotices(n => n.map((item, idx) => idx === i ? { ...item, notice: value } : item));
  const handleRtNoticeAdd = () => setRtNotices(n => [...n, { notice: '', order: n.length }]);
  const handleRtNoticeDelete = (i: number) => setRtNotices(n => n.filter((_, idx) => idx !== i).map((item, idx) => ({ ...item, order: idx })));

  const handleRtContactChange = (i: number, key: string, value: string) => setRtContacts(c => c.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  const handleRtContactAdd = () => setRtContacts(c => [...c, { name: '', phone: '', role: '' }]);
  const handleRtContactDelete = (i: number) => setRtContacts(c => c.filter((_, idx) => idx !== i));

  // 저장 로직 확장
  const handleSave = useCallback(async () => {
    if (!selectedTour || !selectedType || (selectedType !== 'rounding-timetable' && !content)) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    try {
      setIsSaving(true);
      if (selectedType === 'rounding-timetable') {
        // notices
        await supabase.from('rounding_timetable_notices').delete().eq('tour_id', selectedTour);
        if (rtNotices.length > 0) {
          await supabase.from('rounding_timetable_notices').insert(rtNotices.map((n, i) => ({ ...n, tour_id: selectedTour, order: i })));
        }
        // contacts
        await supabase.from('rounding_timetable_contacts').delete().eq('tour_id', selectedTour);
        if (rtContacts.length > 0) {
          await supabase.from('rounding_timetable_contacts').insert(rtContacts.map(c => ({ ...c, tour_id: selectedTour })));
        }
        // footer
        await supabase.from('rounding_timetable_footers').delete().eq('tour_id', selectedTour);
        if (rtFooter) {
          await supabase.from('rounding_timetable_footers').insert([{ tour_id: selectedTour, footer: rtFooter }]);
        }
        router.push('/admin/documents');
        return;
      }
      // 기존 문서 저장 로직
      const { error } = await supabase
        .from('documents')
        .update({
          tour_id: selectedTour,
          type: selectedType,
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      router.push('/admin/documents');
    } catch (err) {
      setError('문서 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedTour, selectedType, content, id, router, rtNotices, rtContacts, rtFooter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3">데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">문서를 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 문서가 존재하지 않습니다.</p>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-800">문서 수정</h1>
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
                    {name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* BoardingGuideForm & Preview: boarding-guide 유형일 때만 노출 */}
          {selectedType === "boarding-guide" && selectedTour && (
            <>
              <BoardingGuideForm tourId={selectedTour} />
              <div className="mb-8" />
              <BoardingGuidePreview tourId={selectedTour} />
            </>
          )}

          {/* 라운딩 시간표 하단 입력 UI */}
          {selectedType === "rounding-timetable" && selectedTour && (
            <div className="mb-8">
              <h3 className="font-bold mb-2">라운딩 주의사항</h3>
              {rtNotices.map((n, i) => (
                <div key={n.id || i} className="flex gap-2 mb-1">
                  <textarea
                    className="flex-1 border rounded px-2 py-1 resize-y min-h-[40px]"
                    value={n.notice}
                    onChange={e => handleRtNoticeChange(i, e.target.value)}
                    rows={2}
                  />
                  <button onClick={() => handleRtNoticeDelete(i)} className="text-red-500">삭제</button>
                </div>
              ))}
              <button onClick={handleRtNoticeAdd} className="text-blue-600 text-sm mt-1">+ 추가</button>
              <h3 className="font-bold mt-6 mb-2">비상 연락처</h3>
              {rtContacts.map((c, i) => (
                <div key={c.id || i} className="flex gap-2 mb-1">
                  <input className="border rounded px-2 py-1 w-32" placeholder="이름" value={c.name} onChange={e => handleRtContactChange(i, 'name', e.target.value)} />
                  <input className="border rounded px-2 py-1 w-32" placeholder="역할" value={c.role} onChange={e => handleRtContactChange(i, 'role', e.target.value)} />
                  <input className="border rounded px-2 py-1 w-40" placeholder="전화번호" value={c.phone} onChange={e => handleRtContactChange(i, 'phone', e.target.value)} />
                  <button onClick={() => handleRtContactDelete(i)} className="text-red-500">삭제</button>
                </div>
              ))}
              <button onClick={handleRtContactAdd} className="text-blue-600 text-sm mt-1">+ 추가</button>
              <h3 className="font-bold mt-6 mb-2">푸터</h3>
              <textarea
                className="border rounded px-2 py-1 w-full resize-y min-h-[40px]"
                value={rtFooter}
                onChange={e => setRtFooter(e.target.value)}
                rows={2}
                placeholder="푸터 내용 입력"
              />
            </div>
          )}

          {/* 내용 작성: boarding-guide/room-assignment 등 기타 문서 유형 */}
          {selectedType !== "boarding-guide" && selectedType !== "rounding-timetable" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문서 내용
              </label>
              <div className="border rounded-lg min-h-[24rem] bg-white">
                <EditorContent editor={editor} className="prose max-w-none min-h-[22rem] p-4 outline-none" />
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving || !selectedTour || !selectedType || (selectedType !== 'rounding-timetable' && !content)}
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