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

## 2025-11-24 회의록 게시판 시스템 개발 시작

- **내용**: 싱싱골프와 외부업체(코코넛 골프투어 등) 협업을 위한 회의록 게시판 시스템 구축
- **목표**:
  - 협업 업체 정보 관리
  - 회의록 작성/조회/수정/삭제
  - 회의록 첨부파일 관리 (이미지, PDF)
  - Action Items 추적
  - 비교표 및 상세 정보 관리
- **데이터베이스 설계**:
  - `partner_companies` 테이블: 협업 업체 정보
  - `meeting_minutes` 테이블: 회의록 정보
  - `meeting_minute_attachments` 테이블: 첨부파일 정보
  - Supabase Storage 버킷: `meeting-attachments`
- **구현 단계**:
  1. 데이터베이스 마이그레이션 ✅ (완료)
  2. 사이드바 메뉴 추가 ✅ (완료)
  3. 협업 업체 관리 ✅ (완료)
  4. 회의록 게시판 기본 기능 ✅ (완료)
  5. 첨부파일 관리 ✅ (완료)
  6. 초기 데이터 입력 ✅ (완료)
- **변경 파일**:
  - `components/admin/ModernAdminSidebar.tsx`: 협업 관리 메뉴 추가
  - `@types/partner.ts`: 협업 업체 타입 정의
  - `@types/meeting.ts`: 회의록 타입 정의
  - `app/admin/partners/page.tsx`: 협업 업체 목록 페이지
  - `app/admin/partners/new/page.tsx`: 협업 업체 등록 페이지
  - `app/admin/partners/[id]/page.tsx`: 협업 업체 상세/수정 페이지
  - `app/admin/meetings/page.tsx`: 회의록 목록 페이지
  - `app/admin/meetings/new/page.tsx`: 회의록 작성 페이지
  - `app/admin/meetings/[id]/page.tsx`: 회의록 상세 페이지
  - `app/admin/meetings/[id]/edit/page.tsx`: 회의록 수정 페이지
  - `utils/meetingUpload.ts`: 첨부파일 업로드 유틸리티
  - `components/admin/meetings/MeetingAttachmentUploader.tsx`: 첨부파일 업로더 컴포넌트
  - `scripts/create-meeting-minutes.ts`: 초기 회의록 데이터 생성 스크립트
- **완료된 기능**:
  - 협업 업체 목록 조회 (검색, 필터링)
  - 협업 업체 등록/수정/삭제
  - 회의록 목록 조회 (검색, 필터링 - 유형별, 상태별, 업체별)
  - 회의록 작성 (기본 정보, 참석자, 회의 내용, Action Items, 태그)
  - 회의록 상세 보기 (탭 구조: 내용/비교표/Action Items/첨부파일)
  - 회의록 수정/삭제
  - 첨부파일 업로드/삭제 (드래그 앤 드롭 지원)
  - 첨부파일 미리보기 및 다운로드
  - 초기 회의록 데이터 생성 (코코넛 골프투어 협업 회의 2건)
- **생성된 데이터**:
  - 협업 업체: 코코넛 골프투어 (베트남 하노이)
  - 회의록 1: 2025-11-24 전화 통화
  - 회의록 2: 2025-12-01 대면 회의 (마스골프 오피스)
- **RLS 정책 설정**:
  - `meeting_minutes` 테이블: SELECT, INSERT, UPDATE, DELETE 정책 추가 ✅
  - `partner_companies` 테이블: SELECT, INSERT, UPDATE, DELETE 정책 추가 ✅
  - `meeting_minute_attachments` 테이블: SELECT, INSERT, DELETE 정책 추가 ✅
  - 마이그레이션 파일: `supabase/migrations/20251124_meeting_minutes_rls.sql`
