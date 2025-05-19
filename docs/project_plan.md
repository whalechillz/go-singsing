# 프로젝트 플랜: 투어 상품 기반 투어 관리 고도화

## 1단계: 투어 스케쥴 생성(투어 생성) 폼 개선
- ✅ 완료: 포함사항/불포함사항 필드 제거, 골프장 드롭다운(tour_products 연동), 숙소 자동입력(수정 가능)
- 커밋 및 배포 완료 (main 브랜치)
- 확인: `/admin/tours/new` (투어 스케쥴 생성 폼)

## 2단계: 투어별 일정관리 탭 개선
- ✅ 1차 완료: 상단에 투어 정보(제목, 기사님, 골프장, 숙소 등) 표시, ScheduleManager에 tour prop 전달
- 커밋 및 배포 완료 (main 브랜치)
- 확인: `/admin/tours/[투어ID]` > '투어별 일정관리' 탭 상단
- (다음) 일정 추가 시 tour_products에서 식사/숙소 정보 자동 세팅 기능 구현 예정

## 3단계: 문서관리 > 상품정보(일정표) 자동 생성
- ✅ 3단계 1차 완료: ProductSchedulePreview 컴포넌트 신규 생성, 투어/상품/일정 통합 fetch 및 미리보기, 프린트 버튼, TourDetailPage에 버튼/모달 추가
- ✅ 3단계 최종 완료: 상품정보(일정표) 문서도 실시간 연동 방식으로 변경, /document/[tourId]/product-info에서 ProductSchedulePreview로 DB 최신 정보 자동 렌더링. 전체 문서 시스템 실시간 연동 구조로 통일.
- ✅ 전체 product-info → tour-schedule로 폴더/파일/컴포넌트/라우트/DB type 값 일괄 변경, 네이밍 일관성 확보
- 커밋 및 배포 완료 (main 브랜치)
- 확인: `/admin/tours/[투어ID]` > 상단 '상품정보(일정표) 미리보기' 버튼

## 4단계: 컴포넌트/페이지 활용 전략
- 신규 개발: /admin/tour-products/ (투어 상품 CRUD)
- 기존 활용: 투어 관리, 일정관리, 문서관리 등 기존 페이지/컴포넌트 최대한 재사용
- 필요한 부분만 prop/data fetch 방식으로 확장

## 진행 순서
1. docs/project_plan.md 작성 및 관리
2. 1단계 완료 (2024-05-18)
3. 2단계 1차 완료 (2024-05-18)
4. 2단계(식사/숙소 자동 세팅) 및 3단계부터 순차적으로 구현 및 커밋
5. 각 단계별 완료 시 본 문서에 진행상황 업데이트

## 2025-05-18

- 여행상품(투어 상품) 신규 등록 페이지(`app/admin/tour-products/new/page.tsx`) 구현 및 커밋
- 주요 필드(포함/불포함/예약안내/이용안내 등) 모두 반영, 실전 업계 기준 일정표 자동화 구조 개선
- 커밋 메시지: `feat: 여행상품(투어 상품) 신규 등록 페이지 및 관련 기능 구현, 일정표 자동화 구조 개선`
- main 브랜치로 푸시, Vercel 자동 배포 트리거
- 삭제 파일: `app/admin/tours/[tourId]/schedules/page.tsx`, `components/ProductSchedulePreview.tsx`, `components/ProductInfo.tsx`
- 남은 작업: 일정 추가 시 tour_products에서 식사/숙소 정보 자동 세팅, 문서 미리보기/다운로드 UX 개선

- 여행상품(투어 상품) 관리 페이지(`/admin/tour-products`)를 투어 관리와 동일한 구조/디자인으로 리팩토링
  - 상단 제목, 우상단 등록 버튼, 리스트 테이블, 관리(수정/삭제/상세/일정표) 버튼, 스타일 완전 통일
  - 커밋 메시지: `refactor: 여행상품(투어 상품) 관리 페이지 투어 관리와 동일한 구조/디자인으로 리팩토링`
  - main 브랜치로 푸시, Vercel 자동 배포 트리거

- **투어 일정표 미리보기(프린트 스타일) 연동**
  - 문서 에디트 페이지(app/admin/documents/[id]/edit/page.tsx)에서 문서 유형이 '투어 일정표'일 때, 하단에 <TourSchedulePreview> 컴포넌트가 실시간으로 렌더링되도록 추가
  - 기존 BoardingGuidePreview와 동일한 UX로, 입력한 투어/일정 정보가 프린트 스타일로 미리보기 가능
  - TailwindCSS 기반, 향후 디자인/데이터 확장 가능
  - 변경 파일: app/admin/documents/[id]/edit/page.tsx

- **남은 작업**
  - TourSchedulePreview/TourScheduleInfo의 디자인 및 데이터 구조를 첨부 HTML 예시(2025-04-14-순천/tour-schedules.html) 스타일로 고도화
  - 상품/일정/유의사항/이용안내 등 섹션별 Tailwind 스타일 적용 및 정보 추가
  - 입력값(문서 내용 등)과 미리보기 데이터 흐름 개선(필요시)
  - 프린트 최적화 및 반응형 개선 

## 2025-05-19

- tour_products 테이블에서 included, not_included 컬럼 완전 삭제 (DB 쿼리 적용)
- 관련 코드(select, form 등)에서 included, not_included 필드 완전 제거
- main 브랜치 커밋 및 배포 완료
- 남은 작업 없음 (완료) 

## 2025-05-20 (2)

- 투어 관리(신규/수정) 폼에서 '기타 안내문구(일정표 하단)' → '예약 안내 사항' 필드로 변경 및 분리
  - 예약 안내 사항: 여러 줄 입력, DB 컬럼(reservation_notice) 추가 및 연동
  - 기타 안내문구(일정표 하단): 투어별 일정관리에서만 입력/노출
- DB 마이그레이션: singsing_tours 테이블에 reservation_notice 컬럼 추가
- 관련 코드(app/admin/tours/new/page.tsx, app/admin/tours/[tourId]/edit/page.tsx) 수정 및 커밋/배포 완료
- 남은 작업 없음 (완료) 