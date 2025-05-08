"use client";

import { useState } from "react";

const CARD_LIST = [
  {
    key: "product-info",
    title: "상품 정보",
    description: "일정, 식사, 골프장, 숙박 안내",
    number: 1,
    fileName: "product-info.html",
    locked: false,
  },
  {
    key: "boarding-guide",
    title: "탑승지 안내",
    description: "탑승 시간, 위치, 주차 정보",
    number: 2,
    fileName: "boarding-guide.html",
    locked: false,
  },
  {
    key: "room-assignment-customer",
    title: "객실 배정",
    description: "팀 명단 및 객실 배정표",
    number: 3,
    fileName: "room-assignment.html",
    locked: false,
  },
  {
    key: "rounding-timetable",
    title: "라운딩 시간표",
    description: "일자별 티오프 시간 및 조 편성",
    number: 4,
    fileName: "rounding-timetable.html",
    locked: false,
  },
  {
    key: "boarding-guide-staff",
    title: "탑승지 배정 (스탭용)",
    description: "스탭용 탑승지 정보",
    number: 5,
    fileName: "boarding-guide-staff.html",
    locked: true,
  },
  {
    key: "room-assignment-staff",
    title: "객실 배정 (스탭용)",
    description: "스탭용 객실 배정 정보",
    number: 6,
    fileName: "room-assignment-staff.html",
    locked: true,
  },
];

const STAFF_PASSWORD = "singsinggolf2025";
const tourId = "2025-05-19";

export default function TourPage() {
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const handleCardClick = (card: typeof CARD_LIST[number]) => {
    if (card.locked) {
      setTargetUrl(`/${card.fileName}`);
      setShowPwModal(true);
      setPwInput("");
      setPwError("");
    } else {
      window.open(`/${card.fileName}`, "_blank");
    }
  };

  const handlePwSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pwInput === STAFF_PASSWORD) {
      if (targetUrl) window.open(targetUrl, "_blank");
      setShowPwModal(false);
      setPwInput("");
      setPwError("");
    } else {
      setPwError("비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-800 text-white p-6 text-center">
          <div className="text-2xl font-bold mb-1">싱싱골프투어</div>
          <div className="text-base">순천 2박3일 / 05/19(월)~21(수)</div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {CARD_LIST.map((card: typeof CARD_LIST[number]) => (
            <button
              key={card.key}
              className={`w-full rounded-lg border shadow transition-all text-left focus:outline-none ${card.locked ? 'bg-blue-800 text-white' : 'bg-white'} hover:shadow-lg`}
              onClick={() => handleCardClick(card)}
              tabIndex={0}
              aria-label={card.title + (card.locked ? ' (스탭용, 비밀번호 필요)' : '')}
            >
              <div className={`flex items-center justify-between px-4 py-3 ${card.locked ? '' : 'bg-blue-800 text-white rounded-t-lg'}`}>
                <span className="font-bold text-base flex items-center">
                  {card.title} {card.locked && <span className="ml-1">🔒</span>}
                </span>
                <span className={`rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm ${card.locked ? 'bg-white text-blue-800' : 'bg-blue-800 text-white'}`}>{card.number}</span>
              </div>
              <div className={`px-4 pb-3 text-sm ${card.locked ? 'text-white' : 'text-gray-700'}`}>{card.description}</div>
            </button>
          ))}
        </div>
        <div className="bg-gray-100 rounded-lg mx-4 my-6 p-4 text-center">
          <div className="font-bold text-blue-800 mb-1">담당 기사님</div>
          <div className="font-bold text-red-600 text-lg">010-5254-9876</div>
        </div>
        <div className="bg-blue-800 text-white text-center py-2 text-sm">싱싱골프투어 | 031-215-3990</div>
      </div>
      {showPwModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg p-8 w-full max-w-xs shadow-lg relative" onSubmit={handlePwSubmit}>
            <div className="text-lg font-bold text-blue-800 mb-4 text-center">스탭 전용 페이지</div>
            <input
              type="password"
              className="border rounded px-2 py-2 w-full mb-2"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              placeholder="비밀번호 입력"
              autoFocus
            />
            {pwError && <div className="text-red-500 text-sm mb-2">{pwError}</div>}
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded w-full">확인</button>
              <button type="button" className="bg-gray-300 text-gray-800 px-4 py-2 rounded w-full" onClick={() => setShowPwModal(false)}>취소</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}