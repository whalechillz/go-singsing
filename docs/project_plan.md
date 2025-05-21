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
- ✅ 완료: 투어별 일정관리(ScheduleManager)에서 중복 투어 정보 박스(제목, 날짜, 기사님, 골프장, 숙소 등) 제거, 상단에서만 노출되도록 개선
- 관련 파일: components/ScheduleManager.tsx

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

## 5단계: 네비게이션/사이드바 메뉴명 개선
- ✅ 완료: 사이드바(가방 아이콘) 하위 메뉴 '투어 관리' → '투어 스케쥴 관리'로 변경
- 상위 메뉴(가방 아이콘 옆)는 '투어 관리'로 그대로 유지
- 관련 파일: components/AdminSidebarLayout.tsx, components/AdminNavbar.tsx, components/Dashboard.tsx, app/layout.tsx
- 커밋 및 배포 예정

- ✅ 완료: 투어별 참가자 관리 탭에 엑셀 다운로드/업로드 버튼을 추가 버튼과 같은 계층(아래)에 나란히 버튼 UI로 배치, '선택된 파일 없음'은 업로드 버튼 옆에 한 번만 노출되도록 개선
- 관련 파일: components/ParticipantsManager.tsx

- ✅ 완료: 투어별 객실 배정 UI를 투어별 참가자 관리와 동일하게 폰트, 색상, 버튼, 입력, 테이블, 그룹핑 영역 등 전체적으로 Tailwind 스타일로 통일, 글자 정렬(이름/연락처/상태 등은 text-left, 드롭다운은 text-right)도 명확히 적용
- 관련 파일: components/RoomAssignmentManager.tsx

- ✅ 완료: 상단 탭 메뉴에 '투어 일정표 미리보기'를 추가, 기존 모달 버튼/로직 제거, 탭 전환 방식으로 일관되게 동작하도록 개선
- 관련 파일: app/admin/tours/[tourId]/page.tsx 

## Project Update

- **Cloned Repository**: Cloned the `tsx-gallery-cursor` repository directly into the `go2.singsinggolf.kr` directory.
- **Installed Dependencies**: Ran `npm install` to install all necessary packages.
- **Next Steps**: Configure environment variables and set up GitHub and Vercel for deployment.

- **ParticipantsManager.tsx 개선**: 전화번호 없이도 참가자 등록 가능하도록 required 속성 제거, 커밋/푸시 및 Vercel 자동 배포 트리거 

## 2024-06-XX

- 참가자 이름 옆에 팀명을 작게(파란색, 연한 배경, text-xs)로 표시
- 전화번호 완전 제거
- 객실별 인원 표기를 '현재 n / 정원 n' 순서로 바꾸고, 정원 도달 시 색상 강조(빨강, 굵게)
- 참가자 리스트와 미배정 리스트 모두 넓은 화면에서 한 줄에 2~3명씩 flex-wrap 레이아웃 적용
- 드롭다운에서 '정원초과' 문구 완전 제거
- 파일 변경: `components/RoomAssignmentManager.tsx`
- 목적: 실무적 UI/UX 개선, 가독성 및 배정 편의성 향상 

- **2024-06-XX**
  - 참가자 관리(ParticipantsManager) 엑셀 업로드/다운로드 UI를 파란색 업로드 버튼, 연한 회색 다운로드 버튼, 파일명 안내는 오른쪽에 연하게(2024-06-XX 이미지 기준)로 되돌림
  - 파일명 안내는 한 줄에만, 중복 안내 없음
  - 적용 소스코드:

```jsx
<div className="flex items-center gap-3 mb-4">
  <label className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition">
    엑셀 업로드
    <input
      type="file"
      accept=".xlsx,.xls,.csv"
      onChange={handleUploadExcel}
      className="hidden"
    />
  </label>
  <span className={selectedFileName ? "text-gray-700 text-sm max-w-[180px] truncate" : "text-gray-400 text-sm italic max-w-[180px] truncate"}>
    {selectedFileName || "선택된 파일 없음"}
  </span>
  <button
    type="button"
    onClick={handleDownloadExcel}
    className="ml-4 px-3 py-1 bg-gray-100 text-blue-700 rounded hover:bg-gray-200 transition"
  >
    엑셀 다운로드
  </button>
</div>
```
  - 파일: `components/ParticipantsManager.tsx`
  - 목적: 실제 사용성 및 시인성 개선, 중복 안내 제거, 고급 UI/UX 반영

