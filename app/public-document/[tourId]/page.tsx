'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Printer } from 'lucide-react';
import { useTourData } from '@/components/TourSchedulePreview/hooks/useTourData';
import { useDocumentHTML } from '@/components/TourSchedulePreview/hooks/useDocumentHTML';
import { DOCUMENT_TYPES, DocumentType } from '@/components/TourSchedulePreview/types';

const PUBLIC_DOCUMENT_TYPES = [
  { id: 'customer_schedule', label: '일정표', icon: '📋' },
  { id: 'customer_boarding', label: '탑승안내', icon: '🚌' },
  { id: 'room_assignment', label: '객실배정', icon: '🏨' },
  { id: 'customer_timetable', label: '티타임표', icon: '⛳' },
  { id: 'simplified', label: '간편일정', icon: '📄' }
] as const;

const STAFF_DOCUMENT_TYPES = [
  { id: 'staff_schedule', label: '일정표 (스탭용)', icon: '📋' },
  { id: 'staff_boarding', label: '탑승안내 (스탭용)', icon: '🚌' },
  { id: 'room_assignment_staff', label: '객실배정 (스탭용)', icon: '🏨' },
  { id: 'staff_timetable', label: '티타임표 (스탭용)', icon: '⛳' }
] as const;

const getDocumentLabel = (docType: DocumentType): string => {
  const allTypes = [...PUBLIC_DOCUMENT_TYPES, ...STAFF_DOCUMENT_TYPES];
  const doc = allTypes.find(d => d.id === docType);
  
  // 기타 문서 타입에 대한 라벨
  const otherLabels: Record<string, string> = {
    'customer_schedule': '일정표',
    'staff_schedule': '일정표 (스탭용)',
    'customer_boarding': '탑승안내',
    'staff_boarding': '탑승안내 (스탭용)',
    'room_assignment': '객실배정',
    'room_assignment_staff': '객실배정 (스탭용)',
    'customer_timetable': '티타임표',
    'staff_timetable': '티타임표 (스탭용)',
    'simplified': '간편일정'
  };
  
  return doc?.label || otherLabels[docType] || docType;
};

export default function PublicDocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tourId = params.tourId as string;
  const isStaff = searchParams.get('staff') === 'true';
  const isGolf = searchParams.get('golf') === 'true';
  const singleDocType = searchParams.get('single'); // 개별 문서 타입
  const [activeTab, setActiveTab] = useState<DocumentType>('customer_schedule');
  
  const {
    tourData,
    productData,
    loading,
    tourBoardingPlaces,
    tourWaypoints,
    journeyItems
  } = useTourData(tourId);
  
  const documentHTML = useDocumentHTML({
    activeTab,
    tourData,
    productData,
    tourBoardingPlaces,
    tourWaypoints,
    journeyItems,
    tourId
  });

  // 초기 탭 설정 및 URL 해시 처리
  useEffect(() => {
    const handleHashChange = () => {
      // 개별 문서 모드일 때
      if (singleDocType) {
        setActiveTab(singleDocType as DocumentType);
        return;
      }
      
      // 골프장 전용 모드일 때는 티타임표로 고정
      if (isGolf) {
        setActiveTab('staff_timetable');
        return;
      }
      
      const hash = window.location.hash.slice(1); // # 제거
      
      switch (hash) {
        case 'boarding':
          setActiveTab(isStaff ? 'staff_boarding' : 'customer_boarding');
          break;
        case 'room':
          setActiveTab(isStaff ? 'room_assignment_staff' : 'room_assignment');
          break;
        case 'timetable':
          setActiveTab(isStaff ? 'staff_timetable' : 'customer_timetable');
          break;
        case 'simplified':
          setActiveTab('simplified');
          break;
        default:
          setActiveTab(isStaff ? 'staff_schedule' : 'customer_schedule');
      }
    };
    
    // 초기 로드시 해시 체크
    handleHashChange();
    
    // 해시 변경 이벤트 리스너
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isStaff, isGolf, singleDocType]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">문서를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            유효하지 않은 문서이거나<br/>
            삭제된 문서입니다.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            문의: 031-215-3990
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {isGolf ? `${tourData.title} - 티타임표` : 
                 singleDocType ? `${tourData.title} - ${getDocumentLabel(activeTab)}` :
                 tourData.title}
              </h1>
              <p className="text-sm text-gray-600">
                {new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
                {' '}{new Date(tourData.end_date).toLocaleDateString('ko-KR')}
                {isGolf && <span className="ml-2 text-blue-600">(골프장 전용)</span>}
                {singleDocType && <span className="ml-2 text-blue-600">(개별 문서)</span>}
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              인쇄
            </button>
          </div>
        </div>
      </div>

      {/* 문서 선택 탭 - 골프장 전용이거나 개별 문서일 때는 숨김 */}
      {!isGolf && !singleDocType && (
        <div className="max-w-7xl mx-auto px-4 py-4 no-print">
          <div className="flex flex-wrap gap-2">
            {(isStaff ? STAFF_DOCUMENT_TYPES : PUBLIC_DOCUMENT_TYPES).map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveTab(doc.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === doc.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <span className="mr-2">{doc.icon}</span>
                {doc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 문서 내용 */}
      <div className="max-w-7xl mx-auto px-4 pb-8 print:p-0">
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
          <div dangerouslySetInnerHTML={{ __html: documentHTML }} />
        </div>
      </div>

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}