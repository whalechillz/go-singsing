# 🚨 홍보 페이지 긴급 수정 가이드

## 문제 상황
`https://go.singsinggolf.kr/promo/a0560b90-67a6-4d84-a29a-2b7548266c2b` 링크가 작동하지 않음

## 원인
홍보 페이지 관련 테이블들이 데이터베이스에 생성되지 않았음:
- `tour_promotion_pages` (홍보 페이지)
- `tourist_attractions` (관광지 정보)
- `tour_attraction_options` (투어별 관광지 옵션)

## 해결 방법

### 방법 1: Supabase Dashboard에서 SQL 실행 (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 로그인
   - 해당 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭

3. **SQL 실행**
   - `/temp/FINAL-promotion-fix.sql` 파일의 내용을 전체 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

4. **결과 확인**
   - 실행 후 나타나는 결과 테이블에서 확인:
     - `✅ 공개 중` 상태 확인
     - promotion_url 확인

### 방법 2: 명령줄에서 실행

```bash
cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Supabase CLI가 설치되어 있다면
supabase db reset
supabase migration up
```

## 실행 후 확인사항

1. **테이블 생성 확인**
   - Supabase Dashboard > Table Editor에서 다음 테이블 확인:
     - `tour_promotion_pages`
     - `tourist_attractions`
     - `tour_attraction_options`

2. **홍보 페이지 접속 테스트**
   ```
   https://go.singsinggolf.kr/promo/a0560b90-67a6-4d84-a29a-2b7548266c2b
   ```

3. **관리자 페이지에서 확인**
   - 관리자 페이지 > 홍보 페이지 관리
   - 해당 투어의 홍보 페이지가 생성되었는지 확인

## 주의사항

- SQL 실행 시 기존 테이블이 있으면 자동으로 스킵됩니다 (IF NOT EXISTS)
- 모든 기존 투어에 대해 자동으로 홍보 페이지가 생성됩니다
- slug는 투어 제목을 기반으로 자동 생성됩니다

## 문제가 계속되면

1. **에러 메시지 확인**
   - SQL 실행 시 에러가 있었는지 확인
   - 브라우저 콘솔에서 에러 확인

2. **캐시 문제**
   - 브라우저 캐시 삭제
   - Vercel 재배포: `vercel --prod`

3. **권한 문제**
   - Supabase Dashboard > Authentication > Policies 확인
   - RLS 정책이 올바르게 설정되었는지 확인

## SQL 파일 위치
- 전체 수정 SQL: `/temp/FINAL-promotion-fix.sql`
- 긴급 수정 SQL: `/temp/fix-promotion-page-urgent.sql`
- 원본 마이그레이션: `/supabase/migrations/20250619_create_tour_promotion_tables.sql`
