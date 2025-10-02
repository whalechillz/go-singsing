"use client";

import React from 'react';
import { Printer, Download, Share2 } from 'lucide-react';

interface PremiumLetterPreviewProps {
  content: string;
  occasion: string;
  golfCourseName: string;
  contactName: string;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function PremiumLetterPreview({
  content,
  occasion,
  golfCourseName,
  contactName,
  onPrint,
  onDownload,
  onShare
}: PremiumLetterPreviewProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // PDF 다운로드 로직
      const element = document.getElementById('letter-content');
      if (element) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>싱싱골프투어 손편지 - ${occasion}</title>
                <style>
                  @page { 
                    size: A4; 
                    margin: 2cm;
                  }
                  body { 
                    font-family: 'Noto Serif KR', serif; 
                    line-height: 1.8;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                  }
                  .letter-header {
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 20px;
                  }
                  .letter-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 10px;
                  }
                  .letter-content {
                    font-size: 16px;
                    line-height: 2;
                    white-space: pre-line;
                    margin: 30px 0;
                  }
                  .letter-footer {
                    margin-top: 50px;
                    text-align: right;
                  }
                  .date {
                    font-size: 18px;
                    color: #666;
                  }
                </style>
              </head>
              <body>
                ${element.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 액션 바 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
        <h3 className="text-white font-semibold text-lg">📝 고급 손편지 미리보기</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            title="인쇄"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            title="PDF 다운로드"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            title="공유"
          >
            <Share2 className="w-4 h-4" />
            공유
          </button>
        </div>
      </div>

      {/* 편지 내용 */}
      <div id="letter-content" className="p-8 bg-gradient-to-b from-blue-50 to-white">
        {/* 편지 헤더 */}
        <div className="letter-header text-center mb-8 border-b-2 border-blue-200 pb-6">
          <div className="letter-title text-3xl font-bold text-blue-600 mb-2">
            {occasion} 인사편지
          </div>
        </div>

        {/* 수신자 정보 */}
        <div className="mb-6 text-right">
          <div className="text-lg font-semibold text-gray-800">
            {golfCourseName} {contactName}님께
          </div>
        </div>

        {/* 편지 본문 */}
        <div className="letter-content text-gray-800 leading-relaxed whitespace-pre-line mb-8">
          {content}
        </div>

        {/* 편지 푸터 */}
        <div className="letter-footer text-right">
          <div className="date text-gray-500 text-lg">
            2025년 9월 2일
          </div>
        </div>
      </div>

      {/* 프린터 최적화 스타일 */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            font-family: 'Noto Serif KR', serif !important;
            line-height: 1.8 !important;
            color: #333 !important;
          }
          
          .letter-header {
            border-bottom: 2px solid #2563eb !important;
            margin-bottom: 40px !important;
          }
          
          .letter-content {
            font-size: 16px !important;
            line-height: 2 !important;
            margin: 30px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
