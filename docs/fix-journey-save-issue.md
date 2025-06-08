# 여정 관리 저장 문제 해결 가이드

## 문제
- 일정관리 > 여정 관리에서 새 장소 추가 시 저장이 안 되는 문제
- 원인: `tour_journey_items` 테이블이 실제로 생성되지 않음

## 해결 방법

### 1. Supabase Dashboard에서 SQL 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. SQL Editor 탭 이동
4. 다음 파일의 내용을 복사하여 실행:
   ```
   /supabase/migrations/20250609_create_tour_journey_items.sql
   ```

### 2. 실행 확인
SQL 실행 후 다음 쿼리로 테이블 생성 확인:
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'tour_journey_items'
) as table_exists;
```

### 3. TypeScript 타입 생성 (선택사항)
```bash
# Supabase CLI를 사용하여 타입 자동 생성
npx supabase gen types typescript --project-id [your-project-id] > supabase/types.ts
```

## 완료 후 테스트

1. 브라우저 새로고침 (Ctrl+F5)
2. 일정관리 > 여정 관리로 이동
3. 새 장소 추가 테스트

## 주의사항
- 이미 tour_journey_items 테이블이 있다면 에러가 발생할 수 있음
- 이 경우 `DROP TABLE IF EXISTS tour_journey_items CASCADE;`를 먼저 실행

---
작성일: 2025-06-09
