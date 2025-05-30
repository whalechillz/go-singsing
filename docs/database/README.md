# 데이터베이스 스키마 문서

## 📋 개요
싱싱골프투어 관리 시스템의 데이터베이스 구조 문서입니다.

- **데이터베이스**: PostgreSQL (Supabase)
- **최종 업데이트**: 2025-05-30

## 🗄️ 파일 구조
```
database/
├── README.md              # 이 파일
├── schema-latest.sql      # 최신 전체 스키마
├── schema-YYYYMMDD.sql    # 날짜별 백업
├── erd.png               # ER 다이어그램
└── tables/               # 테이블별 상세 문서
    ├── tour_products.md
    ├── singsing_tours.md
    └── ...
```

## 📊 스키마 추출 방법

### 1. Supabase CLI 사용 (권장)
```bash
# 전체 스키마 추출
supabase db dump --schema-only -f docs/database/schema-latest.sql

# 날짜별 백업
supabase db dump --schema-only -f docs/database/schema-$(date +%Y%m%d).sql
```

### 2. SQL Editor에서 추출
```sql
-- 테이블 목록과 컬럼 정보 조회
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

## 📑 주요 테이블

### 핵심 테이블
- `tour_products` - 여행상품 템플릿
- `singsing_tours` - 실제 투어 일정  
- `singsing_participants` - 참가자 정보
- `singsing_payments` - 결제 정보

### 운영 테이블
- `singsing_boarding_places` - 탑승지 정보
- `singsing_boarding_schedules` - 탑승 스케줄
- `singsing_rooms` - 객실 정보
- `singsing_tee_times` - 티오프 시간

### 시스템 테이블
- `users` - 사용자 (Supabase Auth)
- `singsing_memo_templates` - 메모 템플릿
- `singsing_work_memos` - 업무 메모

## 🔗 테이블 관계

### 주요 관계도
```
tour_products (상품 템플릿)
    ↓ product_id
singsing_tours (실제 투어)
    ↓ tour_id
singsing_participants (참가자)
    ↓ participant_id
singsing_payments (결제)
```

## 📝 스키마 변경 이력

### 2025-05-30
- 여행상품 타입 확장 계획
- Phase 2 마이그레이션 준비

### 2025-01-27
- 결제 시스템 V3 업데이트
- 참가자 관리 개선

## ⚠️ 주의사항

1. **백업**: 스키마 변경 전 반드시 백업
2. **마이그레이션**: `/supabase/migrations/` 폴더 사용
3. **문서 업데이트**: 스키마 변경 시 이 문서도 업데이트

## 🔧 유용한 쿼리

### 테이블 크기 확인
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 외래키 관계 확인
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';
```

---
*이 문서는 데이터베이스 스키마가 변경될 때마다 업데이트되어야 합니다.*