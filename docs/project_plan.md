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

- **2025-05-28**
  - 티타임 배정 페이지에서 V2 컴포넌트(`TeeTimeAssignmentManagerV2`)로 교체
    - 파일: `app/admin/tours/[tourId]/page.tsx`
    - 구버전 import 및 사용 코드 제거, V2 import 및 사용으로 변경
  - 수정사항 커밋 및 원격 저장소 푸시, Vercel 자동 배포 진행
  - 남은 작업: 배포 완료 후 정상 동작 확인