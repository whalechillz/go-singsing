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
```

## 📁 주요 파일 위치

### 컴포넌트
- **티타임 관리**: `/components/TeeTimeAssignmentManagerV2.tsx`
- **참가자 관리**: `/components/ParticipantsManagerV2.tsx`
- **객실 관리**: `/components/RoomAssignmentManager.tsx`
- **대시보드**: `/components/Dashboard.tsx`

### 페이지
- **관리자 메인**: `/app/admin/page.tsx`
- **투어 관리**: `/app/admin/tours/page.tsx`
- **고객 페이지**: `/app/(customer)/page.tsx`

### 스타일
- **Tailwind 설정**: `/tailwind.config.js`
- **전역 스타일**: `/app/globals.css`
- **색상 정의**: `/styles/colors.js`

## 🛠 주요 기능별 작업

### 1. 참가자 성별 표시 기능
- **위치**: `/components/TeeTimeAssignmentManagerV2.tsx`
- **함수**: `analyzeTeamGender()`, `getGenderSuffix()`
- **DB 필드**: `singsing_participants.gender`

### 2. 티타임 배정
- **스마트 자동배정**: `handleSmartAutoAssign()`
- **그룹 이동**: `handleMoveTeeTimeGroup()`
- **일정 조정**: `handleAdjustGroupSchedule()`

### 3. 문서 출력
- **미리보기 생성**: `generatePreviewHTML()`
- **고객용/스탭용 구분**: `previewType` 상태

## 📊 데이터베이스 접속

### Supabase 대시보드
- URL: https://supabase.com/dashboard/project/weciawnqjutghprtpztg
- 테이블 편집기에서 직접 데이터 확인/수정 가능

### 주요 테이블
```sql
-- 참가자 조회
SELECT * FROM singsing_participants WHERE tour_id = '[TOUR_ID]';

-- 티타임 조회
SELECT * FROM singsing_tee_times WHERE tour_id = '[TOUR_ID]';

-- 배정 정보 조회
SELECT * FROM singsing_participant_tee_times;
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

3. **스타일 수정 시**
   - Tailwind 클래스 사용
   - safelist 확인 (동적 클래스)
   - 반응형 디자인 고려

---
*이 가이드는 새로운 개발 환경에서 빠르게 시작할 수 있도록 작성되었습니다.*