- **2025-12-02 추가 작업**:
  - 신희갑 프로 협력업체 등록 ✅
    - 이름: 신희갑 프로
    - 전화번호: 010-8442-7773
    - 페이스북: https://www.facebook.com/hee.gab.shin
    - 국가: 베트남
    - 스크립트: `scripts/add-partner-shin-hee-gab.ts`
  - 비교표 탭 표시 개선 ✅
    - 비교표 탭이 항상 표시되도록 수정 (데이터 유무와 관계없이)
    - 비교표 데이터가 없을 때 안내 메시지 표시
    - 파일: `app/admin/meetings/[id]/page.tsx`
  - 논의 사항 섹션에 비교표 테이블 추가 ✅
    - 논의 사항 섹션에서 `comparison_data`가 있으면 테이블로 표시
    - 비교표 테이블이 먼저 표시되고, 비교표가 없을 때만 `discussion` 텍스트 표시
    - 파일: `app/admin/meetings/[id]/page.tsx`
  - 비교표 데이터 업데이트 ✅
    - 콩골프 vs 코코넛투어 비교표 데이터 업데이트
    - 새로운 항목 추가: 운영자 (사촌형 운영 vs 양일성 대표 운영)
    - 기존 항목 수정:
      - 플랫폼: 상세 정보 추가 (URL 포함)
      - 가이드: "X" → "가이드 없음"으로 변경
      - 호텔: "한정적" → "한정적(싱싱에서 직접 컨텍)"으로 변경
      - 기사: 코코넛투어 "좌동"으로 변경
    - 회의록 ID: a09ae16f-b84d-46e3-a653-df418baa9141
  - 버스 기사 협업 업체 등록 ✅ (2025-12-02)
    - 싱싱골프 주력 패키지 투어 협력 기사 14명 등록
    - 등록된 기사: 권은준, 김광수, 양영식, 김상석, 송윤해, 김경철, 주병성, 김성팔(메인), 신희철, 안광인, 추대연, 엄태동, 유중현(45인승, 2024년 연계약), 어울림(김상보 이사, 서성용 기사, 가격 내고 힘듬)
    - 스크립트: `scripts/add-bus-drivers.ts` (실행 완료 후 삭제)
  - 신경철 협업 업체 등록 ✅ (2025-12-08)
    - 이름: 신경철
    - 전화번호: 010-5233-2020
    - 비고: [파인힐스] 2박3일 순천버스핑 (2025. 6. 16.)\n김성팔 지인
    - 스크립트: `scripts/add-partner-shin-kyung-chul.ts` (실행 완료 후 삭제)
- **2025-12-02 보안 업데이트**:
  - Next.js 취약점 패치 ✅
    - Next.js 버전: 15.3.1 → 15.3.6 업데이트
    - eslint-config-next 버전: 15.3.1 → 15.3.6 업데이트
    - Vercel Agent가 자동으로 생성한 수정사항 병합
    - React Flight / Next.js RCE 취약점 해결
    - 빌드 테스트 통과 확인
    - 변경 파일: `package.json`, `package-lock.json`
- **2025-12-08 고객 투어 이력 업데이트**:
  - 2025년 투어 데이터 기반 고객 투어 이력 일괄 업데이트 ✅
    - 2025년 투어 21개 발견
    - 참가자 데이터 253개 처리
    - 총 46명의 고객 통계 계산 및 업데이트
    - 업데이트: 18명 (기존 고객)
    - 신규 생성: 28명 (참가자 데이터에서 자동 생성)
    - 업데이트 항목: `total_tour_count`, `last_tour_date`, `first_tour_date`
    - 스크립트: `scripts/update-customer-tour-history-2025.ts` (실행 완료 후 삭제)
- **2025-12-08 협업 업체 분류 및 뷰 전환 기능**:
  - 협업 업체 카테고리 필드 추가 ✅
    - `category` VARCHAR(50): 업체 분류 (해외업체, 해외랜드, 국내부킹, 버스기사, 프로, 기타)
    - 인덱스 추가: `idx_partner_companies_category`
    - 기존 데이터 자동 분류 마이그레이션 (이름과 비고 필드 기반)
    - 마이그레이션 파일: `supabase/migrations/20251208_add_partner_category.sql`
  - 프론트엔드 개선 ✅
    - 카테고리 필터 추가 (전체 분류 드롭다운)
    - 뷰 전환 기능 추가 (카드뷰/리스트뷰 토글)
    - 카드뷰: 카테고리 배지 표시
    - 리스트뷰: 테이블 형식으로 표시 (업체명, 분류, 지역, 담당자, 연락처, 상태, 작업)
    - 등록/수정 폼에 카테고리 선택 필드 추가
    - 상세 페이지에 카테고리 표시
    - 파일: `app/admin/partners/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/partners/[id]/page.tsx`, `@types/partner.ts`
