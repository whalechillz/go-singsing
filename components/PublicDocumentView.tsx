"use client";

import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
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

// document_type을 DocumentType으로 매핑
const mapDocumentType = (docType: string): DocumentType => {
  const typeMap: Record<string, DocumentType> = {
    'schedule': 'customer_schedule',
    'boarding_guide': 'customer_boarding',
    'room_assignment': 'room_assignment',
    'timetable': 'customer_timetable',
    'simplified_schedule': 'simplified',
    'staff_schedule': 'staff_schedule',
    'staff_boarding': 'staff_boarding',
    'staff_room': 'room_assignment_staff',
    'staff_timetable': 'staff_timetable',
  };
  
  return typeMap[docType] || 'customer_schedule';
};

const getDocumentTitle = (docType: string): string => {
  const titleMap: Record<string, string> = {
    'schedule': '일정표',
    'boarding_guide': '탑승 안내',
    'room_assignment': '객실 배정',
    'timetable': '티타임표',
    'simplified_schedule': '간편 일정',
    'staff_schedule': '일정표 (스탭용)',
    'staff_boarding': '탑승 안내 (스탭용)',
    'staff_room': '객실 배정 (스탭용)',
    'staff_timetable': '티타임표 (스탭용)',
  };
  
  return titleMap[docType] || '문서';
};

export default function PublicDocumentView({ linkData }: PublicDocumentViewProps) {
  const tourId = linkData.tour_id;
  const documentType = mapDocumentType(linkData.document_type);
  const [activeTab] = useState<DocumentType>(documentType);
  
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
                {tourData.title} - {getDocumentTitle(linkData.document_type)}
              </h1>
              <p className="text-sm text-gray-600">
                {new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
                {' '}{new Date(tourData.end_date).toLocaleDateString('ko-KR')}
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
