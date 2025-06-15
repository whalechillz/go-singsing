'use client';

import React from 'react';
import { Clock, DollarSign, Flame, Star, Sunrise, Gem, Sparkles, Users } from 'lucide-react';

const BadgeDesignPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">싱싱골프 투어 뱃지 디자인 제안</h1>
      
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
        <strong className="flex items-center text-lg mb-3">
          <span className="mr-2">💡</span> 60대 시니어 여성 맞춤 디자인 포인트
        </strong>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>크고 명확한 글씨체 (16px 이상)</li>
          <li>부드러운 색상과 그라데이션</li>
          <li>이모지 활용으로 직관성 향상</li>
          <li>과도한 애니메이션 자제</li>
        </ul>
      </div>
      
      {/* 1. 기본 스타일 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">1. 기본 스타일 (젊은 감각)</h2>
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all animate-pulse">
            <Clock className="w-4 h-4" /> 마감임박
          </span>
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <DollarSign className="w-4 h-4" /> 최저가
          </span>
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <Flame className="w-4 h-4" /> 인기
          </span>
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <Star className="w-4 h-4" /> 특가
          </span>
        </div>
        <p className="text-gray-600 text-sm">그라데이션과 그림자 효과로 현대적인 느낌</p>
      </div>
      
      {/* 2. 시니어 친화적 스타일 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">2. 시니어 친화적 스타일 (추천)</h2>
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-red-50 text-red-600 border-2 border-red-600">
            <Clock className="w-4 h-4" /> 마감임박
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-green-50 text-green-600 border-2 border-green-600">
            <DollarSign className="w-4 h-4" /> 최저가
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-orange-50 text-orange-600 border-2 border-orange-600">
            <Flame className="w-4 h-4" /> 인기
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-purple-50 text-purple-600 border-2 border-purple-600">
            <Star className="w-4 h-4" /> 특가
          </span>
        </div>
        <p className="text-gray-600 text-sm">더 큰 글씨, 부드러운 색상, 명확한 테두리로 가독성 향상</p>
      </div>
      
      {/* 3. 추가 뱃지 제안 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">3. 추가 뱃지 제안</h2>
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-blue-50 text-blue-700 border-2 border-blue-700">
            <Sunrise className="w-4 h-4" /> 얼리버드
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-purple-50 text-purple-700 border-2 border-purple-700">
            <Gem className="w-4 h-4" /> 프리미엄
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-pink-50 text-pink-700 border-2 border-pink-700">
            <Sparkles className="w-4 h-4" /> 신규오픈
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-emerald-50 text-emerald-700 border-2 border-emerald-700">
            <Users className="w-4 h-4" /> 단체할인
          </span>
        </div>
      </div>
      
      {/* 4. 실제 투어 카드 적용 예시 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">4. 실제 투어 카드 적용 예시</h2>
        <div className="border-2 border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                📅 6월 16일(월) 출발
              </h3>
              <div className="space-y-2">
                <p className="text-blue-700 font-medium text-base">
                  [파인힐스] 2박3일 순천/보성 투어
                </p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-red-50 text-red-600 border-2 border-red-600">
                    <Clock className="w-4 h-4" /> 마감임박
                  </span>
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold bg-green-50 text-green-600 border-2 border-green-600">
                    <DollarSign className="w-4 h-4" /> 최저가
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium">
              잔여 2석
            </div>
          </div>
        </div>
      </div>
      
      {/* 구현 방법 제안 */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
        <strong className="flex items-center text-lg mb-3">
          <span className="mr-2">🎯</span> 구현 방법 제안
        </strong>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>자동 뱃지:</strong> 마감임박(3석 이하), 최저가(동일 지역 비교), 인기(참가율 70% 이상)</li>
          <li><strong>수동 뱃지:</strong> 특가, 얼리버드, 프리미엄 등 (관리자가 설정)</li>
          <li><strong>표시 제한:</strong> 최대 2-3개만 표시하여 복잡함 방지</li>
          <li><strong>우선순위:</strong> 마감임박 {'>'} 최저가 {'>'} 특가 {'>'} 인기 순</li>
        </ul>
      </div>
    </div>
  );
};

export default BadgeDesignPage;
