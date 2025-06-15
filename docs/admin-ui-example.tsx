import React from 'react';

// 예시 UI 컴포넌트
const AdminToursExample = () => {
  return (
    <div className="p-4 bg-gray-100">
      {/* 상단 빠른 필터 영역 */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex gap-2 items-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            오늘 출발
          </button>
          <button className="px-4 py-2 bg-gray-100 rounded-lg">
            이번 주 출발
          </button>
          <button className="px-4 py-2 bg-gray-100 rounded-lg">
            마감 임박
          </button>
          <div className="flex-1" />
          <label className="flex items-center px-4 py-2 bg-purple-50 rounded-lg cursor-pointer">
            <input type="checkbox" className="mr-2" />
            <span className="text-purple-700 font-medium">
              ✓ 예약 가능 투어 상단 표시
            </span>
          </label>
        </div>
      </div>
      
      {/* 검색 및 필터 영역 */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="투어명, 기사님, 골프장으로 검색..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <label className="flex items-center border rounded-lg px-4 py-2 cursor-pointer">
            <div className="w-11 h-6 bg-blue-600 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
            <span className="ml-3 font-medium">예약 가능한 투어만 (5개)</span>
          </label>
          <select className="border rounded-lg px-4 py-2">
            <option>모든 상태</option>
          </select>
          <select className="border rounded-lg px-4 py-2">
            <option>모든 기간</option>
          </select>
          <select className="border rounded-lg px-4 py-2">
            <option>날짜순</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdminToursExample;
