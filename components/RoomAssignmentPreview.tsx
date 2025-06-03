"use client";
import { useState } from "react";
import { X, Printer, Download, FileText } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  type: 'customer' | 'staff';
};

const RoomAssignmentPreview: React.FC<Props> = ({ isOpen, onClose, html, type }) => {
  const [driverName, setDriverName] = useState('김성팔 기사');
  const [driverPhone, setDriverPhone] = useState('010-5254-9876');
  
  if (!isOpen) return null;

  // 기사 정보 업데이트
  const updateDriverInfo = () => {
    const updatedHtml = html
      .replace(/담당: .+<\/p>/, `담당: ${driverName}</p>`)
      .replace(/연락처: [\d-]+<\/p>/, `연락처: ${driverPhone}</p>`);
    return updatedHtml;
  };

  // 인쇄 기능
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(updateDriverInfo());
      printWindow.document.close();
      printWindow.print();
    }
  };

  // 다운로드 기능
  const handleDownload = () => {
    const updatedHtml = updateDriverInfo();
    const blob = new Blob([updatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `객실배정표_${type === 'customer' ? '고객용' : '스탭용'}_${new Date().toISOString().split('T')[0]}.html`;
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
            객실 배정표 미리보기 ({type === 'customer' ? '고객용' : '스탭용'})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 기사 정보 입력 */}
        <div className="p-4 bg-gray-50 border-b flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">담당자:</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              placeholder="기사님 성함"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">연락처:</label>
            <input
              type="text"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              placeholder="010-0000-0000"
            />
          </div>
        </div>

        {/* 미리보기 영역 */}
        <div className="flex-1 overflow-auto p-4">
          <iframe
            srcDoc={updateDriverInfo()}
            className="w-full h-full border rounded"
            style={{ minHeight: '600px' }}
          />
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