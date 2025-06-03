# 포함/불포함 데이터 구조 마이그레이션 가이드

## 🎯 목표
기존 시스템의 작동을 보장하면서 점진적으로 데이터 구조를 개선

## 📋 현재 상황
- **문제점**: 필드명 불일치 (`included_items` vs `includes`)
- **영향 범위**: 투어 수정, 문서 생성
- **우려사항**: 기존 시스템이 중단될 수 있음

## 🛡️ 안전한 마이그레이션 전략

### Phase 1: 호환성 레이어 추가 (즉시 적용 가능)

#### 1. 데이터베이스 수정
```bash
# 호환성 마이그레이션 실행
psql -U postgres -d your_database < 20250603_compatible_migration.sql
```

이 마이그레이션은:
- 기존 필드를 유지하면서 새 필드 추가
- 자동 동기화 트리거 생성
- 기존 코드가 계속 작동

#### 2. 헬퍼 함수 추가
```bash
# utils 폴더에 헬퍼 함수 생성
mkdir -p utils
touch utils/includesExcludesHelper.ts
# 위의 헬퍼 함수 코드 복사
```

#### 3. 최소한의 UI 수정
투어 수정 페이지만 약간 수정:
- `handleProductChange` 함수 수정
- 헬퍼 함수 사용

### Phase 2: 점진적 전환 (1-2주)

#### 1. 새로운 UI 컴포넌트 적용
- 포함/불포함 편집기를 카테고리별로 개선
- 기존 텍스트 편집기와 공존

#### 2. 문서 생성 개선
- 카테고리별 표시 옵션 추가
- 기존 표시 방식 유지

### Phase 3: 완전 전환 (1개월 후)

#### 1. 기존 필드 제거
```sql
-- 모든 데이터가 새 구조로 전환된 후
ALTER TABLE tour_products 
DROP COLUMN IF EXISTS usage_round,
DROP COLUMN IF EXISTS usage_hotel,
DROP COLUMN IF EXISTS usage_meal,
DROP COLUMN IF EXISTS usage_locker,
DROP COLUMN IF EXISTS usage_bus,
DROP COLUMN IF EXISTS usage_tour;
```

#### 2. UI 완전 교체
- 새로운 카테고리별 편집기만 사용
- 기존 textarea 제거

## ✅ 체크리스트

### 즉시 실행
- [ ] 백업 생성: `pg_dump -U postgres -d dbname > backup_20250603.sql`
- [ ] 호환성 마이그레이션 실행
- [ ] 헬퍼 함수 파일 생성
- [ ] 투어 수정 페이지 최소 수정
- [ ] 테스트: 투어 생성/수정/문서 생성

### 1주차
- [ ] 새 UI 컴포넌트 개발
- [ ] 일부 사용자 대상 베타 테스트
- [ ] 피드백 수집

### 2-4주차
- [ ] 전체 적용
- [ ] 모니터링
- [ ] 최종 마이그레이션 준비

## 🚨 롤백 계획

문제 발생시:
```sql
-- 트리거 제거
DROP TRIGGER IF EXISTS sync_tour_products_fields_trigger ON tour_products;
DROP FUNCTION IF EXISTS sync_tour_products_fields();

-- 추가된 컬럼 제거
ALTER TABLE tour_products 
DROP COLUMN IF EXISTS includes,
DROP COLUMN IF EXISTS excludes;
```

## 📊 모니터링

```sql
-- 데이터 일관성 확인
SELECT 
  name,
  includes IS NOT NULL as has_includes,
  included_items IS NOT NULL as has_included_items,
  includes = included_items::text as is_synced
FROM tour_products;
```

## 💡 팁
1. **점진적 적용**: 한 번에 모든 것을 바꾸지 마세요
2. **백업 필수**: 각 단계마다 백업
3. **테스트 우선**: 개발 환경에서 충분히 테스트
4. **사용자 교육**: 변경사항 미리 공지