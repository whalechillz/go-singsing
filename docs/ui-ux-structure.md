# 싱싱골프투어 어드민 UI/UX 구조 & 컴포넌트 파일 매핑

## 1. 전체 레이아웃/네비게이션 구조

- **관리자 레이아웃** 
  - 파일: `app/admin/layout.tsx`
  - 컴포넌트: `components/admin/ModernAdminLayout.tsx`
  - 하위 컴포넌트:
    - `components/admin/ModernAdminSidebar.tsx` (좌측 사이드바)
    - `components/admin/ModernAdminHeader.tsx` (상단 헤더)

---

## 2. 좌측 사이드바 메뉴 구조

- [대시보드]
  - 파일: `app/admin/page.tsx`
  - 컴포넌트: `components/Dashboard.tsx`

- [투어 관리]
  - [투어 스케줄 관리]
    - 파일: `app/admin/tours/page.tsx`
    - 컴포넌트: `components/admin/tours/TourListEnhanced.tsx`
    - DB: `singsing_tours` (실제 투어 일정)
    - 하위 페이지:
      - 투어 상세: `app/admin/tours/[tourId]/page.tsx` (탭 구조)
      - 참가자 관리: `app/admin/tours/[tourId]/participants/page.tsx` ✅ NEW
      - 객실 배정: `app/admin/tours/[tourId]/room-assignment/page.tsx` ✅ NEW
      - 일정 관리: `app/admin/tours/[tourId]/schedule/page.tsx` ✅ NEW
      - 티오프 시간: `app/admin/tours/[tourId]/tee-times/page.tsx`
      - 탑승 스케줄: `app/admin/tours/[tourId]/boarding/page.tsx` ✅ NEW
  
  - [여행상품 관리]
    - 파일: `app/admin/tour-products/page.tsx`
    - 컴포넌트: `components/admin/products/ProductListSimple.tsx` ✅ UPDATED
    - DB: `tour_products` (여행상품 템플릿)
    - 하위 페이지:
      - 상품 등록: `app/admin/tour-products/new/page.tsx` ✅ UPDATED
      - 상품 수정: `app/admin/tour-products/[id]/edit/page.tsx` ✅ NEW
  
  - [탑승지 관리]
    - 파일: `app/admin/boarding-places/page.tsx`
    - 컴포넌트: `components/BoardingPlaceManager.tsx`
    - DB: `singsing_boarding_places`

- [전체 참가자 관리] (독립 메뉴)
  - [참가자 목록]
    - 파일: `app/admin/participants/page.tsx`
    - 컴포넌트: `components/ParticipantsManagerV2.tsx`
    - DB: `singsing_participants`
  - [결제 관리]
    - 파일: `app/admin/payments/page.tsx`
    - 컴포넌트: `components/PaymentManager.tsx` (예정)
    - DB: `singsing_payments`

- [문서 관리]
  - 파일: `app/admin/documents/page.tsx`

- [메모 관리]
  - [업무 메모]
    - 파일: `app/admin/work-memos/page.tsx`
    - 컴포넌트: `components/WorkMemoManager.tsx`
  - [메모 템플릿]
    - 파일: `app/admin/memo-templates/page.tsx`
    - 컴포넌트: `components/MemoTemplateManager.tsx`

---

## 3. 투어 상세 페이지 구조 (/admin/tours/[tourId])

### 기존 탭 구조 (통합 페이지)
- 파일: `app/admin/tours/[tourId]/page.tsx`
- 탭 컴포넌트들:
  - `components/ParticipantsManagerV2.tsx`
  - `components/RoomTypeManager.tsx` + `components/RoomAssignmentManager.tsx`
  - `components/ScheduleManager.tsx`
  - `components/TeeTimeManager.tsx`
  - `components/BoardingScheduleManager.tsx`
  - `components/TourSchedulePreview.tsx`

### 신규 개별 페이지 구조 ✅ NEW
- 네비게이션: `components/admin/tours/TourNavigation.tsx`
- 개별 페이지들:
  - [참가자 관리]: `/admin/tours/[tourId]/participants`
  - [객실 배정]: `/admin/tours/[tourId]/room-assignment`
  - [일정 관리]: `/admin/tours/[tourId]/schedule`
  - [티오프 시간]: `/admin/tours/[tourId]/tee-times`
  - [탑승 스케줄]: `/admin/tours/[tourId]/boarding`
  - [문서 생성]: `/admin/tours/[tourId]/documents` (예정)

---

## 4. 데이터베이스 테이블 구조 이해

### 핵심 테이블 관계
- **tour_products** (여행상품 템플릿)
  - 골프장, 호텔, 이용안내 등 상품 정보
  - 여러 투어에서 재사용 가능한 템플릿

- **singsing_tours** (실제 투어 일정)
  - 특정 날짜에 진행되는 실제 투어
  - tour_product_id로 상품 템플릿 참조
  - start_date, end_date, 가격, 최대 참가자 수 등

- **singsing_participants** (참가자)
  - tour_id는 singsing_tours.id를 참조
  - 실제 투어에 참가하는 사람들

---

## 5. 주요 컴포넌트 설명

### 신규/업데이트된 컴포넌트
- **ProductListSimple.tsx**: 심플한 테이블 형태의 여행상품 목록
- **TourNavigation.tsx**: 투어 상세 페이지 간 네비게이션
- **TourParticipantsPage.tsx**: 투어별 참가자 관리 페이지
- **RoomAssignmentPage.tsx**: 투어별 객실 배정 페이지
- **TourSchedulePage.tsx**: 투어별 일정 관리 페이지
- **BoardingSchedulePage.tsx**: 투어별 탑승 스케줄 페이지

### 기타 유틸리티
- 문서 미리보기/프린트: `components/TourSchedulePreview.tsx`
- DB 연동: `lib/supabaseClient.ts`
- 타입 정의: `supabase/types.ts`

---

## 6. 사용자 유형별 주요 화면

### 1) 관리자(어드민) 화면 - 구현 완료
- 대시보드
- 투어 관리 (스케줄, 상품)
- 참가자/결제 관리
- 문서 관리
- 메모 시스템

### 2) 스탭(현장 담당자) 화면 - 예정
- 스탭 대시보드
- 실시간 체크인
- 현장 관리 도구

### 3) 고객(일반 사용자) 화면 - 예정
- 투어 일정 확인
- 개인정보 수정
- 문서 열람 (QR코드)

---

## 7. 개선 현황 (2025-05-30)

### 완료된 작업
- ✅ 여행상품 관리 UI 심플하게 개선
- ✅ 투어별 5개 핵심 페이지 구현
- ✅ 통합 네비게이션 시스템 구축
- ✅ 데이터베이스 구조 명확화

### 진행 예정
- 📋 Phase 2 마이그레이션 실행
- 📋 문서 생성 시스템 구현
- 📋 권한 시스템 구축
- 📋 모바일 최적화

---

*마지막 업데이트: 2025-05-30*