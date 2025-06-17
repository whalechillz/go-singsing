# 싱싱골프투어 프로젝트 현황

*최종 업데이트: 2025-06-18*

## 🚀 프로젝트 개요

- **프로젝트명**: 싱싱골프투어 관리 시스템
- **URL**: go.singsinggolf.kr
- **기술 스택**:
  - Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
  - Backend: Supabase (PostgreSQL)
  - 배포: Vercel

## 📊 현재 상태

### ✅ 구현 완료 기능

#### 1. 투어 관리
- 투어 CRUD (생성/조회/수정/삭제)
- 마케팅 표시 인원 관리
- 투어 마감 기능
- 자동 뱃지 시스템 (마감임박, 인기, 최저가)
- 수동 뱃지 설정

#### 2. 참가자 관리
- 참가자 등록/수정/삭제
- 실시간 참가자 수 자동 계산
- 성별 정보 관리
- 그룹/팀 관리

#### 3. 일정 관리
- 기본 일정표 (singsing_tours 필드)
- 일정 엿보기 (tour_journey_items + tourist_attractions)
- Day별 상세 일정
- 탑승 정보 관리

#### 4. 결제 관리
- 결제 내역 관리
- 환불 처리
- 결제 상태 추적

#### 5. 문서 시스템
- 고객용 일정표
- 스탭용 문서
- 권한별 차등 표시

## 🗂️ 데이터베이스 구조

### 핵심 뷰
- `tour_with_auto_badges` - 고객 페이지용 통합 뷰

### 주요 테이블
- `singsing_tours` - 투어 기본 정보
- `tour_journey_items` - 일정 항목
- `tourist_attractions` - 장소 정보
- `singsing_participants` - 참가자
- `singsing_payments` - 결제
- `tour_products` - 투어 상품

자세한 내용은 [DATA_STRUCTURE_GUIDE.md](./DATA_STRUCTURE_GUIDE.md) 참조

## 🔄 진행 중인 작업

1. **일정 관리 UI 개선**
   - tour_journey_items 관리 인터페이스
   - tourist_attractions 데이터 입력 도구

2. **문서 시스템 고도화**
   - PDF 다운로드
   - 이메일 발송

## 🐛 알려진 이슈

1. **데이터 일관성**
   - singsing_tours의 레거시 필드 정리 필요
   - 일부 중복 데이터 존재

2. **성능**
   - 대량 참가자 조회시 최적화 필요
   - 이미지 로딩 최적화

## 📝 다음 단계

### Phase 1: 데이터 정리 (1주)
- [ ] 레거시 필드 마이그레이션
- [ ] 미사용 테이블 정리
- [ ] 인덱스 최적화

### Phase 2: UI/UX 개선 (2주)
- [ ] 일정 관리 통합 UI
- [ ] 모바일 최적화
- [ ] 대시보드 개선

### Phase 3: 기능 고도화 (3주)
- [ ] 알림 시스템 (카카오톡)
- [ ] 자동 배정 시스템
- [ ] 고급 통계/분석

## ⚠️ 주의사항

1. **데이터 작업시**
   - `tour_with_auto_badges`는 뷰이므로 직접 수정 불가
   - `current_participants`는 자동 계산 필드
   - 마이그레이션 전 백업 필수

2. **코드 작업시**
   - 데이터 레이어 구분 명확히
   - TypeScript 타입 정의 확인
   - 테스트 환경 먼저 검증

## 📞 문의
- 기술 문의: [개발팀 연락처]
- 비즈니스 문의: 031-215-3990

---

관련 문서:
- [DATA_STRUCTURE_GUIDE.md](./DATA_STRUCTURE_GUIDE.md)
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- [deployment_guide.md](./deployment_guide.md)