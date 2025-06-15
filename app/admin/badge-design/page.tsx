"use client";

import React from 'react';
import { Tag } from 'lucide-react';

export default function BadgeDesignPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">싱싱골프 투어 뱃지 디자인</h1>
      <p className="text-gray-600 mb-8">60대 시니어 여성 맞춤 뱃지 스타일 가이드</p>
      
      {/* 추천 사항 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
        <strong className="text-yellow-800">💡 60대 시니어 여성 맞춤 디자인 포인트</strong>
        <ul className="mt-2 ml-4 space-y-1 text-yellow-700">
          <li>• 크고 명확한 글씨체 (16px 이상)</li>
          <li>• 부드러운 색상과 그라데이션</li>
          <li>• 이모지 활용으로 직관성 향상</li>
          <li>• 과도한 애니메이션 자제</li>
        </ul>
      </div>

      {/* 1. 기본 스타일 (젊은 감각) */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">1. 기본 스타일 (젊은 감각)</h2>
        <div className="flex gap-3 flex-wrap mb-4">
          <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full shadow-sm animate-pulse">
            ⏰ 마감임박
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-full shadow-sm">
            💰 최저가
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-sm">
            🔥 인기
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-sm">
            ⭐ 특가
          </span>
        </div>
        <p className="text-gray-600 text-sm">그라데이션과 그림자 효과로 현대적인 느낌</p>
      </div>

      {/* 2. 시니어 친화적 스타일 (추천) */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-green-500">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          2. 시니어 친화적 스타일 <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">추천</span>
        </h2>
        <div className="flex gap-3 flex-wrap mb-4">
          <span className="px-3 py-2 bg-red-100 text-red-700 text-base font-bold rounded-full border-2 border-red-600">
            ⏰ 마감임박
          </span>
          <span className="px-3 py-2 bg-green-100 text-green-700 text-base font-bold rounded-full border-2 border-green-600">
            💰 최저가
          </span>
          <span className="px-3 py-2 bg-orange-100 text-orange-700 text-base font-bold rounded-full border-2 border-orange-600">
            🔥 인기
          </span>
          <span className="px-3 py-2 bg-purple-100 text-purple-700 text-base font-bold rounded-full border-2 border-purple-600">
            ⭐ 특가
          </span>
        </div>
        <p className="text-gray-600 text-sm">더 큰 글씨, 부드러운 색상, 명확한 테두리로 가독성 향상</p>
      </div>

      {/* 3. 추가 뱃지 제안 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">3. 추가 뱃지 제안</h2>
        <div className="flex gap-3 flex-wrap">
          <span className="px-3 py-2 bg-blue-100 text-blue-700 text-base font-bold rounded-full border-2 border-blue-600">
            🌅 얼리버드
          </span>
          <span className="px-3 py-2 bg-indigo-100 text-indigo-700 text-base font-bold rounded-full border-2 border-indigo-600">
            💎 프리미엄
          </span>
          <span className="px-3 py-2 bg-pink-100 text-pink-700 text-base font-bold rounded-full border-2 border-pink-600">
            🎉 신규오픈
          </span>
          <span className="px-3 py-2 bg-teal-100 text-teal-700 text-base font-bold rounded-full border-2 border-teal-600">
            👥 단체할인
          </span>
        </div>
      </div>

      {/* 4. 실제 투어 카드 적용 예시 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">4. 실제 투어 카드 적용 예시</h2>
        <div className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">📅 6월 16일(월) 출발</h3>
              <div className="mt-1">
                <h4 className="text-blue-700 font-medium inline">[파인힐스] 2박3일 순천/보성 투어</h4>
                <div className="inline-flex gap-1 ml-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full border border-red-600">
                    ⏰ 마감임박
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-600">
                    💰 최저가
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              잔여 2석
            </div>
          </div>
        </div>
      </div>

      {/* 구현 가이드 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
        <strong className="text-blue-800">🎯 구현 방법 제안</strong>
        <ul className="mt-2 ml-4 space-y-1 text-blue-700">
          <li><strong>자동 뱃지:</strong> 마감임박(3석 이하), 최저가(동일 지역 비교), 인기(참가율 70% 이상)</li>
          <li><strong>수동 뱃지:</strong> 특가, 얼리버드, 프리미엄 등 (관리자가 설정)</li>
          <li><strong>표시 제한:</strong> 최대 2-3개만 표시하여 복잡함 방지</li>
          <li><strong>우선순위:</strong> 마감임박 &gt; 최저가 &gt; 특가 &gt; 인기 순</li>
        </ul>
        
        <div className="mt-4 p-3 bg-white rounded-md">
          <code className="text-sm text-gray-800">
            {`.badge-senior {
  font-size: 16px;        /* 큰 글씨 */
  padding: 8px 16px;      /* 넉넉한 여백 */
  border: 2px solid;      /* 명확한 테두리 */
  border-radius: 24px;    /* 부드러운 모서리 */
}`}
          </code>
        </div>
      </div>

      {/* 뱃지 특징 설명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold mb-2 text-gray-800">🎨 색상 선택</h4>
          <p className="text-sm text-gray-600">파스텔톤의 부드러운 색상으로 눈의 피로를 줄이고, 명확한 대비로 가독성을 높였습니다.</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold mb-2 text-gray-800">📏 크기와 여백</h4>
          <p className="text-sm text-gray-600">16px 이상의 큰 글씨와 충분한 여백으로 터치하기 쉽고 읽기 편하게 디자인했습니다.</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold mb-2 text-gray-800">🔤 이모지 활용</h4>
          <p className="text-sm text-gray-600">직관적인 이모지를 함께 사용하여 텍스트를 읽지 않아도 의미를 파악할 수 있습니다.</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold mb-2 text-gray-800">🎯 우선순위 시스템</h4>
          <p className="text-sm text-gray-600">중요도에 따라 자동으로 우선순위를 정하여 가장 중요한 정보만 표시합니다.</p>
        </div>
      </div>
    </div>
  );
}