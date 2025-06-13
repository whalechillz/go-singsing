# 싱싱골프투어 로그인 시스템 - 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1. Supabase SQL Editor에서 실행 (순서대로)

```sql
-- 1) RLS 정책 설정 (001_auth_setup.sql 실행)
-- 2) 테스트 사용자 생성 (quick_setup.sql 실행)
```

### 2. 테스트 계정으로 로그인

| 역할 | 이메일 | 비밀번호 | 접근 가능 페이지 |
|------|--------|----------|------------------|
| 관리자 | admin@singsinggolf.kr | admin123! | 모든 페이지 |
| 매니저 | manager@singsinggolf.kr | manager123! | 홈, 관리자 페이지 |
| 스탭 | staff@singsinggolf.kr | staff123! | 홈 페이지만 |

### 3. 주요 페이지

- `/` - 홈 (투어 목록)
- `/login` - 로그인
- `/admin` - 관리자 대시보드

## 📁 파일 구조

```
/app
  /login/page.tsx        # 로그인 페이지
  page.tsx              # 홈 페이지 (로그인 통합)
  
/lib
  auth.ts               # 인증 관련 함수
  supabaseClient.js     # Supabase 클라이언트
  
/components
  AdminNavbar.tsx       # 관리자 네비게이션 (로그아웃 포함)
  
/supabase/migrations
  001_auth_setup.sql    # RLS 정책 설정
  002_migrate_existing_users.sql  # 기존 사용자 마이그레이션
  
/supabase
  quick_setup.sql       # 테스트 사용자 빠른 생성

middleware.ts           # 라우트 보호
```

## 🔐 보안 체크리스트

- [x] Supabase Auth 사용
- [x] RLS 정책 적용
- [x] 미들웨어 라우트 보호
- [x] 역할 기반 접근 제어
- [x] 비활성 사용자 차단
- [x] 세션 관리

## 🛠 문제 해결

### "로그인이 안 돼요"
1. active_users 테이블에 사용자가 있는지 확인
2. is_active가 true인지 확인
3. auth.users에도 동일한 이메일이 있는지 확인

### "관리자 페이지 접근이 안 돼요"
1. role이 'admin' 또는 'manager'인지 확인
2. 로그아웃 후 다시 로그인

### "새 사용자를 추가하고 싶어요"
1. Supabase Dashboard > Authentication > Users
2. "Invite user" 클릭
3. USER_MANAGEMENT_GUIDE.md 참고

## 📞 지원

- 문서: LOGIN_SYSTEM_UPDATED.md
- 아키텍처: AUTH_ARCHITECTURE.md
- 사용자 관리: USER_MANAGEMENT_GUIDE.md
