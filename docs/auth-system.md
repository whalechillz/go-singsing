# 권한 및 사용자 관리 시스템

## 📋 개요
싱싱골프투어 관리 시스템의 권한 및 사용자 관리 구조입니다.

- **생성일**: 2025-06-04
- **작성자**: System Administrator

## 🔐 권한 시스템 구조

### 1. 시스템 사용자 (users 테이블)
관리 시스템에 로그인하는 직원들의 계정입니다.

```
시스템 사용자 (users 테이블):
├── admin (관리자) - 대표님
├── manager (매니저) - 전 직원 기본
└── staff (직원) - 파트타임, 인턴
```

### 2. 투어 운영진 (singsing_tour_staff 테이블)
각 투어별로 배정되는 운영 스태프입니다.

```
투어 운영진 (singsing_tour_staff 테이블):
├── 기사
├── 가이드  
├── 인솔자
└── 기타
```

## 📊 역할별 권한 설정

### admin (관리자)
```json
{
  "all": true
}
```
- 모든 기능에 대한 전체 권한
- 시스템 설정 변경 가능
- 사용자 관리 가능

### manager (매니저)
```json
{
  "tours": true,
  "participants": true,
  "documents": true,
  "memos": true
}
```
- 투어 관리 (생성/수정/삭제)
- 참가자 관리
- 문서 관리
- 메모 관리

### staff (스태프)
```json
{
  "tours": ["read"],
  "participants": ["read"],
  "documents": ["read"]
}
```
- 투어 정보 조회만 가능
- 참가자 정보 조회만 가능
- 문서 조회만 가능

### driver (기사)
```json
{
  "tours": ["read"],
  "participants": ["read"]
}
```
- 투어 정보 조회
- 참가자 정보 조회
- 탑승지 정보 확인

## 🔧 권한 확인 방법

### SQL 함수 사용
```sql
-- 특정 사용자의 권한 확인
SELECT check_user_permission(
  'user-id-here',  -- 사용자 ID
  'tours',         -- 리소스
  'write'          -- 액션
);
```

### 프로그램 코드에서
```typescript
// TypeScript 예시
const hasPermission = await supabase
  .rpc('check_user_permission', {
    p_user_id: userId,
    p_resource: 'tours',
    p_action: 'write'
  });

if (hasPermission) {
  // 권한이 있는 경우 처리
}
```

## 🔗 테이블 연결 구조

### users ↔ singsing_tour_staff 연결
```
users (시스템 사용자)
  ↓ user_id
singsing_tour_staff (투어별 스태프)
  ↓ tour_id
singsing_tours (투어)
```

- 한 직원(user)이 여러 투어의 스태프가 될 수 있음
- 투어별로 다른 역할 수행 가능 (A투어에서는 기사, B투어에서는 가이드)

## 🛡️ 보안 고려사항

### 1. 비밀번호 관리
- bcrypt 해시 사용 (salt rounds: 10)
- 평문 비밀번호는 절대 저장하지 않음
- 비밀번호 정책: 최소 8자, 영문+숫자 조합

### 2. 세션 관리
- JWT 토큰 사용
- 토큰 만료 시간: 24시간
- Refresh 토큰: 7일

### 3. API 접근 제어
- 모든 API 엔드포인트에 권한 체크
- 민감한 정보는 role 확인 후 반환

## 📝 사용 예시

### 1. 새 직원 추가
```sql
-- 1. 역할 확인
SELECT * FROM roles;

-- 2. 직원 추가
INSERT INTO users (
  name, phone, email, role_id, department, is_active
) VALUES (
  '홍길동',
  '010-1234-5678',
  'hong@singsinggolf.kr',
  (SELECT id FROM roles WHERE name = 'manager'),
  '운영팀',
  true
);
```

### 2. 투어 스태프 배정
```sql
-- 투어에 스태프 배정
INSERT INTO singsing_tour_staff (
  tour_id, name, phone, role, user_id, display_order
) VALUES (
  'tour-id-here',
  '홍길동',
  '010-1234-5678',
  '가이드',
  (SELECT id FROM users WHERE phone = '010-1234-5678'),
  1
);
```

### 3. 권한 변경
```sql
-- 직원의 권한을 staff에서 manager로 변경
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'manager')
WHERE phone = '010-1234-5678';
```

## 🚨 주의사항

1. **권한 변경**: admin 권한을 가진 사용자만 다른 사용자의 권한 변경 가능
2. **계정 비활성화**: 퇴사자는 삭제하지 말고 `is_active = false`로 설정
3. **감사 기록**: 중요 작업은 로그 테이블에 기록 (추후 구현 예정)

## 🔄 마이그레이션 가이드

### 기존 시스템에서 전환
1. 기존 직원 정보를 users 테이블로 마이그레이션
2. 역할에 따라 적절한 role_id 할당
3. 투어별 스태프 정보 연결

### 롤백 계획
1. 기존 데이터 백업 필수
2. 문제 발생 시 이전 버전으로 복구
3. 단계별 전환으로 리스크 최소화

---
*이 문서는 권한 시스템이 변경될 때마다 업데이트되어야 합니다.*