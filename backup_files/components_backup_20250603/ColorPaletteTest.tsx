"use client"

import React from 'react';
const { colors } = require('@/styles/colors');

export default function ColorPaletteTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-singsing-text mb-8">싱싱골프투어 색상 팔레트 테스트</h1>
      
      {/* 브랜드 색상 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">브랜드 색상</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-full h-24 bg-singsing-brand rounded-lg shadow-md mb-2"></div>
            <p className="text-sm font-medium">메인 네이비</p>
            <p className="text-xs text-gray-500">{colors.brand}</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-singsing-accent rounded-lg shadow-md mb-2"></div>
            <p className="text-sm font-medium">골드 포인트</p>
            <p className="text-xs text-gray-500">{colors.accent}</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-singsing-secondary rounded-lg shadow-md mb-2"></div>
            <p className="text-sm font-medium">서브 블루</p>
            <p className="text-xs text-gray-500">{colors.secondary}</p>
          </div>
          <div className="text-center">
            <div className="w-full h-24 bg-singsing-nature rounded-lg shadow-md mb-2"></div>
            <p className="text-sm font-medium">자연 그린</p>
            <p className="text-xs text-gray-500">{colors.nature}</p>
          </div>
        </div>
      </div>
      
      {/* 버튼 예시 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">버튼 스타일</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-singsing-brand text-white rounded-lg hover:bg-blue-700 transition font-medium">
            메인 액션
          </button>
          <button className="px-6 py-3 bg-singsing-accent text-gray-900 rounded-lg hover:bg-yellow-500 transition font-medium">
            강조 액션
          </button>
          <button className="px-6 py-3 bg-singsing-secondary text-white rounded-lg hover:bg-blue-400 transition font-medium">
            보조 액션
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
            취소
          </button>
        </div>
      </div>
      
      {/* 상태 색상 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">상태 표시</h2>
        <div className="flex flex-wrap gap-4">
          <span className="px-4 py-2 bg-green-50 text-singsing-nature rounded-full font-medium">
            완료/성공
          </span>
          <span className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full font-medium">
            경고/주의
          </span>
          <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full font-medium">
            에러/마감
          </span>
          <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">
            정보/안내
          </span>
        </div>
      </div>
      
      {/* 카드 예시 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">카드 스타일</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <h3 className="text-lg font-semibold text-singsing-text mb-2">기본 카드</h3>
            <p className="text-singsing-text-secondary">호버 시 그림자가 진해집니다.</p>
          </div>
          <div className="bg-singsing-bg-soft rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <h3 className="text-lg font-semibold text-singsing-text mb-2">배경색 카드</h3>
            <p className="text-singsing-text-secondary">연한 배경색이 적용된 카드입니다.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-2 border-singsing-accent">
            <h3 className="text-lg font-semibold text-singsing-text mb-2">강조 카드</h3>
            <p className="text-singsing-text-secondary">중요한 정보를 담은 카드입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}