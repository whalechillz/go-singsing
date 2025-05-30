# 싱싱골프투어 관리 시스템 개선사항 정리
## 2025년 5월 30일

### 🔍 현재 상황 분석

1. **데이터베이스 구조 혼란**
   - `singsing_tours`: 여행상품/골프장 정보 (NOT 실제 투어)
   - `singsing_schedules`: 실제 투어 스케줄
   - 코드에서 tour_id가 실제로는 schedule_id를 참조하는 혼란 발생

2. **Phase 2 마이그레이션 미실행**
   - 권한 시스템, 객실 배정, 탑승 스케줄 등 핵심 기능 미구현
   - 마이그레이션 파일은 준비되어 있으나 실행 대기 중

3. **핵심 페이지 구현 현황**
   - ✅ 투어 목록 페이지
   - ✅ 티오프 시간 관리 (기존)
   - ✅ 투어별 참가자 관리 (신규 구현)
   - ✅ 투어별 객실 배정 (신규 구현)
   - ✅ 투어별 일정 관리 (신규 구현)
   - ✅ 탑승 스케줄 관리 (신규 구현)

### 📋 완료된 작업

1. **누락된 핵심 페이지 4개 구현**
   - `/admin/tours/[tourId]/participants` - 참가자 관리
   - `/admin/tours/[tourId]/room-assignment` - 객실 배정
   - `/admin/tours/[tourId]/schedule` - 일정 관리
   - `/admin/tours/[tourId]/boarding` - 탑승 스케줄

2. **마이그레이션 준비 스크립트 생성**
   - `scripts/migration/backup_and_migrate.sql` - 백업 스크립트
   - `scripts/migration/check_tour_schedule_mapping.sql` - 데이터 검증

### 🚀 즉시 실행 필요 사항

#### 1. **데이터베이스 마이그레이션 실행**

```bash
# Supabase SQL Editor에서 순서대로 실행

# 1. 백업
/scripts/migration/backup_and_migrate.sql

# 2. 데이터 검증
/scripts/migration/check_tour_schedule_mapping.sql

# 3. Phase 2 마이그레이션 (순서대로)
/supabase/migrations/phase2/001_update_schedules_table_revised.sql
/supabase/migrations/phase2/002_update_room_system.sql
/supabase/migrations/phase2/003_update_tee_time_system.sql
/supabase/migrations/phase2/004_create_boarding_system.sql
/supabase/migrations/phase2/005_create_user_roles.sql
/supabase/migrations/phase2/006_update_product_system.sql
```

#### 2. **투어 상세 페이지 네비게이션 개선**

투어 상세 페이지에 탭 네비게이션 추가 필요:
- 참가자 관리
- 객실 배정
- 일정 관리
- 티오프 시간
- 탑승 스케줄

#### 3. **데이터 정합성 수정**

현재 코드에서 `tour_id`가 실제로는 `schedule_id`를 참조하는 문제:
- 변수명 통일 필요
- 또는 관계 재정립

### 📊 다음 단계 권장사항

1. **Phase 3: 문서 생성 시스템**
   - PDF 생성 라이브러리 설치
   - 6종 문서 템플릿 개발
   - QR코드 기반 문서 접근

2. **Phase 4: 권한 시스템 구현**
   - Supabase Auth 설정
   - RLS 정책 적용
   - 사용자 역할별 접근 제어

3. **Phase 5: 실시간 기능**
   - 참가자 실시간 업데이트
   - 객실/버스 배정 드래그앤드롭
   - 협업 편집 기능

### 🐛 알려진 이슈

1. **singsing_rooms 테이블 구조**
   - 현재 구조가 Phase 2 설계와 다름
   - room_participant_assignments로 마이그레이션 필요

2. **탑승 관련 테이블**
   - boarding_guide_* 테이블들의 용도 확인 필요
   - boarding_buses, boarding_assignments로 통합 고려

3. **성능 최적화 필요**
   - 참가자 수 계산 쿼리 최적화
   - 대량 데이터 처리 시 페이지네이션

### 💡 추가 개선 아이디어

1. **대시보드 강화**
   - 투어별 수익 현황
   - 참가자 통계 (연령, 성별, 지역)
   - 인기 골프장/호텔 분석

2. **자동화 기능**
   - 객실 자동 배정 (성별, 그룹 고려)
   - 버스 좌석 최적화
   - 티오프 시간 자동 배정

3. **고객 경험 개선**
   - 모바일 최적화
   - 카카오톡 알림
   - 투어 사진 갤러리

---
*작성일: 2025-05-30*
*작성자: Claude*