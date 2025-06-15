# 로그인 문제 빠른 해결 가이드

## 즉시 해결 명령어

Supabase SQL Editor에서 다음 명령어를 실행하세요:

```sql
-- 특정 사용자만 빠르게 수정
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, 
    raw_user_meta_data, aud, role, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    email,
    crypt('90001004', gen_salt('bf')),
    NOW(),
    jsonb_build_object('name', name, 'role', role),
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
FROM public.users
WHERE email IN ('mas9golf3@gmail.com', 'singsingstour@naver.com')
AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE auth.users.email = public.users.email
);
```

## 로그인 정보
- **이메일**: mas9golf3@gmail.com, singsingstour@naver.com
- **비밀번호**: 90001004

## 문제가 지속되면
1. 브라우저 캐시 삭제
2. 시크릿/프라이빗 모드에서 시도
3. Supabase 대시보드에서 auth.users 테이블 직접 확인
