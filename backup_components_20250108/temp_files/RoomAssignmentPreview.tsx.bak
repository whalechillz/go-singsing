"use client";
import { X, Printer, Download } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  type: 'staff';
  initialDriverName?: string;
  initialDriverPhone?: string;
};

const RoomAssignmentPreview: React.FC<Props> = ({ isOpen, onClose, html, type }) => {
  if (!isOpen) return null;

  // 인쇄 기능
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // 다운로드 기능
  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `객실배정표_내부용_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">
            객실 배정표 미리보기 (내부용)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 미리보기 영역 - 상하 스크롤 개선 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full w-full p-4">
            <iframe
              srcDoc={html}
              className="w-full h-full border rounded"
              style={{ 
                minHeight: 'calc(100vh - 200px)',
                height: 'calc(100vh - 200px)'
              }}
            />
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            다운로드
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomAssignmentPreview;