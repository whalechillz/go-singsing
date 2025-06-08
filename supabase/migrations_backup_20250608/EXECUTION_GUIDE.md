# 투어 관리 시스템 마이그레이션 실행 가이드

## Supabase 대시보드에서 실행하는 방법

1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭
4. 아래 순서대로 실행 및 확인

## 실행 순서 (반드시 순서대로!)

### 🔹 Part 1: tourist_attractions 테이블 확장
1. `part1_tourist_attractions_extension.sql` 파일 내용 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭
4. 하단 확인 쿼리 결과 확인 (6개 컬럼이 추가되었는지)

### 🔹 Part 2: tour_journey_items 테이블 생성
1. `part2_tour_journey_items_creation.sql` 파일 내용 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭
4. 하단 확인 쿼리에서 `table_exists = true` 확인

### 🔹 Part 3: 트리거 및 RLS 정책
1. `part3_triggers_and_rls.sql` 파일 내용 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭
4. 하단 확인 쿼리에서 4개의 정책이 생성되었는지 확인

### 🔹 Part 4: boarding_places 테이블 데이터 정리
⚠️ 주의: 주석 처리된 DELETE 문은 확인 후 실행!

1. `part4_boarding_places_cleanup.sql` 파일 내용 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭
4. 이관될 데이터 확인 (TO BE MOVED)
5. 확인 후 주석 해제하고 다시 실행:
   - DELETE 문 주석 해제
   - UPDATE 문 주석 해제 
   - ALTER TABLE 제약조건 주석 해제

### 🔹 Part 5: 샘플 데이터 및 최종 확인
1. `part5_sample_data_and_verification.sql` 파일 내용 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭
4. 최종 상태 확인

## 확인 사항

### ✅ Part 1 실행 후
```sql
-- 새 컬럼이 추가되었는지 확인
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tourist_attractions'
  AND column_name IN ('sub_category', 'parking_info');
```

### ✅ Part 2 실행 후
```sql
-- tour_journey_items 테이블이 생성되었는지 확인
SELECT * FROM tour_journey_items LIMIT 1;
```

### ✅ Part 4 실행 후
```sql
-- 탑승지만 남아있는지 확인
SELECT DISTINCT place_type FROM singsing_boarding_places;
```

### ✅ 전체 완료 후
```sql
-- 새 카테고리 데이터 확인
SELECT category, COUNT(*) 
FROM tourist_attractions 
WHERE category IN ('mart', 'golf_round', 'club_meal', 'others')
GROUP BY category;
```

## 문제 발생시

1. **테이블이 이미 존재한다는 오류**
   - `IF NOT EXISTS` 구문이 있으므로 무시하고 진행

2. **권한 오류**
   - Database 권한 확인
   - Settings > Database > Connection string 확인

3. **외래키 제약조건 오류**
   - Part 1, 2를 먼저 실행했는지 확인
   - 참조하는 테이블이 존재하는지 확인

## 롤백이 필요한 경우

```sql
-- tour_journey_items 테이블 삭제
DROP TABLE IF EXISTS tour_journey_items CASCADE;

-- tourist_attractions 새 컬럼 삭제
ALTER TABLE tourist_attractions 
DROP COLUMN IF EXISTS sub_category,
DROP COLUMN IF EXISTS golf_course_info,
DROP COLUMN IF EXISTS meal_info,
DROP COLUMN IF EXISTS parking_info,
DROP COLUMN IF EXISTS entrance_fee,
DROP COLUMN IF EXISTS booking_required;

-- 카테고리 제약조건 원복
ALTER TABLE tourist_attractions DROP CONSTRAINT IF EXISTS tourist_attractions_category_check;
ALTER TABLE tourist_attractions 
ADD CONSTRAINT tourist_attractions_category_check 
CHECK (category IN ('tourist_spot', 'rest_area', 'restaurant', 'shopping', 'activity'));
```
