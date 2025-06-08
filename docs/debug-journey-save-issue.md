# 여정 관리 저장 문제 디버깅 가이드

## 1. RLS 정책 확인 및 추가
Supabase SQL Editor에서 실행:

```sql
-- RLS 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'tour_journey_items';

-- RLS 정책이 없다면 다음 파일 실행:
-- /supabase/migrations/20250609_add_rls_tour_journey_items.sql
```

## 2. 브라우저 콘솔 확인
1. F12로 개발자 도구 열기
2. Console 탭 확인
3. 저장 시도 시 나오는 에러 메시지 확인

## 3. 데이터 확인
```sql
-- tourist_attractions 테이블에 데이터가 있는지 확인
SELECT COUNT(*) FROM tourist_attractions;

-- 테스트 데이터 추가 (필요시)
INSERT INTO tourist_attractions (name, category, address, is_active)
VALUES 
  ('테스트 휴게소', 'rest_area', '서울시 강남구', true),
  ('테스트 식당', 'restaurant', '서울시 강남구', true);
```

## 4. 네트워크 탭 확인
1. F12 > Network 탭
2. 저장 버튼 클릭
3. 실패한 요청의 Response 확인

## 5. 권한 문제 해결 (임시)
```sql
-- 임시로 모든 권한 허용 (개발 중에만!)
ALTER TABLE tour_journey_items DISABLE ROW LEVEL SECURITY;
```

## 6. 확인 사항
- [ ] tour_journey_items 테이블 존재 ✅
- [ ] RLS 정책 설정 여부
- [ ] tourist_attractions 테이블에 데이터 존재
- [ ] boarding_places 테이블에 데이터 존재
- [ ] 브라우저 콘솔 에러 메시지
- [ ] 네트워크 응답 메시지

## 7. 문제 해결 후
```bash
git add .
git commit -m "fix: 여정 관리 저장 문제 해결 - RLS 정책 추가 및 에러 처리 개선"
git push
```
