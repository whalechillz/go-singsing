import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Share2, Printer } from 'lucide-react';
import { useTourData } from './hooks/useTourData';
import { useDocumentHTML } from './hooks/useDocumentHTML';
import { DOCUMENT_TYPES, DocumentType } from './types';

interface TourSchedulePreviewProps {
  tourId: string;
}

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
    if (view && DOCUMENT_TYPES.some(doc => doc.id === view)) {
      setActiveTab(view as DocumentType);
    }
  }, [searchParams]);

  // 문서가 렌더링된 후 탭 기능을 위한 이벤트 리스너 추가
  useEffect(() => {
    // 탭 클릭 기능
    const handleTabClick = (e: Event) => {
      const tab = e.target as HTMLElement;
      const targetTab = tab.getAttribute('data-tab');
      if (!targetTab) return;

      const tabs = document.querySelectorAll('.usage-tab');
      const contents = document.querySelectorAll('.usage-content');
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetContent = document.querySelector(`.usage-content[data-content="${targetTab}"]`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    };

    // 이벤트 리스너 연결
    setTimeout(() => {
      const tabs = document.querySelectorAll('.usage-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', handleTabClick);
      });
    }, 100);

    // 클린업
    return () => {
      const tabs = document.querySelectorAll('.usage-tab');
      tabs.forEach(tab => {
        tab.removeEventListener('click', handleTabClick);
      });
    };
  }, [documentHTML, activeTab]);

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
    <div className="max-w-7xl mx-auto p-4">
      {/* 문서 선택 탭 */}
      <div className="mb-6 flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {DOCUMENT_TYPES.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveTab(doc.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
              activeTab === doc.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{doc.icon}</span>
            {doc.label}
          </button>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div dangerouslySetInnerHTML={{ __html: documentHTML }} />
      </div>
    </div>
  );
}
