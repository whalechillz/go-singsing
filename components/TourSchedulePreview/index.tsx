import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Share2, Printer } from 'lucide-react';
import { useTourData } from './hooks/useTourData';
import { useDocumentHTML } from './hooks/useDocumentHTML';
import { DocumentType } from './types';

interface TourSchedulePreviewProps {
  tourId: string;
}

// 고객용과 스탭용 문서 분리
const CUSTOMER_DOCUMENTS = [
  { id: 'customer_schedule', label: '일정표', icon: '📋' },
  { id: 'customer_boarding', label: '탑승안내', icon: '🚌' },
  { id: 'room_assignment', label: '객실배정', icon: '🏨' },
  { id: 'customer_timetable', label: '티타임표', icon: '⛳' },
  { id: 'simplified', label: '간편일정', icon: '📄' }
] as const;

const STAFF_DOCUMENTS = [
  { id: 'staff_schedule', label: '일정표', icon: '📋' },
  { id: 'staff_boarding', label: '탑승안내', icon: '👥' },
  { id: 'room_assignment_staff', label: '객실배정', icon: '🏨' },
  { id: 'staff_timetable', label: '티타임표', icon: '⛳' }
] as const;

export default function TourSchedulePreview({ tourId }: TourSchedulePreviewProps) {
  const [activeTab, setActiveTab] = useState<DocumentType>('customer_schedule');
  const searchParams = useSearchParams();
  
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

  // URL 파라미터로 뷰 자동 선택
  useEffect(() => {
    const view = searchParams.get('view');
    const allDocuments = [...CUSTOMER_DOCUMENTS, ...STAFF_DOCUMENTS];
    if (view && allDocuments.some(doc => doc.id === view)) {
      setActiveTab(view as DocumentType);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const blob = new Blob([documentHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tourData?.title}_${activeTab}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tourData?.title,
        text: `${tourData?.title} 문서`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="max-w-full lg:max-w-7xl mx-auto p-2 sm:p-4">
      {/* 문서 선택 탭 - 고객용과 스탭용 분리 */}
      <div className="mb-3 sm:mb-6 space-y-2 sm:space-y-3">
        {/* 고객용 문서 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">고객용 문서</h3>
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {CUSTOMER_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveTab(doc.id as DocumentType)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors flex-shrink-0 text-sm sm:text-base ${
                  activeTab === doc.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <span className="mr-2">{doc.icon}</span>
                {doc.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 스탭용 문서 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">스탭용 문서</h3>
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {STAFF_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveTab(doc.id as DocumentType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                  activeTab === doc.id
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <span className="mr-2">{doc.icon}</span>
                {doc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-3 sm:mb-4 flex gap-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm sm:text-base"
        >
          <Printer className="w-4 h-4" />
          인쇄
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <Download className="w-4 h-4" />
          다운로드
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <Share2 className="w-4 h-4" />
          공유
        </button>
      </div>

      {/* 문서 미리보기 */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 lg:p-8">
        <div dangerouslySetInnerHTML={{ __html: documentHTML }} />
      </div>
    </div>
  );
}
