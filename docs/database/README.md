# 데이터베이스 스키마 문서

## 📋 개요
싱싱골프투어 관리 시스템의 데이터베이스 구조 문서입니다.

- **데이터베이스**: PostgreSQL (Supabase)
- **최종 업데이트**: 2025-06-04

## 🗄️ 파일 구조
```
database/
├── README.md              # 이 파일
├── schema-latest.sql      # 최신 전체 스키마
├── check-schema.sql       # 스키마 확인 쿼리
└── tables/               # 테이블별 상세 문서
    ├── tour_products.md
    ├── singsing_tours.md
    └── ...
```

## 📊 현재 테이블 구조

### 권한/유저 관리 테이블 (3개) - 🆕 2025-06-04 추가
1. **roles** - 권한 역할 (admin, manager, staff, driver)
2. **users** - 시스템 사용자 (확장됨)
3. **customers** - 고객 마스터 데이터베이스

### 핵심 테이블 (15개)
1. **tour_products** - 여행상품 템플릿 (3 rows)
2. **singsing_tours** - 실제 투어 일정 (6 rows)
3. **singsing_participants** - 참가자 정보 (50 rows)
4. **singsing_payments** - 결제 정보 (100 rows)
5. **singsing_schedules** - 투어별 일정 (5 rows)
6. **singsing_rooms** - 객실 정보 (20 rows)
7. **singsing_tee_times** - 티오프 시간 (19 rows)
8. **singsing_participant_tee_times** - 참가자-티타임 연결 (22 rows)

### 운영 테이블
9. **singsing_boarding_places** - 탑승지 마스터 (7 rows)
10. **singsing_tour_boarding_times** - 투어별 탑승 시간 (2 rows)
11. **singsing_tour_staff** - 투어별 스탭 정보 (2 rows)

### 기타 테이블
12. **singsing_memo_templates** - 메모 템플릿 (13 rows)
13. **singsing_memos** - 메모 (9 rows)
14. **singsing_work_memos** - 업무 메모 (2 rows)
15. **documents** - 문서 (4 rows)

### 뷰 (View)
- **active_users** - 활성 사용자 뷰 🆕
- **tour_staff_details** - 투어 스탭 상세 뷰 🆕
- **tour_schedule_preview** - 투어 일정 미리보기

## 🔧 최근 변경사항 (2025-06-04)

### 추가된 테이블 🆕
- ✅ **roles** - 권한 역할 관리
  - id, name, description, permissions (JSONB)
  - 기본 역할: admin, manager, staff, driver

- ✅ **customers** - 고객 마스터 DB
  - id, name, phone, email, birth_date, gender
  - 마케팅 동의: marketing_agreed, kakao_friend
  - 통계: total_tour_count, last_tour_date, total_payment_amount
  - 상태: status (active/inactive/blocked), customer_type (vip/regular/new)

### 수정된 테이블
- ✅ **users** 테이블 확장
  - 추가 컬럼: password_hash, is_active, role_id (FK to roles)
  - 추가 정보: department, hire_date, profile_image_url
  - 로그인 정보: last_login, login_count

- ✅ **singsing_tours**
  - 추가 컬럼: driver_phone

- ✅ **singsing_tour_staff**
  - 추가 컬럼: user_id (FK to users), display_order

### 추가된 함수
- ✅ check_user_permission() - 권한 확인
- ✅ update_updated_at_column() - updated_at 자동 업데이트
- ✅ update_customer_stats() - 고객 통계 자동 업데이트

### RLS (Row Level Security) 설정
- 개발 중이므로 모든 테이블의 RLS 비활성화됨
- 프로덕션 배포 전 활성화 필요

## 📑 주요 테이블 관계

### 권한 시스템 관계도 🆕
```
roles (권한 역할)
    ↓ role_id
users (시스템 사용자)
    ↓ user_id
singsing_tour_staff (투어별 스탭)
```

### 고객 관리 관계도 🆕
```
customers (고객 마스터)
    ← phone으로 연결
singsing_participants (투어 참가자)
```

### 핵심 관계도
```
tour_products (여행상품 템플릿)
    ↓ tour_product_id
singsing_tours (실제 투어)
    ↓ tour_id
    ├── singsing_participants (참가자)
    │   ├── singsing_payments (결제)
    │   └── singsing_participant_tee_times (티타임 배정)
    ├── singsing_schedules (일정)
    ├── singsing_rooms (객실)
    ├── singsing_tee_times (티타임)
    └── singsing_tour_staff (스탭)
```

## 📊 새로 추가된 테이블 상세

### roles 테이블
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 기본 역할
- admin: {"all": true}
- manager: {"tours": true, "participants": true, "documents": true}
- staff: {"tours": ["read"], "participants": ["read"]}
- driver: {"tours": ["read"], "participants": ["read"]}
```

### customers 테이블
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  -- 고객 정보
  birth_date DATE,
  gender VARCHAR(10),
  -- 마케팅 동의
  marketing_agreed BOOLEAN DEFAULT false,
  marketing_agreed_at TIMESTAMP,
  kakao_friend BOOLEAN DEFAULT false,
  -- 통계
  total_tour_count INT DEFAULT 0,
  total_payment_amount DECIMAL(12,2) DEFAULT 0,
  -- 상태
  status VARCHAR(20) DEFAULT 'active',
  customer_type VARCHAR(20), -- vip, regular, new
  -- 메타
  source VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔍 유용한 쿼리

### 권한 확인
```sql
-- 사용자 권한 확인
SELECT check_user_permission(user_id, 'tours', 'write');

-- 활성 사용자 목록
SELECT * FROM active_users;

-- VIP 고객 목록
SELECT * FROM customers WHERE customer_type = 'vip';
```

### 통계 쿼리
```sql
-- 고객별 투어 참여 통계
SELECT 
  c.name,
  c.phone,
  c.total_tour_count,
  c.last_tour_date,
  c.customer_type
FROM customers c
WHERE c.total_tour_count > 0
ORDER BY c.total_tour_count DESC;

-- 직원별 담당 투어
SELECT 
  u.name as staff_name,
  r.name as role,
  COUNT(DISTINCT ts.tour_id) as tour_count
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN singsing_tour_staff ts ON ts.user_id = u.id
GROUP BY u.id, u.name, r.name;
```

## ⚠️ 주의사항

1. **RLS 설정**: 현재 개발 중이므로 비활성화 상태. 프로덕션 배포 전 반드시 활성화
2. **비밀번호**: users 테이블의 password_hash는 bcrypt 해시 사용 필수
3. **권한 관리**: roles 테이블의 permissions JSONB 구조 준수
4. **고객 통계**: 트리거를 통해 자동 업데이트되므로 수동 수정 금지

## 🔐 보안 고려사항

1. **개발 환경**
   - 모든 테이블 RLS 비활성화
   - 테스트 데이터 사용

2. **프로덕션 환경**
   - 모든 테이블 RLS 활성화
   - 적절한 정책(Policy) 설정
   - 민감 정보 암호화

---
*이 문서는 데이터베이스 스키마가 변경될 때마다 업데이트되어야 합니다.*
*최종 업데이트: 2025-06-04*