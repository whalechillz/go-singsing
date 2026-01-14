# 싱싱골프투어 관리 시스템 프로젝트 계획

## 프로젝트 개요
싱싱골프투어 관리 시스템을 전문적인 여행사 관리 플랫폼으로 업그레이드

### 도메인 구조
- **관리자**: go.singsinggolf.kr/admin (현재)
- **고객문서**: go.singsinggolf.kr (고객용 투어 문서)
- **메인사이트**: www.singsinggolf.kr (추후 singsingtour.com 통합)

## 시스템 아키텍처

### 1. 사용자 권한 체계
```
┌─────────────────────────────────────────────┐
│                슈퍼관리자                      │
│  - 전체 시스템 관리                           │
│  - 권한 설정 및 사용자 관리                    │
└─────────────────────────────────────────────┘
                      │
    ┌─────────────────┴─────────────────┐
    │                                   │
┌───▼──────────────┐        ┌──────────▼──────────┐
│   오피 관리자      │        │    투어 스탭         │
│ - 실무 운영       │        │  - 가이드/기사       │
│ - 결재 권한       │        │  - 현장 관리         │
└──────────────────┘        └────────────────────┘
                      │
              ┌───────▼────────┐
              │   참가 고객      │
              │ - 문서 열람      │
              │ - 개인정보 수정   │
              └────────────────┘
```

### 2. 데이터베이스 구조 이해

#### 핵심 테이블 관계
```
tour_products (여행상품 템플릿)
    ├── name (상품명)
    ├── golf_course (골프장)
    ├── hotel (숙소)
    └── usage_* (이용안내)
         ↓
singsing_tours (실제 투어 일정)
    ├── tour_product_id → tour_products
    ├── title (투어명)
    ├── start_date/end_date (날짜)
    └── price (가격)
         ↓
singsing_participants (참가자)
    ├── tour_id → singsing_tours
    ├── name (이름)
    └── phone (연락처)
```

### 3. 핵심 기능 구조

#### 투어 관리 (5개 페이지) ✅
1. **투어별 참가자 관리** - `/admin/tours/[id]/participants` ✅
2. **투어별 객실 배정** - `/admin/tours/[id]/room-assignment` ✅
3. **투어별 일정 관리** - `/admin/tours/[id]/schedule` ✅
4. **티오프 시간 관리** - `/admin/tours/[id]/tee-times` ✅
5. **탑승 스케줄 관리** - `/admin/tours/[id]/boarding` ✅

#### 문서 생성 (6종)
1. **투어 일정표** (고객용)
2. **탑승지 안내** (고객용)
3. **객실 배정표** (고객용)
4. **라운딩 시간표** (고객용)
5. **탑승지 배정** (스탭용 - 개인정보 포함)
6. **객실 배정** (스탭용 - 개인정보 포함)

## 개발 로드맵

### Phase 1: 기본 UI/UX 개선 ✅ (완료)
- [x] 투어 스케줄 관리 페이지 개선
- [x] 여행상품 관리 페이지 개선
- [x] 통계 대시보드 추가
- [x] 필터링 및 검색 기능

### Phase 2: 데이터베이스 확장 및 권한 시스템 (진행중)
- [ ] DB 스키마 확장
  - singsing_schedules 테이블: status, max_participants 추가
  - room_participant_assignments 테이블 생성
  - boarding_buses, boarding_assignments 테이블 생성
  - user_roles 테이블 생성
- [ ] Supabase Auth 기반 권한 시스템
- [ ] RLS (Row Level Security) 정책 설정

### Phase 3: 5개 투어 관리 페이지 구현 ✅ (완료)
- [x] 참가자 관리 (그룹/팀 배정) - 2025-05-30
- [x] 객실 배정 (자동/수동 배정) - 2025-05-30
- [x] 일정 관리 (일차별 상세 일정) - 2025-05-30
- [x] 티오프 시간 관리 (조편성) - 기존
- [x] 탑승 스케줄 관리 (버스별 배정) - 2025-05-30
- [x] 여행상품 관리 UI 개선 - 2025-05-30
- [x] 투어 스케줄 목록 UI 개선 - 2025-05-30

