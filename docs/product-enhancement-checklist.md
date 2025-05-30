# 여행상품 관리 개선 구현 체크리스트

## 📋 구현 전 준비사항
- [ ] Supabase 대시보드 접속 정보 확인
- [ ] 프로젝트 백업 완료
- [ ] 개발 환경 준비
- [ ] Git 브랜치 생성: `feature/product-type-enhancement`

## ✅ Phase 1: 데이터베이스 작업

### 1.1 백업 (필수!)
- [ ] Supabase SQL Editor 접속
- [ ] 백업 스키마 생성
```sql
CREATE SCHEMA IF NOT EXISTS backup_20250530_product;
```
- [ ] tour_products 테이블 백업
```sql
CREATE TABLE backup_20250530_product.tour_products AS 
SELECT * FROM public.tour_products;
```
- [ ] singsing_tours 테이블 백업
```sql
CREATE TABLE backup_20250530_product.singsing_tours AS 
SELECT * FROM public.singsing_tours;
```
- [ ] 백업 검증
```sql
SELECT 
  (SELECT COUNT(*) FROM public.tour_products) as original,
  (SELECT COUNT(*) FROM backup_20250530_product.tour_products) as backup;
```

### 1.2 ENUM 타입 생성
- [ ] product_type_enum 생성
```sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type_enum') THEN
        CREATE TYPE product_type_enum AS ENUM (
            'bus_package',
            'air_package',
            'custom',
            'day_tour'
        );
    END IF;
END$$;
```
- [ ] 타입 생성 확인
```sql
SELECT typname, typtype 
FROM pg_type 
WHERE typname = 'product_type_enum';
```

### 1.3 tour_products 테이블 수정
- [ ] product_type 컬럼 추가
```sql
ALTER TABLE tour_products 
ADD COLUMN IF NOT EXISTS product_type product_type_enum DEFAULT 'bus_package';
```
- [ ] 추가 컬럼들 생성
```sql
ALTER TABLE tour_products
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS price_adult INTEGER,
ADD COLUMN IF NOT EXISTS price_child INTEGER;
```
- [ ] 기존 데이터 업데이트
```sql
UPDATE tour_products 
SET product_type = 'bus_package' 
WHERE product_type IS NULL;
```
- [ ] 변경사항 확인
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tour_products' 
AND column_name IN ('product_type', 'description', 'price_adult');
```

### 1.4 singsing_tours 테이블 수정
- [ ] tour_type 컬럼 추가
```sql
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS tour_type product_type_enum DEFAULT 'bus_package';
```
- [ ] 기존 투어 업데이트
```sql
UPDATE singsing_tours 
SET tour_type = 'bus_package' 
WHERE tour_type IS NULL;
```
- [ ] 결과 확인
```sql
SELECT tour_type, COUNT(*) 
FROM singsing_tours 
GROUP BY tour_type;
```

## ✅ Phase 2: 소스 코드 작업

### 2.1 타입 정의
- [ ] types 폴더 생성 (없으면)
```bash
mkdir -p types
```
- [ ] types/product.ts 파일 생성
- [ ] ProductType 타입 정의
- [ ] Product 인터페이스 정의
- [ ] Tour 인터페이스 업데이트

### 2.2 상품 관리 페이지 수정
- [ ] app/admin/tour-products/page.tsx 수정
  - [ ] product_type 필드 추가
  - [ ] 타입별 뱃지 표시
- [ ] app/admin/tour-products/new/page.tsx 수정
  - [ ] 상품 유형 선택 드롭다운 추가
  - [ ] 타입별 추가 필드 표시/숨김
- [ ] app/admin/tour-products/[id]/edit/page.tsx 수정
  - [ ] 기존 상품의 타입 표시
  - [ ] 타입 변경 가능 여부 체크

### 2.3 동적 탭 시스템
- [ ] components/tours/DynamicTourTabs.tsx 생성
- [ ] getTourTabs 함수 구현
- [ ] 타입별 탭 구성 정의
- [ ] 탭 아이콘 매핑

### 2.4 투어 상세 페이지
- [ ] app/admin/tours/[id]/layout.tsx 수정
  - [ ] 투어 타입 조회 추가
  - [ ] 동적 탭 적용
- [ ] 각 탭 페이지 조건부 렌더링
  - [ ] boarding 페이지 (bus_package만)
  - [ ] flights 페이지 (air_package만)
  - [ ] pickup 페이지 (day_tour만)

## ✅ Phase 3: 테스트

### 3.1 기본 기능 테스트
- [ ] 기존 버스 패키지 투어 정상 작동 확인
- [ ] 모든 탭이 기존과 동일하게 표시되는지 확인
- [ ] 데이터 조회/수정 정상 작동 확인

### 3.2 새 기능 테스트
- [ ] 새 상품 생성 시 타입 선택 가능
- [ ] 선택한 타입에 따라 다른 필드 표시
- [ ] 저장 후 DB에 올바른 타입 저장 확인

### 3.3 동적 탭 테스트
- [ ] bus_package: 6개 탭 모두 표시
- [ ] air_package: 탑승 탭 없고 항공편 탭 표시
- [ ] day_tour: 객실/탑승 탭 없고 픽업 탭 표시
- [ ] custom: 맞춤 요청 탭 표시

## ✅ Phase 4: 배포

### 4.1 코드 커밋
- [ ] 변경사항 확인
```bash
git status
git diff
```
- [ ] 커밋
```bash
git add .
git commit -m "feat: 다양한 여행상품 타입 지원 추가"
```
- [ ] 푸시
```bash
git push origin feature/product-type-enhancement
```

### 4.2 프로덕션 배포
- [ ] PR 생성 및 리뷰
- [ ] 테스트 서버 배포
- [ ] QA 테스트
- [ ] 프로덕션 배포

### 4.3 배포 후 확인
- [ ] 프로덕션 DB 상태 확인
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 수집

## 🚨 롤백 계획

### 문제 발생 시
1. [ ] 즉시 이전 버전으로 배포
2. [ ] DB 롤백 실행
```sql
-- 타입 컬럼 제거
ALTER TABLE tour_products DROP COLUMN IF EXISTS product_type;
ALTER TABLE singsing_tours DROP COLUMN IF EXISTS tour_type;

-- 또는 모두 bus_package로 되돌리기
UPDATE tour_products SET product_type = 'bus_package';
UPDATE singsing_tours SET tour_type = 'bus_package';
```
3. [ ] 백업 데이터로 복원 (필요시)
```sql
-- 백업에서 복원
DROP TABLE public.tour_products;
CREATE TABLE public.tour_products AS 
SELECT * FROM backup_20250530_product.tour_products;
```

## 📝 참고사항

### 주의할 점
1. 각 단계는 순서대로 진행
2. DB 작업은 트랜잭션으로 묶어서 실행
3. 테스트 없이 프로덕션 배포 금지
4. 백업 없이 작업 시작 금지

### 예상 소요 시간
- Phase 1 (DB): 30분
- Phase 2 (코드): 2시간
- Phase 3 (테스트): 1시간
- Phase 4 (배포): 30분
- **총 예상 시간**: 4시간

---
*체크리스트를 따라 하나씩 완료하며 진행하세요.*
*문제 발생 시 즉시 중단하고 팀에 공유하세요.*