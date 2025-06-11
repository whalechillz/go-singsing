'use client'

import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'

interface DetailedGuideProps {
  title?: string
  className?: string
}

export default function DetailedUsageGuide({ 
  title = "상세 이용 안내", 
  className = "" 
}: DetailedGuideProps) {
  const [isOpen, setIsOpen] = useState(false)

  const usageItems = [
    "타오프 15팀 전까지 카트 대기선 도착 필수",
    "공간 플레이 시 4인 요금 적용",
    "추가 라운드는 프론트 데스크에 문의",
    "타오프 시간은 선착순 배정, 현장 변경 불가",
    "기상 악화 시 골프장 취소 규정 적용",
    "개인 사유로 라운드 취소 시 환불 불가",
    "그늘집 이용은 별도 결제 후 진행",
  ]

  const notices = [
    "일정시간: 타오프 시간 30분 전 골프장 도착",
    "준비사항: 골프복, 골프화, 모자, 선글라스",
    "카트매칭: 4인 1카트 원칙",
    "날씨대비: 우산, 우의 등 개인 준비",
  ]

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
        aria-expanded={isOpen}
        aria-controls="usage-guide-content"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        id="usage-guide-content"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-4">
          {/* 라운딩 규정 */}
          <div className="bg-white dark:bg-gray-900 rounded-md p-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="text-blue-600">•</span>
              라운딩 규정
            </h4>
            <ul className="space-y-2">
              {usageItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400 mt-0.5">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 추가 안내사항 */}
          <div className="bg-white dark:bg-gray-900 rounded-md p-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="text-blue-600">•</span>
              추가 안내사항
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notices.map((notice, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500">▸</span>
                  <span className="text-gray-600 dark:text-gray-400">{notice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 안내 메시지 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있으나, 투어 진행에 항상 최선을 다하겠습니다.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
