# 싱싱골프투어 인증 시스템 아키텍처

## 시스템 구조

### 1. 데이터베이스 테이블 관계

```
auth.users (Supabase Auth 내장)
    ↓ (트리거로 자동 동기화)
active_users (기존 테이블)
    ↓ (역할 참조)
roles (역할 정의)
    ↓
tour_staff_details (투어별 스탭 배정)
```

### 2. 인증 흐름

```
1. 로그인 요청 → Supabase Auth
2. auth.users 확인 → 세션 생성
3. active_users 조회 → 역할/권한 확인
4. 미들웨어 검증 → 페이지 접근 허용/거부
```

## 테이블 상세 설명

### active_users (메인 사용자 테이블)
- **용도**: 직원 정보 및 역할 관리
- **주요 필드**:
  - `id`: auth.users의 ID와 매칭
  - `email`: 로그인 이메일
  - `name`: 사용자 이름
  - `role`: 역할 (admin/manager/staff)
  - `is_active`: 활성화 상태
  - `team`: 소속 팀
  - `department`: 부서
  - `phone`: 연락처

### users (보조 사용자 테이블)
- **용도**: 추가 사용자 정보 저장
- **참고**: active_users가 주 테이블, users는 보조

### roles (역할 정의)
- **용도**: 시스템 역할 및 권한 정의
- **주요 필드**:
  - `name`: 역할명
  - `permissions`: 권한 정보 (JSON)

### tour_staff_details (투어 스탭 배정)
- **용도**: 투어별 스탭 배정 정보
- **주요 필드**:
  - `tour_id`: 투어 ID
  - `user_id`: 스탭 ID (active_users.id)
  - `role`: 투어에서의 역할

## 보안 정책 (RLS)

### active_users 테이블
1. **자기 정보 조회**: 모든 사용자 가능
2. **전체 조회**: 관리자만 가능
3. **정보 수정**: 관리자 또는 본인 (역할 제외)
4. **역할 변경**: 관리자만 가능

## 역할별 권한

### 관리자 (admin)
- 모든 기능 접근
- 사용자 관리
- 시스템 설정
- 전체 데이터 조회/수정

### 매니저 (manager)
- 투어 관리
- 고객 관리
- 스탭 일정 관리
- 보고서 조회

### 스탭 (staff)
- 투어 정보 조회
- 담당 투어 문서 접근
- 기본 업무 수행

### 고객 (customer)
- 공개 정보 조회
- 본인 투어 정보 확인

## 미들웨어 라우팅

```typescript
// 보호된 경로
/admin/*     → admin, manager만 접근
/staff/*     → admin, manager, staff 접근
/customer/*  → 로그인한 모든 사용자
/login       → 비로그인 사용자만
/*           → 모든 사용자
```

## 세션 관리

### 세션 생성
- Supabase Auth가 JWT 토큰 발급
- 쿠키에 저장 (httpOnly, secure)
- 기본 만료: 1주일

### 세션 갱신
- 자동 갱신 (액세스 시)
- 수동 갱신 가능

### 세션 종료
- 명시적 로그아웃
- 만료 시 자동 종료
- 비활성화 사용자 즉시 종료

## 개발 환경 설정

### 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key (서버 전용)
```

### 로컬 개발
1. Supabase CLI 설치
2. `supabase start` 실행
3. 로컬 DB에 마이그레이션 적용

## 운영 가이드

### 모니터링
- 로그인 실패 횟수 추적
- 비정상 접근 시도 감지
- 세션 만료 패턴 분석

### 백업
- active_users 정기 백업
- 역할/권한 변경 이력 보관

### 성능 최적화
- active_users 인덱스 관리
- 세션 캐싱 활용
- 불필요한 DB 조회 최소화

## 향후 개선사항
1. 2단계 인증 (2FA)
2. SSO 통합
3. 비밀번호 정책 강화
4. 접속 로그 상세 기록
5. IP 기반 접근 제어