- **2024-06-XX**
  - 미배정 참가자 리스트를 카드형 그리드 스타일로 개선 (Tailwind 전역 스타일 적극 활용)
  - 각 참가자를 bg-white, rounded-lg, shadow, hover:bg-blue-50 등 카드형으로, grid-cols-1~4 반응형으로 배치
  - 파일 변경: `components/RoomAssignmentManager.tsx`
  - 목적: 미배정 영역 가독성 및 미관 개선, 반응형 최적화 

## 2024-06-10
- 참가자 관리(ParticipantsManager) 성별(gender) 필드 추가 및 UI/로직 개선
  - 등록/수정 폼에 성별 select box(남/여) 추가
  - gender 값이 DB에 저장/수정되도록 로직 개선
  - 참가자 리스트에서 이름 옆에 (남)/(여)로 성별 표시
  - 관련 파일: components/ParticipantsManager.tsx

## 2024-06-11
- 여행상품(투어 상품) 관리에 코스 정보(courses) 배열 컬럼 추가 마이그레이션 작성 및 적용 완료
- Postgres TEXT[] 타입, NOT NULL 아님, 기본값 없음
- 파일: `supabase/migrations/20240611_add-courses-to-tour-products.sql`
- 목적: 투어 상품별로 여러 개의 코스명을 등록/수정/조회할 수 있도록 구조 확장
- **DB 마이그레이션 적용 완료**
- 남은 작업: 
  - 투어 상품 생성/수정 UI에서 코스명 여러 개 입력/수정 기능 구현
  - 티오프 시간 관리에서 코스 목록 연동 및 선택 기능 구현

- 2024-06-11
  - 투어 상품 생성/수정 UI에 코스명(courses) 배열 입력/수정 기능 구현
  - 코스명 여러 개 입력, 추가/삭제, 수정 시 기존 값 불러오기, Tailwind 스타일 적용
  - 변경 파일: `app/admin/tour-products/new/page.tsx`, `app/admin/tour-products/[id]/edit/page.tsx`
  - 목적: 투어 상품별로 실제 플레이 코스명을 실무적으로 관리할 수 있도록 개선
  - 남은 작업: 티오프 시간 관리에서 코스 목록 연동 및 선택 기능 구현

- 2024-06-11
  - 티오프 시간 관리에서 코스 선택 드롭다운이 투어 상품의 courses 배열과 연동되도록 개선
  - 투어(tourId) → tour_product_id → tour_products.courses 배열 fetch → 드롭다운에 반영
  - courses가 없으면 기존 샘플 코스명 옵션 유지
  - 변경 파일: `components/TeeTimeManager.tsx`
  - 목적: 투어별 실제 코스명만 선택 가능하도록 하여 실무적 관리 및 오류 방지
  - 남은 작업: 없음(코스 연동 1차 완료)

- 2024-06-12
  - 티오프 시간 관리에 4명 자동 배정/추천 기능, 성별 표시, 자동 배정 버튼 추가
  - 미배정 참가자 중 4명을 자동 추천, 이름 옆에 (남)/(여) 자동 표시, 중복 배정 방지
  - 변경 파일: `components/TeeTimeManager.tsx`
  - 목적: 티오프 조 편성의 실무적 자동화 및 오류 방지, 성별 정보 활용
  - 남은 작업: 참가자 자동완성/선택 UX 추가 개선(필요시)

- 2024-06-12
  - 티오프 시간 관리에 참가자 이동/변동 UX(이동 버튼, 조 선택, 입력란 X 삭제 등) 기능 구현
  - 각 조의 참가자 옆에 '이동' 버튼 및 조 선택 드롭다운, 참가자 입력란에 X(삭제) 버튼 추가
  - 이동 시 기존 조에서 삭제, 선택한 조에 추가(DB 반영)
  - 변경 파일: `components/TeeTimeManager.tsx`
  - 목적: 실무적 조 편성/변경의 편의성 및 오류 방지
  - 남은 작업: 없음(1차 실무적 티오프 관리 기능 완료)
