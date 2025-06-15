"use client";

import React, { useState, useEffect } from 'react';
import { Printer, RotateCw } from 'lucide-react';
import { useTourData } from '@/components/TourSchedulePreview/hooks/useTourData';
import { useDocumentHTML } from '@/components/TourSchedulePreview/hooks/useDocumentHTML';
import { DocumentType } from '@/components/TourSchedulePreview/types';

interface PublicDocumentViewProps {
  linkData: {
    tour_id: string;
    document_type: string;
    public_url: string;
    [key: string]: any;
  };
}

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

// document_type을 DocumentType으로 매핑
const mapDocumentType = (docType: string): DocumentType => {
  const typeMap: Record<string, DocumentType> = {
    // 이전 형식 (호환성)
    'schedule': 'customer_schedule',
    'boarding_guide': 'customer_boarding',
    'room_assignment': 'room_assignment',
    'timetable': 'customer_timetable',
    'simplified_schedule': 'simplified',
    
    // 현재 데이터베이스에서 사용하는 형식
    'customer_schedule': 'customer_schedule',
    'customer_boarding': 'customer_boarding',
    'customer_timetable': 'customer_timetable',
    'simplified': 'simplified',
    
    // 스탭용 문서
    'staff_schedule': 'staff_schedule',
    'staff_boarding': 'staff_boarding',
    'staff_room': 'room_assignment_staff',
    'room_assignment_staff': 'room_assignment_staff',
    'staff_timetable': 'staff_timetable',
    
    // 통합 문서
    'customer_all': 'customer_schedule', // 통합 문서는 기본값으로 일정표
    'staff_all': 'staff_schedule', // 스탭용 통합 문서는 기본값으로 스탭 일정표
    'golf_timetable': 'staff_timetable', // 골프장 전용은 스탭 티타임표
  };
  
  // 디버깅을 위한 로그
  console.log('Mapping document type:', docType, '->', typeMap[docType] || 'customer_schedule');
  
  return typeMap[docType] || 'customer_schedule';
};

const getDocumentTitle = (docType: string): string => {
  const titleMap: Record<string, string> = {
    // 이전 형식 (호환성)
    'schedule': '일정표',
    'boarding_guide': '탑승 안내',
    'room_assignment': '객실 배정',
    'timetable': '티타임표',
    'simplified_schedule': '간편 일정',
    
    // 현재 데이터베이스에서 사용하는 형식
    'customer_schedule': '일정표',
    'customer_boarding': '탑승 안내',
    'customer_timetable': '티타임표',
    'simplified': '간편 일정',
    
    // 스탭용 문서
    'staff_schedule': '일정표 (스탭용)',
    'staff_boarding': '탑승 안내 (스탭용)',
    'staff_room': '객실 배정 (스탭용)',
    'room_assignment_staff': '객실 배정 (스탭용)',
    'staff_timetable': '티타임표 (스탭용)',
    
    // 통합 문서
    'customer_all': '통합 문서',
    'staff_all': '통합 문서 (스탭용)',
    'golf_timetable': '티타임표 (골프장 전용)',
  };
  
  return titleMap[docType] || '문서';
};

export default function PublicDocumentView({ linkData }: PublicDocumentViewProps) {
  const tourId = linkData.tour_id;
  
  // 디버깅: 받은 document_type 확인
  console.log('=== PublicDocumentView Debug ===');
  console.log('Received linkData:', linkData);
  console.log('Document Type:', linkData.document_type);
  console.log('Tour ID:', linkData.tour_id);
  console.log('Public URL:', linkData.public_url);
  
  // 통합 문서 여부 확인 (먼저 확인)
  const isAllDocuments = linkData.document_type === 'customer_all' || linkData.document_type === 'staff_all';
  const isStaffDocuments = linkData.document_type === 'staff_all';
  const isGolfOnly = linkData.document_type === 'golf_timetable';
  
  // 골프장 전용일 때는 staff_timetable로 고정
  const initialDocumentType = isGolfOnly ? 'staff_timetable' : mapDocumentType(linkData.document_type);
  console.log('Initial Document Type after mapping:', initialDocumentType);
  console.log('================================');
  
  const [activeTab, setActiveTab] = useState<DocumentType>(initialDocumentType);
  
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

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    // 페이지 새로고침
    window.location.reload();
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
                {tourData.title} {!isAllDocuments && `- ${getDocumentTitle(linkData.document_type)}`}
              </h1>
              <p className="text-sm text-gray-600">
                {new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
                {' '}{new Date(tourData.end_date).toLocaleDateString('ko-KR')}
                {isGolfOnly && <span className="ml-2 text-blue-600">(골프장 전용)</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="새로고침"
              >
                <RotateCw className="w-4 h-4" />
              </button>
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
      </div>
      
      {/* 문서 선택 탭 - 통합 문서일 때만 표시 */}
      {isAllDocuments && !isGolfOnly && (
        <div className="max-w-7xl mx-auto px-4 py-4 no-print">
          <div className="flex flex-wrap gap-2">
            {(isStaffDocuments ? STAFF_DOCUMENT_TYPES : PUBLIC_DOCUMENT_TYPES).map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveTab(doc.id as DocumentType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 min-w-[120px] ${
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
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
