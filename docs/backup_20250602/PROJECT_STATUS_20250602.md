# 싱싱골프투어 프로젝트 현황 (2025-06-02)

## 프로젝트 개요
- **프로젝트명**: 싱싱골프투어 관리 시스템
- **URL**: go.singsinggolf.kr
- **프레임워크**: Next.js 15.3.1 + TypeScript
- **데이터베이스**: Supabase (PostgreSQL)
- **스타일링**: Tailwind CSS

## 최근 변경사항

### 1. 데이터베이스 통합 및 UI 개선 (2025-06-02) ✨ NEW
- **테이블 통합**: 
  - boarding_guide_contacts → singsing_tour_staff로 통합
  - boarding_guide_notices → singsing_tours.notices 필드로 통합
  - boarding_guide_routes → singsing_schedules.boarding_info 필드로 통합
- **통합 일정 관리**: IntegratedScheduleManager 컴포넌트로 일정, 탑승 정보, 공지사항 통합 관리
- **미리보기 개선**: 여러 뷰 옵션과 PDF 다운로드, 인쇄, 공유 기능 추가
- **UI 간소화**: 탭 레이블 간소화 및 워크플로우 개선

### 2. 성별 표시 기능 추가 (2025-06-01)
- 참가자 테이블에 gender 필드 추가
- 팀 구성별 자동 표시 (혼성팀/남성팀/여성팀)
- 혼성팀 내 소수 성별 개별 표시

### 3. 색상 시스템 개선
- 골프장 코스별 색상 구분
- Tailwind safelist 최적화

## 주요 기능

### 관리자 기능
1. **투어 관리**
   - 투어 생성/수정/삭제
   - 통합 일정 관리 (일정, 탑승 정보, 공지사항)
   - 투어 정보 설정

2. **참가자 관리**
   - 참가자 등록/수정/삭제
   - 엑셀 일괄 업로드
   - 중복 참가자 정리
   - 성별 정보 관리

3. **티타임 관리**
   - 티타임별 참가자 배정
   - 스마트 자동 배정
   - 그룹 이동 및 일정 조정
   - 날짜별 일괄 처리

4. **객실 관리**
   - 객실 타입 설정
   - 참가자별 객실 배정
   - 객실 현황 조회

5. **문서 출력**
   - 통합 일정표 미리보기 (전체/탑승안내/간단)
   - PDF 다운로드 및 인쇄 기능
   - 공유 링크 생성

### 고객 기능
1. 투어 일정 조회
2. 참가 정보 확인
3. 공지사항 확인

## 데이터베이스 구조 (업데이트됨)

### 주요 테이블
1. **singsing_tours**: 투어 정보 (notices 필드 추가)
2. **singsing_participants**: 참가자 정보 (gender 필드 포함)
3. **singsing_tee_times**: 티타임 정보
4. **singsing_participant_tee_times**: 참가자-티타임 매핑
5. **singsing_rooms**: 객실 정보
6. **singsing_schedules**: 일정 정보 (boarding_info 필드 추가)
7. **singsing_tour_staff**: 투어 스탭 정보

### 새로운 뷰
- **tour_schedule_preview**: 투어 일정 미리보기를 위한 통합 뷰

### 삭제된 테이블
- ~~boarding_guide_contacts~~
- ~~boarding_guide_notices~~
- ~~boarding_guide_routes~~

## 주요 컴포넌트 변경

| 컴포넌트 | 설명 | 상태 |
|----------|------|------|
| IntegratedScheduleManager | 통합 일정 관리 (일정, 탑승, 공지) | ✨ NEW |
| TourSchedulePreview | 개선된 일정표 미리보기 | 🔄 개선됨 |
| ParticipantsManagerV2 | 참가자 관리 (성별 표시 포함) | ✅ 유지 |
| TeeTimeAssignmentManagerV2 | 티타임 배정 관리 | ✅ 유지 |
| RoomAssignmentManager | 객실 배정 관리 | ✅ 유지 |

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

## 데이터베이스 마이그레이션

### 2025-06-02 마이그레이션
```sql
-- 마이그레이션 파일 실행
-- /supabase/migrations/20250602_consolidate_boarding_tables.sql

-- 백업 확인 후 기존 테이블 삭제
DROP TABLE IF EXISTS boarding_guide_contacts;
DROP TABLE IF EXISTS boarding_guide_notices;
DROP TABLE IF EXISTS boarding_guide_routes;
```

## 작업 시 주의사항

1. **데이터베이스 변경**
   - 마이그레이션 파일 작성 필수
   - 백업 테이블 생성 후 진행
   - 롤백 계획 수립

2. **컴포넌트 수정**
   - TypeScript 타입 정의 확인
   - Tailwind 클래스 safelist 확인
   - 통합 컴포넌트 사용 권장

3. **성능 최적화**
   - 불필요한 API 호출 최소화
   - 통합 뷰 활용으로 쿼리 감소
   - 로컬 상태 관리 활용

4. **보안**
   - 환경 변수 노출 주의
   - 고객 정보 보호

## 향후 계획

1. **기능 개선**
   - 모바일 반응형 최적화
   - 실시간 알림 기능
   - 통계 대시보드
   - PDF 템플릿 커스터마이징

2. **성능 개선**
   - 이미지 최적화
   - 캐싱 전략 수립
   - 로딩 속도 개선

3. **사용성 개선**
   - UI/UX 개선
   - 접근성 향상
   - 다국어 지원

## 연락처
- 개발팀: MASLABS
- 문서 위치: /docs/

## 관련 문서
- [데이터베이스 통합 가이드](/docs/updates/DB_CONSOLIDATION_20250602.md)
- [성별 표시 기능 가이드](/docs/GENDER_DISPLAY_GUIDE.md)
- [빠른 시작 가이드](/docs/QUICK_START_GUIDE.md)

---
*최종 업데이트: 2025-06-02*