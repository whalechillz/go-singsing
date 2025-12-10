"use client";

import React from 'react';
import { Download, MessageSquare, Smartphone } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // PDF 다운로드 로직
    const element = document.getElementById('letter-content');
    if (!element) {
      alert('편지 내용을 찾을 수 없습니다.');
      return;
    }

    try {
      // 로딩 표시
      const loadingMessage = document.createElement('div');
      loadingMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 10000;';
      loadingMessage.textContent = 'PDF 생성 중...';
      document.body.appendChild(loadingMessage);

      // HTML을 Canvas로 변환 (용량 최적화: scale 1.5로 낮춤)
      const canvas = await html2canvas(element, {
        scale: 1.5, // 2에서 1.5로 낮춰 용량 감소 (약 44% 감소)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true // 불필요한 컨테이너 제거
      });

      // Canvas를 JPEG로 변환하여 용량 대폭 감소 (품질 0.85)
      const imgData = canvas.toDataURL('image/jpeg', 0.85);

      // PDF 생성
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 첫 페이지 추가 (JPEG 형식 사용)
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 여러 페이지가 필요한 경우
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 파일명 생성
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const fileName = `싱싱골프투어_손편지_${golfCourseName}_${contactName}_${dateStr}.pdf`;

      // PDF 다운로드
      pdf.save(fileName);

      // 로딩 메시지 제거
      document.body.removeChild(loadingMessage);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 액션 바 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
        <h3 className="text-white font-semibold text-lg">📝 고급 손편지 미리보기</h3>
        <div className="flex gap-1">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-sm transition-colors"
            title="PDF 다운로드"
          >
            <Download className="w-3 h-3" />
            PDF
          </button>
          <button
            onClick={handleKakaoSend}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-sm transition-colors"
            title="카카오톡 전송"
          >
            <MessageSquare className="w-3 h-3" />
            카톡
          </button>
          <button
            onClick={handleSmsSend}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-sm transition-colors"
            title="SMS 전송"
          >
            <Smartphone className="w-3 h-3" />
            SMS
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
            {(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth() + 1;
              const day = today.getDate();
              return `${year}년 ${month}월 ${day}일`;
            })()}
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
