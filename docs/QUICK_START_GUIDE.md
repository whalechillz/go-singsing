# 싱싱골프투어 빠른 시작 가이드

## 🚀 프로젝트 시작하기

### 1. 프로젝트 클론 및 설정
```bash
# 프로젝트 디렉토리로 이동
cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. 환경 변수 확인
`.env.local` 파일이 있는지 확인하세요. 없다면 아래 내용으로 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=https://weciawnqjutghprtpztg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GITHUB_TOKEN=github_pat_...
```

## 📁 주요 파일 위치

### 핵심 컴포넌트 ✨ NEW
- **통합 일정 관리**: `/components/IntegratedScheduleManager.tsx`
- **일정표 미리보기**: `/components/TourSchedulePreview.tsx`
- **티타임 관리**: `/components/TeeTimeAssignmentManagerV2.tsx`
- **참가자 관리**: `/components/ParticipantsManagerV2.tsx`
- **객실 관리**: `/components/RoomAssignmentManager.tsx`
- **대시보드**: `/components/Dashboard.tsx`

### 페이지
- **관리자 메인**: `/app/admin/page.tsx`
- **투어 관리**: `/app/admin/tours/page.tsx`
- **투어 상세**: `/app/admin/tours/[tourId]/page.tsx`
- **고객 페이지**: `/app/(customer)/page.tsx`

### 스타일
- **Tailwind 설정**: `/tailwind.config.js`
- **전역 스타일**: `/app/globals.css`
- **색상 정의**: `/styles/colors.js`

## 🛠 주요 기능별 작업

### 1. 통합 일정 관리 ✨ NEW
- **위치**: `/components/IntegratedScheduleManager.tsx`
- **기능**: 일정, 탑승 정보, 공지사항을 하나의 UI에서 관리
- **하위 탭**: 
  - 일정 관리: 날짜별 일정 및 활동
  - 탑승 정보: 각 날짜별 탑승 시간/장소
  - 공지사항: 투어 전체 공지사항

### 2. 투어 일정표 미리보기 ✨ UPDATED
- **위치**: `/components/TourSchedulePreview.tsx`
- **뷰 옵션**:
  - 전체 일정표: 상세한 모든 정보
  - 탑승 안내문: 고객용 탑승 안내
  - 간단 일정표: 핵심 정보만 표시
- **기능**: PDF 다운로드, 인쇄, 공유 링크 생성

### 3. 참가자 성별 표시 기능
- **위치**: `/components/TeeTimeAssignmentManagerV2.tsx`
- **함수**: `analyzeTeamGender()`, `getGenderSuffix()`
- **DB 필드**: `singsing_participants.gender`
- **표시 방식**: 혼성팀/남성팀/여성팀 자동 구분

### 4. 티타임 배정
- **스마트 자동배정**: `handleSmartAutoAssign()`
- **그룹 이동**: `handleMoveTeeTimeGroup()`
- **일정 조정**: `handleAdjustGroupSchedule()`

## 📊 데이터베이스 접속

### Supabase 대시보드
- URL: https://supabase.com/dashboard/project/weciawnqjutghprtpztg
- 테이블 편집기에서 직접 데이터 확인/수정 가능

### 주요 테이블 (2025-06-02 업데이트)
```sql
-- 투어 조회 (공지사항 포함)
SELECT * FROM singsing_tours WHERE id = '[TOUR_ID]';

-- 일정 조회 (탑승 정보 포함)
SELECT * FROM singsing_schedules WHERE tour_id = '[TOUR_ID]';

-- 투어 일정 미리보기 (통합 뷰)
SELECT * FROM tour_schedule_preview WHERE tour_id = '[TOUR_ID]';

-- 참가자 조회 (성별 포함)
SELECT * FROM singsing_participants WHERE tour_id = '[TOUR_ID]';

-- 투어 스탭 조회
SELECT * FROM singsing_tour_staff WHERE tour_id = '[TOUR_ID]';
```

## 🐛 문제 해결

### 색상이 적용되지 않을 때
```bash
# Tailwind CSS 재빌드
npm run build

# 캐시 삭제 후 재시작
rm -rf .next
npm run dev
```

### 데이터가 표시되지 않을 때
1. 브라우저 개발자 도구 > Network 탭 확인
2. Supabase API 응답 확인
3. 콘솔 에러 메시지 확인

### 마이그레이션 적용
```sql
-- 최신 마이그레이션 파일 확인
-- /supabase/migrations/

-- Supabase SQL Editor에서 실행
-- 예: 20250602_consolidate_boarding_tables.sql
```

## 📝 자주 사용하는 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드된 앱 실행
npm start

# 코드 검사
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit
```

## 🔗 유용한 링크

- **라이브 사이트**: https://go.singsinggolf.kr
- **관리자 페이지**: https://go.singsinggolf.kr/admin
- **Supabase 대시보드**: https://supabase.com/dashboard/project/weciawnqjutghprtpztg
- **GitHub 저장소**: https://github.com/whalechillz/tsx-gallery-cursor

## 💡 개발 팁

1. **컴포넌트 수정 시**
   - TypeScript 타입 먼저 확인
   - Props 인터페이스 정의
   - 에러 처리 추가

2. **DB 스키마 변경 시**
   - 마이그레이션 파일 작성
   - TypeScript 타입 업데이트
   - 관련 컴포넌트 수정
   - [DATABASE_CHANGES.md](/docs/DATABASE_CHANGES.md) 문서 업데이트

3. **스타일 수정 시**
   - Tailwind 클래스 사용
   - safelist 확인 (동적 클래스)
   - 반응형 디자인 고려

4. **새로운 기능 추가 시**
   - 통합 컴포넌트 우선 고려
   - 기존 컴포넌트 재사용
   - 문서 업데이트 필수

## 🔄 최근 주요 변경사항

1. **2025-06-02**: 데이터베이스 테이블 통합, IntegratedScheduleManager 추가
2. **2025-06-01**: 참가자 성별 필드 추가
3. **2025-05-30**: 5개 투어 상세 페이지 완성

자세한 변경사항은 [PROJECT_STATUS.md](/docs/PROJECT_STATUS.md) 참조

---
*이 가이드는 새로운 개발 환경에서 빠르게 시작할 수 있도록 작성되었습니다.*
*최종 업데이트: 2025-06-02*
