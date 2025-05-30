# 싱싱골프투어 시스템 구조

## 메뉴 구조

### 메인 사이드바
```
📊 대시보드 (/admin)
📅 투어 관리
  ├── 투어 스케줄 관리 (/admin/tours)
  ├── 여행상품 관리 (/admin/tour-products)
  └── 탑승지 관리 (/admin/boarding-places)
👥 전체 참가자 관리
  ├── 참가자 목록 (/admin/participants)
  └── 결제 관리 (/admin/payments)
📄 문서 관리 (/admin/documents)
📈 통계 (/admin/statistics) [예정]
⚙️ 설정 (/admin/settings) [예정]
```

### 투어 상세 페이지 구조
`/admin/tours/[tourId]` 하위 페이지:
- 📋 참가자 관리 (`/participants`)
- 🏨 객실 배정 (`/room-assignment`)
- 📅 일정 관리 (`/schedule`)
- ⛳ 티타임 관리 (`/tee-times`)
- 🚌 탑승 스케줄 (`/boarding`)

## 파일 구조

### 레이아웃
```
app/admin/layout.tsx
├── components/admin/ModernAdminLayout.tsx
├── components/admin/ModernAdminSidebar.tsx
└── components/admin/ModernAdminHeader.tsx
```

### 주요 페이지
```
app/
├── admin/
│   ├── page.tsx (대시보드)
│   ├── tours/
│   │   ├── page.tsx (투어 목록)
│   │   ├── new/page.tsx
│   │   └── [tourId]/
│   │       ├── page.tsx
│   │       ├── participants/page.tsx
│   │       ├── room-assignment/page.tsx
│   │       ├── schedule/page.tsx
│   │       ├── tee-times/page.tsx
│   │       └── boarding/page.tsx
│   ├── tour-products/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── participants/page.tsx
│   ├── payments/page.tsx
│   └── documents/page.tsx
```

### 주요 컴포넌트
```
components/
├── Dashboard.tsx
├── ParticipantsManagerV2.tsx
├── PaymentManager.tsx
├── RoomAssignmentManager.tsx
├── TeeTimeManager.tsx
├── BoardingScheduleManager.tsx
├── ScheduleManager.tsx
├── TourSchedulePreview.tsx
└── admin/
    ├── tours/
    │   ├── TourListEnhanced.tsx
    │   └── TourNavigation.tsx
    └── products/
        └── ProductListSimple.tsx
```

## 데이터베이스 테이블

### 핵심 테이블
- `tour_products` - 여행상품 템플릿
- `singsing_tours` - 실제 투어 일정
- `singsing_participants` - 참가자 정보
- `singsing_payments` - 결제 정보
- `singsing_rooms` - 객실 정보
- `singsing_schedules` - 일정 정보
- `singsing_tee_times` - 티타임 정보
- `singsing_boarding_places` - 탑승지 정보
- `singsing_boarding_schedules` - 탑승 스케줄

### 테이블 관계
```
tour_products (1) ──→ (N) singsing_tours
singsing_tours (1) ──→ (N) singsing_participants
singsing_tours (1) ──→ (N) singsing_payments
singsing_participants (1) ──→ (N) singsing_payments
```

## 사용자 유형별 기능

### 1. 관리자 (현재 구현)
- 전체 시스템 관리
- 투어/참가자/결제 관리
- 문서 생성 및 출력
- 통계 및 리포트

### 2. 스탭 (예정)
- 현장 체크인
- 실시간 업데이트
- 제한된 정보 접근

### 3. 고객 (예정)
- 투어 정보 확인
- 개인 문서 열람
- 결제 내역 확인

## 개발 가이드라인

### 네이밍 규칙
- 컴포넌트: PascalCase (예: `PaymentManager`)
- 파일명: kebab-case (예: `payment-manager.tsx`)
- 변수명: camelCase (예: `tourId`)
- 테이블명: snake_case (예: `singsing_participants`)

### 코드 구조
```typescript
// 1. Import
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// 2. Types
interface Tour {
  id: string
  title: string
  // ...
}

// 3. Component
export default function ComponentName() {
  // 4. State
  const [state, setState] = useState()
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, [])
  
  // 6. Handlers
  const handleSubmit = async () => {
    // ...
  }
  
  // 7. Render
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

### Supabase 쿼리 예시
```typescript
// 조회
const { data, error } = await supabase
  .from('singsing_tours')
  .select('*')
  .eq('id', tourId)
  .single()

// 생성
const { data, error } = await supabase
  .from('singsing_participants')
  .insert({ name, phone, tour_id })
  .select()

// 수정
const { error } = await supabase
  .from('singsing_payments')
  .update({ payment_status: 'completed' })
  .eq('id', paymentId)

// 삭제
const { error } = await supabase
  .from('singsing_tee_times')
  .delete()
  .eq('id', teeTimeId)
```

---
*최종 업데이트: 2025-05-30*
