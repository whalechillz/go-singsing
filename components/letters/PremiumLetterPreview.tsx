"use client";

import React from 'react';
import { Download, MessageSquare, Smartphone } from 'lucide-react';

interface PremiumLetterPreviewProps {
  content: string;
  occasion: string;
  golfCourseName: string;
  contactName: string;
  onDownload?: () => void;
  onKakaoSend?: () => void;
  onSmsSend?: () => void;
}

export default function PremiumLetterPreview({
  content,
  occasion,
  golfCourseName,
  contactName,
  onDownload,
  onKakaoSend,
  onSmsSend
}: PremiumLetterPreviewProps) {
  const handleKakaoSend = () => {
    if (onKakaoSend) {
      onKakaoSend();
    } else {
      // 카카오톡 전송 로직
      const kakaoMessage = `[싱싱골프투어 ${occasion} 인사편지]\n\n${content}\n\n- ${golfCourseName} ${contactName}님께`;
      
      if (navigator.share) {
        navigator.share({
          title: `싱싱골프투어 ${occasion} 인사편지`,
          text: kakaoMessage
        });
      } else {
        navigator.clipboard.writeText(kakaoMessage).then(() => {
          alert('카카오톡 전송용 메시지가 클립보드에 복사되었습니다.\n카카오톡에서 붙여넣기하여 전송하세요.');
        });
      }
    }
  };

  const handleSmsSend = () => {
    if (onSmsSend) {
      onSmsSend();
    } else {
      // SMS 전송 로직
      const smsMessage = `[싱싱골프투어 ${occasion} 인사편지]\n\n${content}\n\n- ${golfCourseName} ${contactName}님께`;
      
      if (navigator.share) {
        navigator.share({
          title: `싱싱골프투어 ${occasion} 인사편지`,
          text: smsMessage
        });
      } else {
        navigator.clipboard.writeText(smsMessage).then(() => {
          alert('SMS 전송용 메시지가 클립보드에 복사되었습니다.\n문자 앱에서 붙여넣기하여 전송하세요.');
        });
      }
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
                    font-style: italic;
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
             onClick={handleDownload}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            title="PDF 파일로 다운로드합니다"
          >
            <Download className="w-4 h-4" />
            PDF 다운로드
          </button>
          <button
            onClick={handleKakaoSend}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            title="카카오톡으로 전송합니다"
          >
            <MessageSquare className="w-4 h-4" />
            카톡 전송
          </button>
          <button
            onClick={handleSmsSend}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
            title="SMS로 전송합니다"
          >
            <Smartphone className="w-4 h-4" />
            문자 전송
          </button>
        </div>
      </div>

      {/* 편지 내용 */}
      <div id="letter-content" className="p-8 bg-gradient-to-b from-blue-50 to-white">
        {/* 편지 헤더 */}
        <div className="letter-header text-center mb-8 border-b-2 border-blue-200 pb-6">
          <div className="letter-title text-3xl font-bold text-blue-600 mb-2 italic">
            {occasion === '추석' ? '가을의 정취와 함께' : 
             occasion === '설날' ? '새해의 희망과 함께' : 
             '따뜻한 마음과 함께'}
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
