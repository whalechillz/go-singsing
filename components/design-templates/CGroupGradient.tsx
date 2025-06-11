// C그룹 홍보서 섹션에 무지개빛 그라데이션 적용 예제

import React from 'react';
import RainbowText from '@/components/ui/RainbowText';

const CGroupSection = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">C그룹: 홍보서</h3>
        <RainbowText text="보토서" variant="gemini" className="text-sm" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-purple-500">⚡</span>
          <RainbowText text="그리데이션" variant="gemini" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-purple-500">•</span>
          <RainbowText text="효로모션" variant="apple" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-purple-500">•</span>
          <RainbowText text="애니메이션" variant="animated" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-purple-500">•</span>
          <RainbowText text="비주얼 충실" variant="neon" />
        </div>
      </div>
    </div>
  );
};

// Tailwind CSS를 사용한 인라인 그라데이션 예제
const InlineGradientExample = () => {
  return (
    <div className="space-y-3">
      {/* Gemini 스타일 */}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
        그리데이션
      </h2>
      
      {/* Apple 스타일 */}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 bg-clip-text text-transparent">
        효로모션
      </h2>
      
      {/* 애니메이션 효과 추가 */}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
        애니메이션
      </h2>
      
      {/* 네온 효과 */}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-magenta-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
        비주얼 충실
      </h2>
    </div>
  );
};

export { CGroupSection, InlineGradientExample };