### Phase 4: 문서 생성 시스템 (다음 목표)
- [ ] 문서 템플릿 시스템
- [ ] PDF 생성 기능
- [ ] 개인화된 문서 링크 생성
- [ ] QR코드 기반 문서 접근

### Phase 5: 회원 시스템 통합
- [ ] OAuth 연동 (카카오, 구글, 네이버)
- [ ] 회원 프로필 관리
- [ ] 투어 히스토리
- [ ] 개인정보 보호 정책

### Phase 6: 알림 시스템
- [ ] 슬랙 연동 (관리자용)
- [ ] 솔라피 연동 (고객 알림톡/친구톡)
- [ ] 이메일 알림
- [ ] 푸시 알림 (추후)

### Phase 7: 모바일 최적화
- [ ] 반응형 디자인 개선
- [ ] PWA 구현
- [ ] 오프라인 지원

## 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **문서생성**: React PDF, QR Code
- **알림**: Slack API, 솔라피 API
- **인증**: Supabase Auth + OAuth providers
- **배포**: Vercel

## 데이터베이스 스키마 설계

### 기존 테이블 (현재 사용중)
- `tour_products` - 여행상품 템플릿
- `singsing_tours` - 실제 투어 일정
- `singsing_participants` - 참가자
- `singsing_payments` - 결제
- `singsing_boarding_places` - 탑승지
- `singsing_rooms` - 객실
- `singsing_tee_times` - 티오프 시간
- `singsing_schedules` - 일정 (Phase 2에서 확장 예정)

