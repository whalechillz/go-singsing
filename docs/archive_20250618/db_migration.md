# DB 마이그레이션 가이드

## 1. 마이그레이션 파일 생성
```bash
supabase migration new <설명>
```

## 2. 마이그레이션 파일 작성 예시
```sql
-- 예: 참가자 테이블에 gender 컬럼 추가
ALTER TABLE singsing_participants ADD COLUMN gender VARCHAR(10);

-- 예: 투어 상품에 courses 배열 컬럼 추가
ALTER TABLE tour_products ADD COLUMN courses TEXT[];
```

## 3. 마이그레이션 적용(로컬/원격)
```bash
supabase db push
# 또는
supabase db push --include-all
```

## 4. 마이그레이션 내역 확인
- `supabase/migrations/` 폴더에서 모든 내역 관리
- 파일명: `YYYYMMDDHHMMSS_설명.sql`

## 5. 실무 팁
- 마이그레이션은 항상 git commit 후 적용 권장
- 실서비스 DB에는 신중하게 적용(스테이징에서 충분히 테스트)
- 컬럼 삭제/변경 시 데이터 백업 필수 