'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function BoardingPage() {
  const params = useParams()
  const router = useRouter()
  const tourId = params.tourId as string

  useEffect(() => {
    // 탑승지 관리는 여정 관리로 통합되었으므로 리다이렉트
    router.replace(`/admin/tours/${tourId}/schedule`)
  }, [tourId, router])

  return (
    <div className="p-6">
      <p className="text-gray-600">탑승지 관리가 여정 관리로 통합되었습니다. 잠시 후 이동합니다...</p>
    </div>
  )
}
