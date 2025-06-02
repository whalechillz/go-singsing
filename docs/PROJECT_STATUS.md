# 싱싱골프투어 프로젝트 상태

프로젝트의 주요 변경사항과 개발 진행 상황을 시간순으로 기록합니다.

## 프로젝트 개요
- **프로젝트명**: 싱싱골프투어 관리 시스템
- **URL**: go.singsinggolf.kr
- **프레임워크**: Next.js 15.3.1 + TypeScript
- **데이터베이스**: Supabase (PostgreSQL)
- **스타일링**: Tailwind CSS

---

## 변경 이력

### 2025-06-02 ✨ 데이터베이스 통합 및 UI 개선

#### 주요 변경사항
1. **데이터베이스 구조 개선**
   - boarding_guide 관련 3개 테이블을 기존 테이블로 통합
   - singsing_tours 테이블에 notices 필드 추가
   - singsing_schedules 테이블에 boarding_info 필드 추가
   - tour_schedule_preview 뷰 생성

2. **UI/UX 개선**
   - IntegratedScheduleManager 컴포넌트 생성 (일정, 탑승, 공지사항 통합)
   - TourSchedulePreview 개선 (3가지 뷰, PDF/인쇄/공유 기능)
   - 탭 구조 간소화 및 워크플로우 개선

3. **기능 통합**
   - 일정 관리, 탑승 정보, 공지사항을 하나의 인터페이스로 통합
   - 미리보기 기능 강화 (전체/탑승안내/간단 뷰)

#### 마이그레이션 가이드
```sql
-- 마이그레이션 파일 실행
-- /supabase/migrations/20250602_consolidate_boarding_tables.sql

-- 백업 확인 후 기존 테이블 삭제
DROP TABLE IF EXISTS boarding_guide_contacts;
DROP TABLE IF EXISTS boarding_guide_notices;
DROP TABLE IF EXISTS boarding_guide_routes;
```

---

### 2025-06-01 🚻 성별 표시 기능 추가

#### 주요 변경사항
1. **데이터베이스 변경**
   - singsing_participants 테이블에 gender 필드 추가
   - 허용값: 'M' (남성), 'F' (여성), NULL (미지정)

2. **표시 로직**
   - 팀 구성별 자동 표시 (혼성팀/남성팀/여성팀)
   - 혼성팀 내 소수 성별 개별 표시

3. **UI 개선**
   - 참가자 관리 폼에 성별 선택 추가
   - 엑셀 업로드 시 성별 컬럼 지원
   - 골프장 코스별 색상 구분 개선

---

### 2025-05-30 📋 5개 투어 관리 페이지 완성

#### 주요 변경사항
1. **투어 상세 페이지 구현**
   - 참가자 관리: `/admin/tours/[tourId]/participants`
   - 객실 배정: `/admin/tours/[tourId]/room-assignment`
   - 일정 관리: `/admin/tours/[tourId]/schedule`
   - 티오프 시간: `/admin/tours/[tourId]/tee-times`
   - 탑승 스케줄: `/admin/tours/[tourId]/boarding`

2. **기능 완성**
   - 투어별 상세 관리 기능
   - 통계 대시보드
   - 결제 관리 V3

---

### 2025-01-27 💰 결제 시스템 개선

#### 주요 변경사항
1. **결제 기능 고도화**
   - 계약금(30%)/잔금(70%) 자동 계산
   - 결제 상태 관리 (완료/대기/취소/환불)
   - 환불 처리 기능
   - 그룹 결제 최적화

2. **참가자 관리 개선**
   - 동반자 정보 UI 통합
   - 그룹 인원수 관리 개선
   - 일괄 결제 옵션 통합
   - 동반자 개별 삭제 기능

---

## 현재 데이터베이스 구조

### 주요 테이블
```
tour_products (여행상품 템플릿)
    └─→ singsing_tours (실제 투어)
            ├─→ singsing_participants (참가자)
            ├─→ singsing_schedules (일정)
            ├─→ singsing_tee_times (티타임)
            ├─→ singsing_rooms (객실)
            ├─→ singsing_payments (결제)
            └─→ singsing_tour_staff (스탭)
```

### 주요 뷰
- tour_schedule_preview: 투어 일정 미리보기 통합 뷰

---

## 주요 컴포넌트

| 컴포넌트 | 설명 | 상태 |
|----------|------|------|
| IntegratedScheduleManager | 통합 일정 관리 (일정, 탑승, 공지) | ✅ 최신 |
| TourSchedulePreview | 개선된 일정표 미리보기 | ✅ 최신 |
| ParticipantsManagerV2 | 참가자 관리 (성별 표시 포함) | ✅ 안정 |
| TeeTimeAssignmentManagerV2 | 티타임 배정 관리 | ✅ 안정 |
| RoomAssignmentManager | 객실 배정 관리 | ✅ 안정 |
| Dashboard | 통계 대시보드 | ✅ 안정 |

---

## 환경 설정

### 필수 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=https://weciawnqjutghprtpztg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
GITHUB_TOKEN=github_pat_...
```

### 개발 서버 실행
```bash
npm install
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

---

## 향후 계획

### 단기 (1-2개월)
1. **Phase 4**: 문서 생성 시스템 고도화
   - PDF 템플릿 커스터마이징
   - 다양한 문서 형식 지원
   - 고객별 맞춤 문서 생성

2. **Phase 5**: 권한 시스템
   - Supabase Auth 설정
   - RLS 정책 적용
   - 사용자 역할별 접근 제어

### 중기 (3-6개월)
1. **Phase 6**: 알림 시스템
   - 솔라피 API 연동 (알림톡)
   - 슬랙 연동 (내부 알림)
   - 이메일 알림

2. **모바일 최적화**
   - 반응형 디자인 개선
   - 터치 인터페이스 최적화
   - PWA 구현

### 장기 (6개월+)
1. **모바일 앱 개발**
2. **AI 기반 투어 추천**
3. **실시간 협업 기능**
4. **투어 사진 갤러리**

---

## 작업 가이드라인

### 데이터베이스 변경 시
1. 마이그레이션 파일 작성
2. 백업 테이블 생성
3. 변경사항 테스트
4. 롤백 계획 수립
5. 문서 업데이트

### 컴포넌트 개발 시
1. TypeScript 타입 정의
2. Tailwind safelist 확인
3. 통합 컴포넌트 우선 사용
4. 성능 최적화 고려
5. 접근성 확보

### 보안 고려사항
1. 환경 변수 관리
2. 고객 정보 보호
3. API 접근 제어
4. 로그 관리

---

## 관련 문서
- [빠른 시작 가이드](/docs/QUICK_START_GUIDE.md)
- [개발자 가이드](/docs/DEVELOPER_GUIDE.md)
- [데이터베이스 변경사항](/docs/DATABASE_CHANGES.md)
- [UI/UX 구조](/docs/ui-ux-structure.md)
- [시스템 구조](/docs/system-structure.md)

---
*최종 업데이트: 2025-06-02*