- **2025-12-08 고객 정보 필드 확장**:
  - 고객 테이블에 새로운 필드 추가 ✅
    - `position` VARCHAR(50): 직급 (총무, 회장, 방장)
    - `activity_platform` VARCHAR(50): 활동 플랫폼 (밴드, 당근마켓, 모임(오프라인), 카카오톡, 기타)
    - `referral_source` VARCHAR(50): 유입경로 (네이버블로그, 홈페이지, 네이버검색, 구글검색, 지인추천, 페이스북 광고, 인스타그램 광고, 카카오톡 채널, 기타)
    - `last_contact_at` TIMESTAMP: 최근 연락 일시
    - `unsubscribed` BOOLEAN: 수신거부 여부
    - `unsubscribed_reason` TEXT: 수신거부 사유
    - 인덱스 추가: `idx_customers_position`, `idx_customers_activity_platform`, `idx_customers_referral_source`, `idx_customers_last_contact_at`, `idx_customers_unsubscribed`
    - 마이그레이션 파일: `supabase/migrations/20251208_add_customer_fields.sql`
  - 프론트엔드 개선 ✅
    - 고객 유형 드롭다운: "신규" 제거, "일반", "VIP"만 표시
    - 폼에 필드 추가: 직급, 활동 플랫폼, 유입경로, 최근 연락, 수신거부
    - 고객 목록 테이블 개선:
      - 투어 이력 컬럼: 최초 투어일, 마지막 투어일 표시
      - 최근 연락 컬럼 추가
      - 수신거부 컬럼 추가 (수신거부/수신동의 배지 표시)
    - 파일: `app/admin/customers/page.tsx`
- **2025-12-08 협업 업체 즐겨찾기(긴밀 협력) 기능**:
  - 데이터베이스 마이그레이션 ✅
    - `is_favorite` BOOLEAN: 긴밀 협력 업체 여부 (기본값: false)
    - 인덱스 추가: `idx_partner_companies_is_favorite`
    - 마이그레이션 파일: `supabase/migrations/20251208_add_partner_favorite.sql`
  - 프론트엔드 개선 ✅
    - 목록 페이지:
      - 하트 아이콘으로 즐겨찾기 토글 기능 (카드뷰/리스트뷰 모두)
      - 즐겨찾기 필터 추가 ("⭐ 긴밀 협력" 옵션)
      - 즐겨찾기 업체를 목록 상단에 정렬
    - 등록/수정 폼: 즐겨찾기 체크박스 추가
    - 상세 페이지: 즐겨찾기 상태 표시 (하트 아이콘)
    - 파일: `app/admin/partners/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/partners/[id]/page.tsx`, `@types/partner.ts`
- **2025-12-08 메뉴 구조 개선**:
  - 골프장 담당자 메뉴 이동 ✅
    - "고객 관리" 메뉴에서 "협업 관리" 메뉴로 이동
    - 협업 관련 기능을 한 곳에 통합 (협업 업체, 골프장 담당자, 회의록)
    - 파일: `components/admin/ModernAdminSidebar.tsx`
- **2025-12-09 협업 업체 기능 확장**:
  - 네이트온 필드 추가 ✅
    - `nateon_id` VARCHAR(100): 네이트온 ID 필드 추가
    - 인덱스 추가: `idx_partner_companies_nateon_id`
    - 등록/수정/상세 페이지에 네이트온 필드 추가
    - 목록 페이지에 네이트온 표시
    - 마이그레이션 파일: `supabase/migrations/20251209_add_nateon_and_update_partners.sql`
  - 카테고리 확장 ✅
    - "국내 버스패키지" 카테고리 추가
    - 카테고리 타입: `'해외업체' | '해외랜드' | '국내부킹' | '국내 버스패키지' | '버스기사' | '프로' | '기타'`
    - 등록/수정 폼 및 필터에 "국내 버스패키지" 옵션 추가
  - 데이터 마이그레이션 ✅
    - 이름에서 접미사 제거: `_버스기사`, `_국내부킹`, `_해외랜드`, `_해외단독`
    - 특정 골프장들을 "국내 버스패키지"로 변경:
      - 영덕 오션비치
      - 파인비치,솔라시도
      - 함평 엘리체
      - 순천 파인힐스
      - 고창 컨트리클럽
    - 파일: `@types/partner.ts`, `app/admin/partners/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/partners/[id]/page.tsx`