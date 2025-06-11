"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Sparkles, PenTool, Zap, Globe, Briefcase } from 'lucide-react';
import RainbowText from '@/components/ui/RainbowText';

export default function FontStylesPage() {
  const [selectedStyle, setSelectedStyle] = React.useState<string>('rainbow');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">폰트 스타일 가이드</h1>
      <p className="text-gray-600 mb-8">싱싱골프투어 폰트 디자인 시스템</p>
      
      {/* 폰트 스타일 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* A그룹: 무지개빛 그라데이션 */}
        <Card 
          className={`cursor-pointer transition-all ${selectedStyle === 'rainbow' ? 'ring-2 ring-purple-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSelectedStyle('rainbow')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle className="text-lg">A그룹: 무지개빛 폰트</CardTitle>
                <CardDescription>화려한 그라데이션 효과</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <RainbowText text="Gemini 스타일" variant="gemini" className="text-sm" />
              <RainbowText text="Apple 스타일" variant="apple" className="text-sm" />
              <RainbowText text="애니메이션" variant="animated" className="text-sm" />
              <RainbowText text="네온 효과" variant="neon" className="text-sm" />
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">🌈 C그룹 무지개빛 그라데이션 예시:</p>
              <div className="space-y-1">
                <p className="text-xs bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent font-bold">빨강 → 노랑</p>
                <p className="text-xs bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent font-bold">초록 → 파랑</p>
                <p className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">보라 → 분홍</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <strong>적합한 용도:</strong>
              <ul className="mt-1">
                <li>• 프로모션 타이틀</li>
                <li>• 이벤트 배너</li>
                <li>• 강조 텍스트</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* B그룹: 필기체 + 연한색 */}
        <Card 
          className={`cursor-pointer transition-all ${selectedStyle === 'script' ? 'ring-2 ring-pink-400 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSelectedStyle('script')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <PenTool className="w-8 h-8 text-pink-400" />
              <div>
                <CardTitle className="text-lg">B그룹: 필기체 스타일</CardTitle>
                <CardDescription>부드럽고 우아한 느낌</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-pink-300" style={{ fontFamily: 'cursive', fontSize: '18px' }}>감사 인사말</p>
              <p className="text-purple-300" style={{ fontFamily: 'cursive', fontSize: '18px' }}>초대장 문구</p>
              <p className="text-blue-300" style={{ fontFamily: 'cursive', fontSize: '18px' }}>축하 메시지</p>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <strong>적합한 용도:</strong>
              <ul className="mt-1">
                <li>• 감사장/초대장</li>
                <li>• 인사말</li>
                <li>• 감성적 문구</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* C그룹: 강렬한 포인트 */}
        <Card 
          className={`cursor-pointer transition-all ${selectedStyle === 'bold' ? 'ring-2 ring-red-500 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSelectedStyle('bold')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-red-500" />
              <div>
                <CardTitle className="text-lg">C그룹: 강렬한 포인트</CardTitle>
                <CardDescription>임팩트 있는 강조</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-black text-red-600">긴급 공지</p>
              <p className="text-2xl font-black text-orange-600">특가 할인</p>
              <p className="text-2xl font-black text-yellow-600">마감 임박</p>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <strong>적합한 용도:</strong>
              <ul className="mt-1">
                <li>• 긴급 알림</li>
                <li>• 할인 정보</li>
                <li>• 중요 공지</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* D그룹: 모던 산세리프 */}
        <Card 
          className={`cursor-pointer transition-all ${selectedStyle === 'modern' ? 'ring-2 ring-blue-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSelectedStyle('modern')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-lg">D그룹: 모던 산세리프</CardTitle>
                <CardDescription>깔끔하고 현대적</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-light tracking-wide">가벼운 느낌</p>
              <p className="text-lg font-normal">기본 텍스트</p>
              <p className="text-lg font-medium">중간 강조</p>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <strong>적합한 용도:</strong>
              <ul className="mt-1">
                <li>• 본문 텍스트</li>
                <li>• 일반 안내문</li>
                <li>• 모바일 UI</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* E그룹: 클래식 세리프 */}
        <Card 
          className={`cursor-pointer transition-all ${selectedStyle === 'classic' ? 'ring-2 ring-gray-700 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSelectedStyle('classic')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-gray-700" />
              <div>
                <CardTitle className="text-lg">E그룹: 클래식 세리프</CardTitle>
                <CardDescription>전통적이고 격식있는</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg" style={{ fontFamily: 'Georgia, serif' }}>공식 문서</p>
              <p className="text-lg" style={{ fontFamily: 'Times New Roman, serif' }}>계약서</p>
              <p className="text-lg" style={{ fontFamily: 'Garamond, serif' }}>증명서</p>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <strong>적합한 용도:</strong>
              <ul className="mt-1">
                <li>• 계약서/공문</li>
                <li>• 증명서</li>
                <li>• 격식있는 문서</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* F그룹: 디스플레이 폰트 */}
        <Card 
          className={`cursor-pointer transition-all ${selectedStyle === 'display' ? 'ring-2 ring-indigo-600 shadow-lg' : 'hover:shadow-md'}`}
          onClick={() => setSelectedStyle('display')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Type className="w-8 h-8 text-indigo-600" />
              <div>
                <CardTitle className="text-lg">F그룹: 디스플레이</CardTitle>
                <CardDescription>독특하고 개성있는</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-black" style={{ letterSpacing: '0.2em' }}>WIDE</p>
              <p className="text-2xl font-black" style={{ letterSpacing: '-0.05em' }}>Condensed</p>
              <p className="text-2xl font-black italic">Italic Style</p>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <strong>적합한 용도:</strong>
              <ul className="mt-1">
                <li>• 로고/브랜딩</li>
                <li>• 포스터 제목</li>
                <li>• 특별 이벤트</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 사용 예시 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">폰트 조합 예시</h2>
        
        <div className="space-y-6">
          {/* 프로모션 예시 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">프로모션 디자인</h3>
            <div className="space-y-2">
              <RainbowText text="2025 봄 시즌 특별 프로모션" variant="gemini" className="text-2xl" />
              <p className="text-lg font-light text-gray-700">싱싱골프투어가 준비한 특별한 혜택</p>
              <p className="text-3xl font-black text-red-600">최대 30% 할인!</p>
            </div>
          </div>

          {/* 공식 문서 예시 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">공식 문서 디자인</h3>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>계약서</h4>
              <p className="text-base" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
                본 계약은 싱싱골프투어(이하 '갑')와 고객(이하 '을') 간의 골프 투어 서비스 이용에 관한 사항을 규정함을 목적으로 한다.
              </p>
            </div>
          </div>

          {/* 감사장 예시 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">감사장 디자인</h3>
            <div className="text-center space-y-2">
              <p className="text-2xl text-pink-400" style={{ fontFamily: 'cursive' }}>감사합니다</p>
              <p className="text-base text-gray-600">싱싱골프투어를 이용해 주신 고객님께 진심으로 감사드립니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 폰트 매칭 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-blue-900">📝 문서별 추천 폰트</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong>계약서/공문:</strong> E그룹 (클래식 세리프)</li>
            <li><strong>프로모션/이벤트:</strong> A그룹 (무지개빛) + C그룹 (강렬한)</li>
            <li><strong>일반 안내문:</strong> D그룹 (모던 산세리프)</li>
            <li><strong>감사장/초대장:</strong> B그룹 (필기체)</li>
            <li><strong>브랜딩/로고:</strong> F그룹 (디스플레이)</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-green-900">🎨 폰트 조합 팁</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong>제목 + 본문:</strong> 대비되는 스타일 조합</li>
            <li><strong>강조 효과:</strong> 같은 폰트의 다른 굵기 활용</li>
            <li><strong>가독성:</strong> 본문은 항상 읽기 쉬운 폰트로</li>
            <li><strong>일관성:</strong> 한 문서에 3개 이하 폰트 사용</li>
            <li><strong>목적 우선:</strong> 디자인보다 메시지 전달이 중요</li>
          </ul>
        </div>
      </div>

      {/* 현재 사용 중인 폰트 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">현재 싱싱공프투어에서 사용 중인 폰트</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Noto Sans KR */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-3" style={{ fontFamily: 'Noto Sans KR' }}>Noto Sans KR</h3>
            <p className="text-sm text-gray-600 mb-3">현재 메인 폰트로 사용 중 (D그룹)</p>
            <div className="space-y-2">
              <p style={{ fontFamily: 'Noto Sans KR', fontWeight: 400 }}>일반 텍스트 - Regular 400</p>
              <p style={{ fontFamily: 'Noto Sans KR', fontWeight: 500 }}>중간 강조 - Medium 500</p>
              <p style={{ fontFamily: 'Noto Sans KR', fontWeight: 700 }}>강한 강조 - Bold 700</p>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded text-xs">
              <strong>사용처:</strong> 시스템 전체 UI, 본문 텍스트, 일반 안내문
            </div>
          </div>

          {/* Pretendard 예시 (필요 시 추가) */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-3">Pretendard</h3>
            <p className="text-sm text-gray-600 mb-3">추가 도입 예정 (D그룹)</p>
            <div className="space-y-2">
              <p className="font-light">가볍고 깨끗한 - Light 300</p>
              <p className="font-normal">일반 텍스트 - Regular 400</p>
              <p className="font-semibold">강조 텍스트 - SemiBold 600</p>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded text-xs">
              <strong>추천 사용처:</strong> 현대적인 디자인, 프로모션 페이지
            </div>
          </div>
        </div>

        {/* 폰트 분류 안내 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 text-yellow-800">💡 폰트 그룹 분류 가이드</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li><strong>A그룹:</strong> 화려한 그라데이션, 애니메이션 효과</li>
            <li><strong>B그룹:</strong> 필기체, 연한 색상, 감성적 표현</li>
            <li><strong>C그룹:</strong> 강렬한 포인트, 긴급/할인 강조</li>
            <li><strong>D그룹:</strong> 모던 산세리프 (Noto Sans KR, Pretendard)</li>
            <li><strong>E그룹:</strong> 클래식 세리프, 격식 있는 문서</li>
            <li><strong>F그룹:</strong> 디스플레이, 로고/브랜딩</li>
          </ul>
        </div>
      </div>
    </div>
  );
}