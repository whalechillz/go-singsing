# 이메일 템플릿 가이드

## 📁 디렉토리 구조

```
templates/
└── emails/
    ├── password-reset.html      # 비밀번호 재설정
    ├── welcome.html            # 회원가입 환영
    ├── email-verification.html # 이메일 인증
    └── README.md              # 이 문서
```

## 🎨 템플릿 관리 원칙

### 1. 파일 명명 규칙
- 소문자와 하이픈(-) 사용: `password-reset.html`
- 목적을 명확히 표현하는 이름 사용

### 2. 변수 규칙
- Mustache 스타일 사용: `{{VARIABLE_NAME}}`
- 대문자와 언더스코어 사용: `{{USER_NAME}}`
- 공통 변수:
  - `{{USER_NAME}}`: 사용자 이름
  - `{{USER_EMAIL}}`: 사용자 이메일
  - `{{CURRENT_YEAR}}`: 현재 연도

### 3. 디자인 가이드라인
- 싱싱골프 브랜드 컬러: `#2563eb` (파란색)
- 최대 너비: 600px
- 모바일 반응형 필수
- 다크모드 지원 권장

## 🚀 사용 방법

### TypeScript에서 사용
```typescript
import { emailTemplateManager } from '@/lib/email-template-manager';

const emailHtml = emailTemplateManager.renderPasswordResetEmail({
  userName: '홍길동',
  userEmail: 'user@singsinggolf.kr',
  resetLink: 'https://singsinggolf.kr/auth/reset-password?token=abc123'
});
```

### Supabase Edge Function에서 사용
```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'

serve(async (req) => {
  const { userName, userEmail, resetLink } = await req.json();
  
  // 템플릿 렌더링
  const emailHtml = await renderTemplate('password-reset', {
    USER_NAME: userName,
    USER_EMAIL: userEmail,
    RESET_LINK: resetLink
  });
  
  // 이메일 발송 (예: SendGrid)
  await sendEmail({
    to: userEmail,
    subject: '싱싱골프 - 비밀번호 재설정',
    html: emailHtml
  });
});
```

## 📋 템플릿 목록

### 1. password-reset.html
**용도**: 비밀번호 재설정 요청 시 발송
**변수**:
- `{{USER_NAME}}`: 사용자 이름
- `{{USER_EMAIL}}`: 사용자 이메일
- `{{RESET_LINK}}`: 비밀번호 재설정 링크

### 2. welcome.html (추가 예정)
**용도**: 회원가입 완료 시 환영 메일
**변수**:
- `{{USER_NAME}}`: 사용자 이름
- `{{USER_EMAIL}}`: 사용자 이메일
- `{{LOGIN_LINK}}`: 로그인 페이지 링크

### 3. email-verification.html (추가 예정)
**용도**: 이메일 주소 인증
**변수**:
- `{{USER_NAME}}`: 사용자 이름
- `{{USER_EMAIL}}`: 사용자 이메일
- `{{VERIFICATION_LINK}}`: 인증 링크

## 🛠️ 새 템플릿 추가하기

1. `templates/emails/` 디렉토리에 새 HTML 파일 생성
2. 기존 템플릿을 참고하여 디자인
3. `lib/email-template-manager.ts`에 새 메서드 추가
4. 이 문서에 템플릿 정보 추가

## 🧪 테스트 방법

### 로컬 테스트
```bash
# 개발 서버에서 미리보기 페이지 생성
npm run dev
# http://localhost:3000/admin/email-preview 접속
```

### 이메일 클라이언트 테스트
1. [Litmus](https://litmus.com/) 또는 [Email on Acid](https://www.emailonacid.com/) 사용
2. 주요 클라이언트 테스트:
   - Gmail (Web/Mobile)
   - Outlook (2019/365)
   - Apple Mail
   - Samsung Mail

## 🔧 문제 해결

### 이미지가 표시되지 않음
- 절대 URL 사용 확인
- 이미지 호스팅 서버 CORS 설정 확인

### 스타일이 적용되지 않음
- 인라인 스타일 사용
- `!important` 플래그 추가
- MSO 조건부 주석 확인

### 한글 깨짐
- UTF-8 인코딩 확인
- `<meta charset="UTF-8">` 태그 포함 여부 확인
