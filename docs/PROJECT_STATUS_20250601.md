# 싱싱골프투어 프로젝트 현황 (2025-06-01)

## 프로젝트 개요
- **프로젝트명**: 싱싱골프투어 관리 시스템
- **URL**: go.singsinggolf.kr
- **프레임워크**: Next.js 15.3.1 + TypeScript
- **데이터베이스**: Supabase (PostgreSQL)
- **스타일링**: Tailwind CSS

## 최근 변경사항

### 1. 성별 표시 기능 추가 (2025-06-01)
- 참가자 테이블에 gender 필드 추가
- 팀 구성별 자동 표시 (혼성팀/남성팀/여성팀)
- 혼성팀 내 소수 성별 개별 표시

### 2. 색상 시스템 개선
- 골프장 코스별 색상 구분
- Tailwind safelist 최적화

## 주요 기능

### 관리자 기능
1. **투어 관리**
   - 투어 생성/수정/삭제
   - 투어 일정 관리
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
   - 고객용/스탭용 구분
   - 라운딩 시간표
   - 탑승 안내문
   - 객실 배정표

### 고객 기능
1. 투어 일정 조회
2. 참가 정보 확인
3. 공지사항 확인

## 디렉토리 구조
```
go2.singsinggolf.kr/
├── app/                    # Next.js App Router
│   ├── (customer)/        # 고객용 페이지
│   ├── admin/             # 관리자 페이지
│   └── tour-schedule/     # 투어 일정
├── components/            # React 컴포넌트
│   ├── admin/            # 관리자 전용 컴포넌트
│   ├── ui/               # UI 컴포넌트
│   └── *.tsx             # 기능별 컴포넌트
├── lib/                   # 유틸리티
├── styles/               # 스타일 파일
├── supabase/             # DB 설정
└── docs/                 # 문서
```

## 데이터베이스 구조

### 주요 테이블
1. **singsing_tours**: 투어 정보
2. **singsing_participants**: 참가자 정보 (gender 필드 포함)
3. **singsing_tee_times**: 티타임 정보
4. **singsing_participant_tee_times**: 참가자-티타임 매핑
5. **singsing_rooms**: 객실 정보
6. **singsing_schedules**: 일정 정보

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

## 작업 시 주의사항

1. **데이터베이스 변경**
   - 마이그레이션 파일 작성 필수
   - 롤백 계획 수립

2. **컴포넌트 수정**
   - TypeScript 타입 정의 확인
   - Tailwind 클래스 safelist 확인

3. **성능 최적화**
   - 불필요한 API 호출 최소화
   - 로컬 상태 관리 활용

4. **보안**
   - 환경 변수 노출 주의
   - 고객 정보 보호

## 향후 계획

1. **기능 개선**
   - 모바일 반응형 최적화
   - 실시간 알림 기능
   - 통계 대시보드

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
- 이메일: [이메일 주소]
- 문서 위치: /docs/

---
*최종 업데이트: 2025-06-01*
