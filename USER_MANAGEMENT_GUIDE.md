# 사용자 관리 가이드

## 새 사용자 추가 방법

### 방법 1: Supabase 대시보드 사용 (권장)

1. **Supabase 대시보드 접속**
   - [Supabase 대시보드](https://app.supabase.com) 로그인
   - 프로젝트 선택

2. **Authentication > Users 메뉴로 이동**
   - 상단 "Invite user" 버튼 클릭

3. **사용자 정보 입력**
   - Email: 사용자 이메일
   - Password: 초기 비밀번호 설정
   - User metadata에 다음 정보 추가:
   ```json
   {
     "name": "사용자 이름",
     "role": "staff"  // admin, manager, staff 중 선택
   }
   ```

4. **active_users 테이블 동기화**
   - SQL Editor에서 다음 쿼리 실행:
   ```sql
   -- 새로 추가된 사용자를 active_users에 동기화
   INSERT INTO public.active_users (id, email, name, role, is_active, created_at, updated_at)
   SELECT 
       au.id::text,
       au.email,
       COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
       COALESCE(au.raw_user_meta_data->>'role', 'staff'),
       true,
       au.created_at,
       au.updated_at
   FROM auth.users au
   WHERE au.email = '새사용자@singsinggolf.kr'  -- 추가한 이메일로 변경
   AND NOT EXISTS (
       SELECT 1 FROM public.active_users 
       WHERE id = au.id::text OR email = au.email
   );
   ```

### 방법 2: SQL로 직접 추가

```sql
-- 1. auth.users에 사용자 추가
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'newuser@singsinggolf.kr',
    crypt('userpassword123!', gen_salt('bf')),
    NOW(),
    '{"name": "새 사용자", "role": "staff"}'::jsonb,
    'authenticated',
    NOW(),
    NOW()
);

-- 2. 자동으로 active_users에 추가됨 (트리거에 의해)
```

### 방법 3: 관리자 페이지에서 추가 (개발 예정)
- `/admin/users` 페이지에서 GUI로 사용자 추가
- 자동으로 auth.users와 active_users에 동기화

## 기존 사용자 관리

### 사용자 비활성화
```sql
UPDATE public.active_users 
SET is_active = false, updated_at = NOW()
WHERE email = 'user@singsinggolf.kr';
```

### 사용자 역할 변경
```sql
-- active_users 테이블 업데이트
UPDATE public.active_users 
SET role = 'manager', updated_at = NOW()
WHERE email = 'user@singsinggolf.kr';

-- auth.users의 메타데이터도 업데이트
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "manager"}'::jsonb
WHERE email = 'user@singsinggolf.kr';
```

### 비밀번호 재설정
1. **Supabase 대시보드에서**
   - Authentication > Users 메뉴
   - 해당 사용자의 ⋮ 메뉴 클릭
   - "Send password recovery" 선택

2. **프로그래밍 방식으로**
   ```javascript
   // 비밀번호 재설정 이메일 발송
   const { error } = await supabase.auth.resetPasswordForEmail(
     'user@singsinggolf.kr'
   );
   ```

## 사용자 삭제

### 완전 삭제 (주의!)
```sql
-- 1. active_users에서 삭제
DELETE FROM public.active_users WHERE email = 'user@singsinggolf.kr';

-- 2. auth.users에서 삭제
DELETE FROM auth.users WHERE email = 'user@singsinggolf.kr';
```

### 소프트 삭제 (권장)
```sql
-- 비활성화만 시키기
UPDATE public.active_users 
SET is_active = false, updated_at = NOW()
WHERE email = 'user@singsinggolf.kr';
```

## 문제 해결

### auth.users와 active_users 불일치
```sql
-- active_users에 없는 auth.users 찾기
SELECT au.email, au.created_at 
FROM auth.users au
LEFT JOIN public.active_users acu ON au.id::text = acu.id
WHERE acu.id IS NULL;

-- 동기화
INSERT INTO public.active_users (id, email, name, role, is_active, created_at, updated_at)
SELECT 
    au.id::text,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'staff'),
    true,
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.active_users 
    WHERE id = au.id::text
);
```

### 로그인 문제
1. **이메일/비밀번호 확인**
2. **is_active 상태 확인**
   ```sql
   SELECT email, is_active FROM public.active_users 
   WHERE email = 'user@singsinggolf.kr';
   ```
3. **auth.users 존재 확인**
   ```sql
   SELECT email, email_confirmed_at FROM auth.users 
   WHERE email = 'user@singsinggolf.kr';
   ```

## 보안 권장사항
1. 초기 비밀번호는 사용자가 첫 로그인 시 변경하도록 안내
2. 정기적으로 비활성 사용자 검토
3. 역할 변경은 관리자만 수행
4. 모든 사용자 변경사항은 로그 기록
