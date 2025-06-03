# 데이터베이스 스키마 문서

## 📋 개요
싱싱골프투어 관리 시스템의 데이터베이스 구조 문서입니다.

- **데이터베이스**: PostgreSQL (Supabase)
- **최종 업데이트**: 2025-06-03

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
- **tour_schedule_preview** - 투어 일정 미리보기

## 🔧 최근 변경사항 (2025-06-03)

### 삭제된 테이블
- ❌ 백업 테이블들 (singsing_tours_backup, singsing_tee_times_backup 등)
- ❌ document_footers, document_notices, document_templates
- ❌ boarding_guide_contacts, boarding_guide_notices, boarding_guide_routes
- ❌ tour_basic_info
- ❌ singsing_pickup_points
- ❌ singsing_work_memo_comments
- ❌ users

### 삭제된 컬럼
- ❌ tour_products.schedule
- ❌ tour_products.reservation_notice
- ❌ tour_products.note
- ❌ tour_products.usage_guide

### 추가된 인덱스
- ✅ idx_singsing_tours_start_date
- ✅ idx_singsing_participants_tour_id
- ✅ idx_singsing_participants_status
- ✅ idx_singsing_schedules_tour_id
- ✅ idx_singsing_schedules_date
- ✅ idx_singsing_payments_tour_id
- ✅ idx_singsing_tee_times_tour_id
- ✅ idx_singsing_tee_times_play_date

## 📑 주요 테이블 관계

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

## 📊 테이블별 주요 필드

### tour_products
- id, name, golf_courses (jsonb), accommodation
- included_items, excluded_items
- general_notices (jsonb), rounding_notices
- usage_round, usage_hotel, usage_meal, usage_bus, usage_tour

### singsing_tours  
- id, title, start_date, end_date
- tour_product_id (FK)
- golf_course, accommodation, price, max_participants

### singsing_schedules
- id, tour_id (FK), date, title, description
- day_number, meal_breakfast, meal_lunch, meal_dinner
- schedule_items (jsonb), boarding_info (jsonb)

### singsing_participants
- id, tour_id (FK), name, phone, email
- status, pickup_location, room_id
- gender, team_name, group_size

## 🔍 유용한 쿼리

### 테이블 크기 확인
```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = tablename) as columns
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 인덱스 목록 확인
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 투어 통계 조회
```sql
SELECT 
    t.id,
    t.title,
    t.start_date,
    (SELECT COUNT(*) FROM singsing_participants p 
     WHERE p.tour_id = t.id AND p.status = '확정') as confirmed_count,
    (SELECT COUNT(*) FROM singsing_schedules s 
     WHERE s.tour_id = t.id) as schedule_count
FROM singsing_tours t
ORDER BY t.start_date DESC;
```

## ⚠️ 주의사항

1. **백업**: 스키마 변경 전 반드시 백업
2. **마이그레이션**: Supabase Migration 사용 권장
3. **문서 업데이트**: 스키마 변경 시 이 문서도 업데이트
4. **인덱스 관리**: 쿼리 성능 모니터링 후 필요시 추가

---
*이 문서는 데이터베이스 스키마가 변경될 때마다 업데이트되어야 합니다.*