### 신규 테이블 (Phase 2 마이그레이션)
```sql
-- 객실-참가자 배정 (기존 singsing_rooms 확장)
CREATE TABLE room_participant_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES singsing_schedules(id),
  room_id UUID REFERENCES singsing_rooms(id),
  participant_id UUID REFERENCES singsing_participants(id),
  check_in_date DATE,
  check_out_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 버스 정보
CREATE TABLE boarding_buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES singsing_schedules(id),
  bus_number INTEGER,
  bus_type VARCHAR(50), -- '25_seater', '45_seater'
  driver_name VARCHAR(100),
  driver_phone VARCHAR(20),
  departure_date DATE,
  departure_time TIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 버스-참가자 배정
CREATE TABLE boarding_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID REFERENCES boarding_buses(id),
  participant_id UUID REFERENCES singsing_participants(id),
  seat_number VARCHAR(10),
  boarding_place_id UUID REFERENCES singsing_boarding_places(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 권한
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(50), -- 'super_admin', 'office_admin', 'staff', 'customer'
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 문서 개인화 전략

### 현재 문제점
- 모든 참가자 정보가 하나의 문서에 노출
- 개인 전화번호 부재로 개인화 어려움
- 총무/회장만 전체 문서 접근

### 개선 방안
1. **단기 해결책**
   - 고유 문서 URL 생성 (UUID 기반)
   - 이름 기반 간단 인증
   - QR코드로 문서 접근

2. **장기 해결책**
   - 회원가입 시스템 구축
   - OAuth 연동으로 편리한 가입
   - 개인화된 대시보드 제공

## 회원가입 전략

### 추천 방안
1. **메인 사이트 회원가입** (www.singsinggolf.kr)
   - 브랜드 일관성
   - SEO 효과
   - 마케팅 활용

2. **투어 문서에서 간편 가입**
   - 투어 참가 시 자동 회원 유도
   - 최소 정보로 가입 (이름, 전화번호)
   - 추후 정보 보완

3. **OAuth 우선 전략**
   - 카카오톡 (한국 사용자 선호)
   - 구글 (글로벌 사용자)
   - 네이버 (선택사항)

## 현재 진행 상황 (2025-05-30)

### 알려진 이슈
1. **배포 에러 해결 (2025-05-30)**
   - 동적 라우트 slug 이름 충돌 문제 해결
   - [productId] → [id]로 통일

2. **여행상품 관리 페이지**
   - 빈 화면 표시 문제 (DB 데이터 확인 필요)
   - 심플한 테이블 UI로 재설계 완료

### 완료된 작업
1. **Phase 1**: 기본 UI/UX 개선 ✅
2. **Phase 3**: 5개 투어 관리 페이지 구현 ✅
3. **여행상품 관리 개선**: 심플한 UI로 재설계 ✅

### 진행중인 작업
1. **Phase 2 마이그레이션 준비**
   - 백업 스크립트 작성 완료
   - 데이터 검증 스크립트 작성 완료
   - 실행 대기중

2. **UI/UX 개선**
   - 투어 스케줄 관리 페이지 개선 완료
   - 여행상품 관리 페이지 심플하게 재설계 완료
   - 통계 카드 및 필터링 기능 추가

### 다음 우선순위
1. **여행상품 관리 개선** (NEW - 2025-05-30)
   - 다양한 상품 타입 지원 (버스/항공/맞춤형/당일)
   - 동적 탭 메뉴 시스템 구현
   - 상세 문서: `/docs/product-management-enhancement.md`
   - 체크리스트: `/docs/product-enhancement-checklist.md`
2. **Phase 2 마이그레이션 실행**
3. **Phase 4 문서 생성 시스템**
   - PDF 생성 기능
   - 6종 문서 템플릿 개발
   - QR코드 기반 접근
4. **권한 시스템 구현**
5. **성능 최적화**
   - 페이지네이션 구현
   - 대량 데이터 처리 개선
   - 검색 기능 최적화

## 보안 고려사항
- 개인정보 암호화
- RLS 정책 적용
- API Rate limiting
- 문서 접근 로그
- GDPR/개인정보보호법 준수

## 성능 최적화
- 이미지 최적화 (Next.js Image)
- 문서 캐싱
- DB 인덱싱
- CDN 활용
- 레이지 로딩

## 모니터링
- Vercel Analytics
- Supabase Dashboard
- Sentry (에러 트래킹)
- 사용자 행동 분석

---
*마지막 업데이트: 2025-05-30*
*업데이트 내용: Phase 3 완료, 데이터베이스 구조 명확화, 현재 진행 상황 추가*

- **2025-10-28**
  - 솔라피 연동 매뉴얼 신규 작성 및 공유용 가이드 정리
    - 파일: `docs/solapi-integration-manual.md`
    - 내용: 환경변수, HMAC 서명, 서버 라우트, 이미지 업로드, 클라이언트 호출 예시, 테스트/트러블슈팅 체크리스트
  - 목적: 타 프로젝트에서도 즉시 재사용 가능한 표준 통합 가이드 제공

- **2025-05-28**
  - 티타임 배정 페이지에서 V2 컴포넌트(`TeeTimeAssignmentManagerV2`)로 교체
    - 파일: `app/admin/tours/[tourId]/page.tsx`
    - 구버전 import 및 사용 코드 제거, V2 import 및 사용으로 변경
  - 수정사항 커밋 및 원격 저장소 푸시, Vercel 자동 배포 진행
  - 남은 작업: 배포 완료 후 정상 동작 확인

- **2025-06-01**
  - 탑승 스케줄 관리 페이지를 "탑승지 안내 미리보기" 전용 페이지로 리팩터링
    - 파일: `app/admin/tours/[tourId]/boarding/page.tsx`
    - 기존 BoardingScheduleManager(입력/수정 UI) 제거, BoardingGuidePreview 컴포넌트만 사용
    - boarding_schedules 테이블 삭제 이후에도 안내 미리보기만 제공하도록 구조 단순화
  - 커밋 및 원격 저장소 푸시, Vercel 자동 배포 진행
  - 남은 작업: 실제 안내 미리보기 화면 확인 및 추가 개선사항 반영

## 2024-06-19 강제 퍼밋 및 푸시

- **내용**: 배포 또는 워크플로우 트리거를 위해 강제(empty) 커밋을 생성하고 원격 저장소에 푸시함.
- **이유**: 코드 변경 없이도 Vercel 등 배포/CI 파이프라인을 재실행하거나, 워크플로우 트리거가 필요할 때 활용.
- **변경 파일**: (실제 코드 변경 없음, 빈 커밋)
- **남은 작업**: 별도 없음. 추가 배포/트리거 필요 시 동일 방식 사용 가능.

## 2025-11-08 월별 매출 기능 개발 완료

- **내용**: 올해 1월부터 현재까지의 월별 매출 통계 기능 개발
- **구현된 기능**:
  1. 월별 매출 데이터 가져오기 함수 (결제 데이터 집계, 투어 비용 계산, 마진 계산)
  2. 월별 매출 차트 컴포넌트 (recharts 사용, Line/Bar 차트 지원)
  3. 월별 매출 테이블 컴포넌트 (요약/상세 테이블)
  4. 대시보드에 월별 매출 섹션 추가 (간단한 버전)
  5. 결제 관리 페이지에 월별 매출 섹션 추가 (상세 버전)
- **변경 파일**:
  - `components/admin/MonthlyRevenueChart.tsx`: 월별 매출 차트 컴포넌트
  - `components/admin/MonthlyRevenueTable.tsx`: 월별 매출 테이블 컴포넌트
  - `components/admin/ModernDashboardContent.tsx`: 대시보드에 월별 매출 섹션 추가
  - `components/payments/PaymentManager.tsx`: 결제 관리 페이지에 월별 매출 섹션 추가
- **데이터 구조**: 월별 매출 데이터는 올해 1월부터 현재 월까지 자동으로 계산되며, 총 수입, 총 비용, 마진, 마진률, 계약금, 잔금, 전액 입금, 환불, 참가자 수, 투어 수가 포함됩니다.
- **상세 문서**: `docs/MONTHLY_REVENUE_PLAN.md`

## 2025-11-08 정산 시스템 최종 개발 계획 수립

- **내용**: 투어별 정산을 위한 완전한 원가 관리 시스템 구축 계획
- **목표**:
  - 투어별 원가(골프장, 버스, 가이드, 경비 등) 관리
  - 정확한 마진 계산
  - 월별/연간 정산 리포트
  - 투어별 상세 정산서 생성
- **정산 구조**:
  - 계약 매출 = 상품가 × 인원
  - 완납 금액 = 입금 합계
  - 환불 금액 = 환불 합계
  - 정산 금액 = 완납 금액 - 환불 금액 (최종 매출)
  - 총 원가 = 골프장 원가 + 버스 비용 + 가이드 비용 + 경비 지출 + 기타 비용
  - 마진 = 정산 금액 - 총 원가
  - 마진률 = (마진 / 정산 금액) × 100
- **데이터베이스 설계**:
  - `tour_expenses` 테이블: 투어별 원가 상세 관리
  - `tour_settlements` 테이블: 투어별 정산 요약
- **구현 단계**:
  1. 데이터베이스 설계 및 마이그레이션 ✅ (완료)
  2. 투어별 정산 관리 UI ✅ (완료)
     - 정산 관리 페이지 생성 ✅
     - 정산 관리 컴포넌트 생성 ✅
     - 원가 입력 폼 구현 ✅ (골프장, 버스, 가이드, 경비, 기타)
     - 골프장 정산 상세 입력 (JSONB) ✅
     - 경비 지출 상세 입력 (JSONB) ✅
     - 정산 요약 표시 ✅ (매출, 원가, 마진, 마진률)
     - 정산 상세 탭 ✅
  3. 정산 계산 로직 ✅ (완료 - 데이터베이스 트리거로 구현)
  4. 월별 정산 리포트 개선 ✅ (완료 - tour_settlements 데이터 기반)
  5. 정산서 생성 (진행 예정)
  6. 통계 및 분석 리포트 (진행 예정)
- **예상 작업 시간**: 21-28시간
- **상세 문서**: `docs/SETTLEMENT_SYSTEM_PLAN.md`
- **변경 파일**:
  - `app/admin/tours/[tourId]/settlement/page.tsx`: 정산 관리 페이지
  - `components/admin/tours/TourSettlementManager.tsx`: 정산 관리 컴포넌트
  - `app/admin/tours/[tourId]/page.tsx`: 정산 관리 탭 추가

## 2025-11-XX 정산 시스템 개선 및 세금계산서 관리 기능 추가

- **내용**: 정산 시스템 용어 통일, 정산 상태 변경 기능, 매입세금계산서/현금영수증 기록 기능, 미발행 항목 관리 기능 추가
- **구현된 기능**:
  1. **Phase 1: 기본 기능**
     - 정산 상태 변경 기능 (대기/완료/취소 드롭다운)
     - 용어 통일: "총 수입" → "정산 금액", "월별 매출" → "월별 정산"
     - 마진율 100% 개선 (비용이 0원일 때 "-" 표시)
  2. **Phase 2: 세금계산서 기록**
     - 골프장 정산 섹션에 세금계산서/영수증 입력 필드 추가
     - 경비 지출 섹션에 세금계산서/영수증 입력 필드 추가
     - 기타 비용 섹션에 세금계산서/영수증 입력 필드 추가
     - 발행 여부 체크박스 추가 (국세청 검증 완료)
  3. **Phase 3: 미발행 항목 관리**
     - 미발행 세금계산서/영수증 목록 페이지 생성
     - 체크박스로 항목 선택 및 일괄 발행 요청 기능
     - 발행 요청 상태 추적 (요청 대기/진행중/완료)
- **변경 파일**:
  - `components/admin/tours/TourSettlementManager.tsx`: 정산 상태 변경, 세금계산서/영수증 입력 필드 추가
  - `components/admin/ModernDashboardContent.tsx`: 용어 통일 (총 수입 → 정산 금액)
  - `components/admin/MonthlyRevenueChart.tsx`: 그래프 레이블 변경 (총 수입 → 정산 금액)
  - `components/admin/MonthlyRevenueTable.tsx`: 테이블 헤더 변경 및 마진율 개선
  - `app/admin/settlements/unissued-receipts/page.tsx`: 미발행 항목 목록 페이지 (신규)
  - `app/admin/settlements/page.tsx`: 미발행 항목 관리 링크 추가
- **데이터 구조 확장**:
  - `tour_expenses` 테이블의 JSONB 필드에 `receipt_type`, `receipt_number`, `is_issued`, `verified_at`, `request_status`, `requested_at`, `requested_by` 필드 추가
  - `tour_expenses` 테이블에 `other_receipt_type`, `other_receipt_number`, `other_is_issued`, `other_verified_at`, `other_request_status`, `other_requested_at`, `other_requested_by` 필드 추가
- **향후 계획**:
  - 국세청 API 연동 (발행 여부 자동 검증)
  - 발행 요청 알림 기능
  - 발행 요청 이력 상세 관리

## 2025-11-20 정산 자료 업로드 인프라 1차 구축

- **내용**:
  - `tour_settlement_documents` 테이블 및 인덱스 생성
  - `tour-settlement-docs` 버킷 연동을 위한 업로드/삭제 유틸 (`uploadSettlementDocument`, `deleteSettlementDocument`) 구현
  - `SettlementReceiptUploader`, `SettlementReceiptViewer` 컴포넌트 신설 및 `TourSettlementManager`에 "정산 자료" 탭 추가
  - 정산 자료 업로드/목록/미리보기/삭제/다운로드 플로우 완성
  - Supabase Storage 중복 파일 정리 (2025-04-14 순천 투어)
  - `scripts/migrate-settlement-docs.ts` 작성 (dry-run + 실제 업로드 지원)
- **변경 파일**:
  - `supabase/migrations/20251120_create_tour_settlement_documents.sql`
  - `utils/settlementDocsUpload.ts`
  - `components/admin/tours/SettlementReceiptUploader.tsx`
  - `components/admin/tours/SettlementReceiptViewer.tsx`
  - `scripts/migrate-settlement-docs.ts`
  - `components/admin/tours/TourSettlementManager.tsx`
- **남은 작업**:
  - OCR/AI 태깅 파이프라인 연동
  - 정산 상세에서 문서-비용 매핑 (자동 원가 반영)
  - 추가 연도 자료 업로드 자동화
- **상태**: ✅ 완료

## 2025-12-22 골프장 입금 내역 영수증 연결 기능 및 이미지 표시 개선

- **내용**:
  1. **이미지 미리보기 개선**: 영수증 이미지 전체 내용이 스크롤 가능하도록 수정
  2. **골프장 입금 내역 영수증 연결**: 카드 입금 내역에 영수증 문서 연결 기능 추가
     - 입금 내역에 `document_id` 필드 추가
     - 영수증 연결 모달 (`DepositReceiptLinker`) 컴포넌트 생성
     - 연결된 영수증 미리보기 기능
  3. **원가 입력 탭 영수증 이미지 표시**: 골프장 잔금 영수증을 원가 입력 탭에서 바로 확인 가능
     - 입금 내역에 연결된 영수증 썸네일 이미지 자동 표시
     - 썸네일 클릭 시 전체 이미지 모달 표시
     - 영수증 연결 시 자동으로 썸네일 로드
  4. **CardSMSUploader 제거**: 회사 카드 문자 내역 업로드는 정산 자료 업로드로 통합
- **변경 파일**:
  - `components/admin/tours/SettlementReceiptViewer.tsx`: 이미지 미리보기 스크롤 개선
  - `components/admin/tours/SettlementMappingModal.tsx`: 이미지 미리보기 스크롤 개선
  - `components/admin/tours/DepositReceiptLinker.tsx`: 영수증 연결 모달 컴포넌트 (신규)
  - `components/admin/tours/CardSMSUploader.tsx`: 삭제 (정산 자료 업로드로 통합)
  - `components/admin/tours/TourSettlementManager.tsx`: 
    - 입금 내역에 영수증 연결 버튼 및 썸네일 표시 기능 추가
    - CardSMSUploader 제거
    - 영수증 썸네일 자동 로드 로직 추가
- **데이터 구조**:
  - `tour_expenses.golf_course_settlement[].deposits[].document_id`: 연결된 영수증 문서 ID
- **향후 계획**:
  - 회사 카드 정보를 데이터베이스 테이블로 관리 (필요 시)
  - 골프장별 카드 오픈 정보 관리 기능

## 2025-12-22 정산 관리 UI/UX 전면 개선

- **내용**:
  1. **정산 목록 페이지 개선**:
     - 시작일-종료일 표시 (기간 컬럼으로 통합)
     - 테이블 컴팩트화 (폰트 크기 `text-xs`, padding `px-3 py-2`로 축소)
     - 상세보기 버튼을 배지 스타일로 변경 및 첫 번째 컬럼에 아이콘 추가
     - 상품명 뱃지 확장 및 축약 표시 (고창풀, 영덕풀, 순천풀 등)
  2. **정산 세부 페이지 개선**:
     - 투어 정보 헤더 카드 추가 (투어명, 기간, 참가자 수)
     - 시작일-종료일 표시
  3. **정산 자료 연결 개선**:
     - 영수증 썸네일 이미지 표시 개선
     - 검증일 한 줄 표시
- **변경 파일**:
  - `app/admin/settlements/page.tsx`: 정산 목록 페이지 UI 개선
  - `components/admin/tours/TourSettlementManager.tsx`: 정산 세부 페이지 UI 개선
- **개선 효과**:
  - 테이블 가독성 향상 (더 많은 정보를 한 화면에 표시)
  - 상세보기 버튼 접근성 개선 (드래그 없이 바로 클릭 가능)
  - 투어 정보 한눈에 파악 가능

## 2025-12-22 정산 관리 원가 입력 개선 및 잔금 영수증 연결 기능

- **내용**:
  1. **세금계산서/영수증 정보 중복 제거**:
     - 골프장 정산 섹션의 세금계산서/영수증 정보 제거
     - 입금 내역별로만 세금계산서/영수증 정보 관리
  2. **분할 납부 순번 기능 추가**:
     - 입금 내역에 순번 필드 추가 (sequence)
     - 입금 추가 시 자동으로 순번 할당
     - 입금 삭제 시 순번 자동 재정렬
     - "입금 1차", "입금 2차" 형태로 표시
  3. **잔금.jpg 골프장 입금 내역 연결 기능**:
     - 정산 자료 목록에서 "잔금" 키워드가 포함된 파일에 "골프장 입금에 연결" 버튼 표시
     - 클릭 시 골프장 입금 내역 선택 모달 자동 열기
     - 카드 입금 우선 선택, 없으면 첫 번째 입금 선택
     - DepositReceiptLinker에서 잔금 파일(expenses 카테고리)도 표시하도록 개선
  4. **검증일 한 줄 표시**:
     - 모든 검증일을 한 줄로 통일 표시
- **변경 파일**:
  - `components/admin/tours/TourSettlementManager.tsx`: 
    - 골프장 정산 섹션의 세금계산서 정보 제거
    - 입금 내역 순번 필드 추가 및 표시
    - 잔금 파일 연결 콜백 추가
    - 검증일 한 줄 표시
  - `components/admin/tours/SettlementReceiptViewer.tsx`: 
    - 잔금 파일 감지 및 골프장 입금 연결 버튼 추가
  - `components/admin/tours/DepositReceiptLinker.tsx`: 
    - 잔금 파일(expenses 카테고리)도 표시하도록 필터링 개선
- **개선 효과**:
  - 세금계산서 정보 중복 제거로 UI 단순화
  - 분할 납부 순번으로 입금 내역 관리 용이
  - 잔금 영수증을 골프장 입금 내역에 쉽게 연결 가능

## 2025-12-22 에러 수정 및 안정성 개선

**내용**:
1. **입금 순번 배지 스타일 적용**:
   - 입금 1차: 파란색 배지 (`bg-blue-100 text-blue-800`)
   - 입금 2차: 초록색 배지 (`bg-green-100 text-green-800`)
   - 입금 3차 이상: 보라색 배지 (`bg-purple-100 text-purple-800`)
   - 텍스트에서 배지 스타일로 변경하여 시각적 구분 개선

2. **영수증 URL null 체크 및 에러 처리**:
   - `createSettlementSignedUrl`이 `null`을 반환할 경우 처리 추가
   - 영수증 미리보기 및 썸네일 로드 시 에러 메시지 표시
   - 사용자에게 명확한 에러 피드백 제공

3. **Supabase 쿼리 에러 처리 개선**:
   - `.single()` 대신 `.maybeSingle()` 사용하여 데이터 없음 상황 처리
   - 쿼리 에러 발생 시 콘솔 로그 및 사용자 알림 추가
   - 썸네일 로드 실패 시 무한 로딩 방지

4. **Service Worker CORS 에러 수정**:
   - Supabase 요청을 Service Worker에서 완전히 제외
   - POST 요청 및 외부 API 요청을 Service Worker가 가로채지 않도록 수정
   - 정적 리소스만 캐시 처리하도록 개선

5. **로그인 페이지 에러 처리 개선**:
   - CORS 에러 및 네트워크 에러에 대한 명확한 메시지 표시
   - 사용자 정보 조회 실패 시 에러 처리 추가
   - 예외 상황에 대한 상세한 에러 메시지 제공

**변경 파일**:
- `components/admin/tours/TourSettlementManager.tsx`: 입금 순번 배지, 영수증 에러 처리, 썸네일 로드 에러 처리 개선
- `public/sw.js`: Service Worker에서 Supabase 요청 완전 제외
- `app/login/page.tsx`: 로그인 에러 처리 개선
- `utils/settlementMapping.ts`: 타입 에러 수정 (user.data.user → userData?.user)
- `docs/project_plan.md`: 에러 수정 내용 문서화

**개선 효과**:
- 입금 순번이 배지로 표시되어 시각적 구분이 명확해짐
- 영수증 로드 실패 시 명확한 에러 메시지로 사용자 경험 개선
- Service Worker가 Supabase 요청을 가로채지 않아 CORS 에러 해결
- 로그인 실패 시 원인을 파악하기 쉬운 에러 메시지 제공