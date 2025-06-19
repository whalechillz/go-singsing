# 투어 홍보 페이지 404 에러 해결 가이드

## 문제 상황
- 투어 미리보기 링크 클릭 시 404 페이지가 표시됨
- URL 형식: `/promo/a0560b90-67a6-4d84-a29a-2b7548266c2b`

## 문제 원인
1. `tour_promotion_pages` 테이블이 데이터베이스에 생성되지 않았거나
2. 해당 투어에 대한 홍보 페이지 레코드가 없음

## 해결 방법

### 1단계: 마이그레이션 실행
```bash
# Supabase 대시보드에서 SQL Editor 실행
```

아래 SQL을 복사하여 실행:

```sql
-- 1. 테이블 존재 여부 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'tour_promotion_pages'
);

-- 2. 테이블이 없다면 아래 마이그레이션 실행
-- (supabase/migrations/20250619_create_tour_promotion_tables.sql 내용)
```

### 2단계: 데이터 확인 및 생성

```sql
-- 1. 특정 투어의 홍보 페이지 확인
SELECT * FROM tour_promotion_pages 
WHERE tour_id = 'a0560b90-67a6-4d84-a29a-2b7548266c2b';

-- 2. 없다면 생성
INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
VALUES (
  'a0560b90-67a6-4d84-a29a-2b7548266c2b',
  'a0560b90-67a6-4d84-a29a-2b7548266c2b', -- tour_id를 slug로 사용
  true
);

-- 3. 또는 모든 투어에 대해 자동 생성
INSERT INTO tour_promotion_pages (tour_id, slug, is_public)
SELECT 
  id,
  id, -- 간단하게 tour_id를 slug로 사용
  true
FROM singsing_tours
WHERE NOT EXISTS (
  SELECT 1 FROM tour_promotion_pages WHERE tour_id = singsing_tours.id
);
```

### 3단계: 코드 수정 (임시 해결책)

`/app/promo/[slug]/page.tsx` 파일 수정:

```typescript
// 기존 코드
if (isUUID) {
  query = query.eq('tour_id', slug);
} else {
  query = query.eq('slug', slug);
}

// 수정된 코드 (tour_id로만 조회)
query = query.eq('tour_id', slug);
```

### 4단계: 영구적 해결책

1. 관리자 페이지에서 각 투어의 홍보 페이지 설정
   - 투어 관리 > 홍보 페이지 설정
   - URL 슬러그 입력 (예: jeju-spring-2025)
   - 공개 상태 체크
   - 저장

2. 미리보기 링크 형식 변경
   - 현재: `/promo/{tour_id}`
   - 변경: `/promo/{slug}` (사용자 친화적)

## 빠른 확인 방법

```sql
-- Supabase SQL Editor에서 실행
SELECT 
  t.id as tour_id,
  t.title,
  p.slug,
  p.is_public,
  CASE 
    WHEN p.id IS NULL THEN '❌ 홍보 페이지 없음'
    WHEN p.is_public = false THEN '⚠️ 비공개 상태'
    ELSE '✅ 정상'
  END as status
FROM singsing_tours t
LEFT JOIN tour_promotion_pages p ON t.id = p.tour_id
ORDER BY t.created_at DESC;
```

## 긴급 임시 해결책 (코드 수정)

데이터베이스 마이그레이션 없이 바로 해결하려면:

```bash
# 1. 기존 파일 백업
cp app/promo/[slug]/page.tsx app/promo/[slug]/page.tsx.backup

# 2. 임시 해결 파일로 교체
cp app/promo/[slug]/page.tsx.temp app/promo/[slug]/page.tsx

# 3. 개발 서버 재시작
npm run dev
```

이 임시 해결책은 tour_promotion_pages 테이블이 없어도 투어 정보를 직접 조회하여 표시합니다.

## 실행 순서 요약

1. **긴급한 경우**: 위의 임시 해결책 적용
2. **근본적 해결**: 
   - `./apply-promo-migration.sh` 실행하여 마이그레이션 확인
   - `supabase/fix_promo_404_quick.sql` 실행하여 데이터 생성
3. **확인**: 브라우저에서 미리보기 링크 재시도

## 주의사항
- 마이그레이션 실행 전 데이터베이스 백업 권장
- 실제 운영 환경에서는 신중하게 테스트 후 적용
- 문제가 지속되면 브라우저 캐시 삭제 시도

---
작성일: 2025-06-19
