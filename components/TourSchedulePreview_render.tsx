// TourSchedulePreview 컴포넌트의 렌더링 부분
// 이 파일은 참고용으로 메인 컴포넌트의 렌더링 부분을 보여줍니다

import React from 'react';

export default function TourSchedulePreviewRender() {
  // 이 부분은 TourSchedulePreview.tsx의 return 부분입니다
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-4">
          <p>오류가 발생했습니다: {error}</p>
        </div>
      ) : !tourData ? (
        <div className="text-gray-500 text-center p-4">
          <p>투어 정보를 불러올 수 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{tourData.title}</h1>
            <p className="text-gray-600">
              {new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
              {new Date(tourData.end_date).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* 문서 탭 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
              {DOCUMENT_TYPES.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setActiveTab(doc.id)}
                  className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                    activeTab === doc.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{doc.icon}</span>
                  {doc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              인쇄
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              공유
            </button>
          </div>

          {/* 문서 미리보기 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              srcDoc={getDocumentHTML()}
              className="w-full h-screen"
              title="Document Preview"
            />
          </div>
        </>
      )}
    </div>
  );
}
