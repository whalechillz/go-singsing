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
  - [투어 스케쥴 관리]
    - 파일: `app/admin/tours/page.tsx`
    - 하위: 투어 상세/관리 (탭 구조, 아래 3번 참고)
  - [여행상품 관리]
    - 파일: `app/admin/tour-products/page.tsx`
  - [탑승지 관리]
    - 파일: `app/admin/boarding-places/page.tsx`
    - 컴포넌트: `components/BoardingPlaceManager.tsx`  <!-- DB: singsing_boarding_places -->
- [전체 참가자 관리] (독립 메뉴)
  - [참가자 목록]
    - 파일: `app/admin/participants/page.tsx`
    - 컴포넌트: `components/ParticipantsManagerV2.tsx`
    - DB: `singsing_participants`
  - [결제 관리]
    - 파일: `app/admin/payments/page.tsx`
    - 컴포넌트: `components/PaymentManager.tsx` (예정)
    - DB: `singsing_payments`, `singsing_participants`
- [문서 관리]
  - 파일: `app/admin/documents/page.tsx`

---

## 3. 투어 상세 페이지 탭 구조 (/admin/tours/[tourId])

- [투어별 참가자 관리]
  - `components/ParticipantsManager.tsx`  <!-- DB: singsing_participants -->
- [투어별 객실 배정]
  - `components/RoomTypeManager.tsx`  <!-- DB: singsing_rooms -->
  - `components/RoomAssignmentManager.tsx`  <!-- DB: singsing_rooms, singsing_participants -->
- [투어별 일정관리]
  - `components/ScheduleManager.tsx`  <!-- DB: singsing_schedules -->
- [티오프시간 관리]
  - `components/TeeTimeManager.tsx`  <!-- DB: singsing_tee_times, singsing_participants -->
- [탑승 스콐쥴 관리]
  - `components/BoardingScheduleManager.tsx`  <!-- DB: singsing_boarding_schedules, singsing_boarding_places -->
    - (폼 입력) `components/BoardingGuideForm.tsx`  <!-- DB: boarding_guide_routes, boarding_guide_notices, boarding_guide_contacts -->
    - (미리보기 모달) `components/BoardingGuidePreview.tsx`  <!-- DB: singsing_boarding_schedules, singsing_boarding_places, boarding_guide_routes, boarding_guide_notices, boarding_guide_contacts -->
- [투어 일정표 미리보기]
  - `components/TourSchedulePreview.tsx`  <!-- DB: singsing_tours, tour_products, singsing_schedules -->
    - (상품/투어 정보) `components/TourInfoBox.tsx`
    - (유의사항) `components/TourNoticeBox.tsx`
    - (이용안내) `components/TourUsageInfoBox.tsx`

---

## 4. 기타 주요 컴포넌트/유틸

- 문서 미리보기/프린트:  
  - `components/ProductSchedulePreview.tsx` (구: 일정표 미리보기, 현재는 TourSchedulePreview로 통합)
- DB 연동/클라이언트:  
  - `lib/supabaseClient.ts`

---

## 5. 문서 참고

- **프로젝트 계획**: `/docs/project_plan.md`
- **관리자 시스템 구조**: `/docs/admin-structure.md`
- **결제 관리 설계**: `/docs/payment-management.md`
- **회원 관리 설계**: `/docs/member-management-design.md`
- **DB 구조**: `/supabase/db_dump.sql`

---

## 6. 사용자 유형별 주요 화면 구조

### 1) 고객(일반 사용자) 화면
- [메인 홈페이지]
  - 파일: `app/page.tsx`
- [투어 상품 리스트]
  - 파일: `app/tours/page.tsx`
- [투어 상품 상세]
  - 파일: `app/tours/[tourId]/page.tsx`
- [예약/신청 폼]
  - 파일: `app/tours/[tourId]/reserve/page.tsx`
- [마이페이지/예약내역]
  - 파일: `app/mypage/page.tsx` (예상)

---

### 2) 스탭(현장/운영 담당자) 화면
- [스탭 대시보드]
  - 파일: `app/staff/dashboard/page.tsx` (예상)
- [투어별 참가자/일정 관리]
  - 파일: `app/staff/tours/[tourId]/manage/page.tsx` (예상)
- [실시간 체크인/출석]
  - 파일: `app/staff/checkin/page.tsx` (예상)

---

### 3) 관리자(어드민) 화면
- [어드민 대시보드]
  - 파일: `app/admin/dashboard/page.tsx`
- [투어 관리]
  - 파일: `app/admin/tours/page.tsx`
  - 상세: `app/admin/tours/[tourId]/page.tsx` (탭 구조, 위 3번 참고)
- [문서 관리]
  - 파일: `app/admin/documents/page.tsx`
- [회원/정산/통계/설정 등]
  - 파일: (상단 사이드바 메뉴 구조 참고, 일부 (내용무) 상태)

---

> **확장성 팁:**  
> - 각 사용자 유형별로 주요 진입점/화면을 명확히 구분  
> - 실제 파일명/경로가 확정되면 (예상) → 실제 파일명으로 교체  
> - 필요시 각 화면별 담당 컴포넌트, API, 담당자 등도 추가 가능