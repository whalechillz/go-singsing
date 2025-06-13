# 싱싱골프투어 로그인 시스템 (기존 테이블 활용)

## 개요
기존 `active_users` 테이블을 활용한 역할 기반 로그인 시스템이 구현되었습니다.

## 데이터베이스 구조

### 기존 테이블 활용
- **active_users**: 직원 정보 및 역할 관리
- **users**: 추가 사용자 정보
- **roles**: 역할 정의
- **tour_staff_details**: 투어별 스탭 상세 정보

## 주요 기능

### 1. 로그인 페이지 (`/login`)
- 이메일과 비밀번호를 사용한 인증
- 역할별 리다이렉트 (관리자/매니저 → `/admin`, 스탭 → `/`)
- 로그인 상태에서 접근 시 자동으로 홈으로 리다이렉트

### 2. 인증 관리 (`/lib/auth.ts`)
- 사용자 정보 조회: `getCurrentUser()` - active_users 테이블 우선 조회
- 로그아웃: `signOut()`
- 역할 확인: `checkUserRole()`
- 세션 관리: `getSession()`
- 활성화 상태 확인: `isUserActive()`

### 3. 역할 구분
- **관리자 (admin)**: 모든 기능 접근 가능
- **매니저 (manager)**: 투어 관리, 고객 관리 가능
- **스탭 (staff)**: 투어 정보 조회 및 기본 업무
- **고객 (customer)**: 일반 사용자

### 4. 미들웨어 보호
- `/admin/*` 경로는 인증 필요
- 비활성화된 사용자는 접근 불가
- 스탭과 고객은 관리자 페이지 접근 불가
- 미인증 사용자는 로그인 페이지로 리다이렉트

### 5. UI 개선사항
- 헤더에 사용자 정보 표시
- 활성화 상태 표시 (비활성 사용자는 "(비활성)" 표시)
- 역할별 접근 가능한 메뉴 표시
- 로그아웃 버튼
- 관리자/매니저는 관리자 페이지 링크 표시

## 테스트 계정

```
관리자: admin@singsinggolf.kr / admin123!
매니저: manager@singsinggolf.kr / manager123!
스탭: staff@singsinggolf.kr / staff123!
```

## 데이터베이스 설정

### 1. Supabase에서 마이그레이션 실행
```sql
-- /supabase/migrations/001_auth_setup.sql 파일 내용을 실행
```

### 2. 환경 변수 설정
`.env.local` 파일에 다음 변수 확인:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 사용 방법

### 로그인
1. `/login` 페이지 접속
2. 이메일과 비밀번호 입력
3. 역할에 따라 적절한 페이지로 리다이렉트

### 로그아웃
1. 헤더의 로그아웃 버튼 클릭
2. 자동으로 홈페이지로 리다이렉트

### 권한 확인
- 스탭 모드는 로그인한 직원에게 자동으로 활성화
- 관리자와 매니저는 추가로 관리자 페이지 접근 가능
- 비활성화된 사용자는 로그인 불가

## active_users 테이블 필드
- `id`: 사용자 고유 ID
- `name`: 이름
- `email`: 이메일
- `phone`: 전화번호
- `role`: 역할 (admin/manager/staff/customer)
- `is_active`: 활성화 상태
- `team`: 소속 팀
- `department`: 부서
- `password_hash`: 비밀번호 해시 (Supabase Auth 사용 시 불필요)

## 보안 고려사항
- 비밀번호는 Supabase Auth에서 안전하게 관리
- RLS(Row Level Security) 정책으로 데이터 접근 제한
- 미들웨어를 통한 라우트 보호
- 세션 기반 인증
- 비활성화된 사용자 접근 차단

## 추가 개발 사항
- [ ] 비밀번호 재설정 기능
- [ ] 사용자 프로필 편집 기능
- [ ] 2단계 인증
- [ ] 활동 로그 기록
- [ ] 사용자 활성화/비활성화 관리 기능
