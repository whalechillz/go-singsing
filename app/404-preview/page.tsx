'use client'

import { useState } from 'react'
import NotFoundPurple from '../not-found'
import NotFoundFlower from '../404-designs/not-found-flower-theme'
import NotFoundGreen from '../404-designs/not-found-green-theme'

export default function PreviewPage() {
  const [selectedDesign, setSelectedDesign] = useState<'purple' | 'flower' | 'green'>('purple')

  const designs = {
    purple: {
      name: '퍼플-핑크 테마',
      component: NotFoundPurple,
      description: '부드러운 그라데이션과 애니메이션'
    },
    flower: {
      name: '꽃 테마',
      component: NotFoundFlower,
      description: '따뜻한 꽃 장식과 격려 메시지'
    },
    green: {
      name: '골프장 그린 테마',
      component: NotFoundGreen,
      description: '골프 그린 일러스트와 캐디 컨셉'
    }
  }

  const CurrentDesign = designs[selectedDesign].component

  return (
    <div className="min-h-screen">
      {/* 디자인 선택 네비게이션 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">404 페이지 디자인 프리뷰</h1>
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(designs).map(([key, design]) => (
              <button
                key={key}
                onClick={() => setSelectedDesign(key as 'purple' | 'flower' | 'green')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedDesign === key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">{design.name}</div>
                <div className="text-sm opacity-80">{design.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 디자인 표시 */}
      <div className="pt-32">
        <CurrentDesign />
      </div>
    </div>
  )
}