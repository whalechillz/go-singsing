'use client'

import React from 'react'
import { useParams } from 'next/navigation'

export default function BoardingPage() {
  const params = useParams()
  const tourId = params.tourId as string

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">탑승 관리</h1>
      <p className="text-gray-600">투어 ID: {tourId}</p>
      {/* TODO: 탑승 관리 컴포넌트 추가 */}
    </div>
  )
}
