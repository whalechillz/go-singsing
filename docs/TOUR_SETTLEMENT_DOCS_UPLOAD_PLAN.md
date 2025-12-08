# 투어별 영수증/정산 자료 업로드 기능 개발 계획서

## 📋 목차

1. [현재 상황 분석](#현재-상황-분석)
2. [Supabase Storage 버킷 설정](#supabase-storage-버킷-설정)
3. [폴더 구조 설계](#폴더-구조-설계)
4. [데이터 마이그레이션 계획](#데이터-마이그레이션-계획)
5. [프론트엔드 통합 계획](#프론트엔드-통합-계획)
6. [향후 기능 (OCR/자동 경비 입력)](#향후-기능-ocr자동-경비-입력)
7. [개발 단계별 작업](#개발-단계별-작업)

---

## 현재 상황 분석

### 로컬 폴더 구조

```
/docs/2025-tour-settlement-docs/
  ├── 2025-04-14 (순천)/
  │   └── 영수증/
  │       └── [5개 JPG 파일]
  ├── 2025-04-21 (영덕)/
  │   └── 영수증/
  │       └── [2개 JPG 파일]
  ├── 2025-05-19 (순천)/
  │   └── 영수증/
  │       └── [5개 파일: 4 JPG, 1 JPEG]
  ├── 2025-06-16 (순천)/
  │   └── 경비지출 영수증/
  │       └── [3개 JPG 파일]
  ├── 2025-08-11 (영덕.안경헌.단독)/
  │   └── 영수증/
  │       └── [1개 JPG 파일]
  ├── 2025-09-08 (순천)/
  │   └── 영수증/
  │       └── [1개 JPG 파일]
  ├── 2025-09-12 (순천. 정해철.단독)/
  │   └── 영수증/
  │       └── [3개 JPG 파일]
  ├── 2025-10-13 (영덕)/
  │   └── 영수증/
  │       └── [4개 JPG 파일]
  └── 2025-11-03 (영덕)/
      └── 영수증/
          └── [3개 JPG 파일]
```

### 현재 Supabase Storage 버킷

| 버킷 | 용도 | 공개 여부 | 용량 제한 |
| --- | --- | --- | --- |
| `mms-images` | MMS 발송용 이미지 | Public | 없음 (50MB) |
| `tourist-attractions` | 관광지/갤러리 이미지 | Public | 20MB, 이미지 전용 |
| `tour-settlement-docs` | **정산 자료 (신규)** | Private | 20MB, 모든 타입 |
| `tour-communications` | **투어 커뮤니케이션 캡쳐 (신규)** | Private | 20MB, 모든 타입 |

---

## Supabase Storage 버킷 설정

### `tour-settlement-docs` 버킷

- ✅ 버킷 생성 완료 (Private, 20MB, Any MIME)
- ⏳ **RLS 정책 필요**

#### 권장 RLS SQL

```sql
-- 인증된 사용자만 업로드
CREATE POLICY "Authenticated users can upload settlement docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tour-settlement-docs');

-- 인증된 사용자만 읽기
CREATE POLICY "Authenticated users can read settlement docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tour-settlement-docs');

-- 인증된 사용자만 삭제
CREATE POLICY "Authenticated users can delete settlement docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tour-settlement-docs');

-- 인증된 사용자만 업데이트
CREATE POLICY "Authenticated users can update settlement docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tour-settlement-docs');
```

#### 마이그레이션 파일

- `supabase/migrations/202511XX_create_tour_settlement_docs_bucket.sql`
  - 버킷 생성 (존재하면 생략)
  - 위 RLS 정책 포함

---

## 폴더 구조 설계

### 경로 규칙

```
tour-settlement-docs/
  └── {year}/
      └── {tour-folder}/
          ├── receipts/
          │   ├── golf-course/
          │   ├── bus/
          │   ├── guide/
          │   ├── expenses/
          │   └── other/
          ├── tax-invoices/
          └── contracts/ (필요 시)
```

### 투어 폴더명 규칙

`{YYYY}-{MM}-{DD}-{location}-{optional-info}`

예시:
- `2025-04-14-suncheon`
- `2025-04-21-yeongdeok`
- `2025-08-11-yeongdeok-ahn-gyeongheon`
- `2025-09-12-suncheon-jeong-haecheol`

---

## 데이터베이스 스키마

```sql
CREATE TABLE tour_settlement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  category TEXT CHECK (category IN ('golf-course', 'bus', 'guide', 'expenses', 'tax-invoice', 'other')),
  vendor TEXT,
  amount NUMERIC,
  currency TEXT,
  paid_at DATE,
  ocr_status TEXT DEFAULT 'pending',
  ocr_data JSONB,
  ai_tags JSONB,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tour_settlement_docs_tour_id ON tour_settlement_documents(tour_id);
CREATE INDEX idx_tour_settlement_docs_category ON tour_settlement_documents(category);
CREATE INDEX idx_tour_settlement_docs_vendor ON tour_settlement_documents(vendor);
```

상태: ✅ Supabase SQL Editor로 생성 완료

---

## 데이터 마이그레이션 계획

1. `/docs/2025-tour-settlement-docs/` 폴더명 → 영어 변환
   - `2025-04-14 (순천)` → `2025-04-14-suncheon`
2. 스크립트: `scripts/migrate-settlement-docs.ts`
   - 로컬 폴더 스캔
   - 파일 메타데이터 추출 (이름, 크기, 타입)
   - `singsing_tours`에서 투어 ID 매칭 (날짜 + 지역)
   - Supabase Storage로 업로드
   - `tour_settlement_documents` 테이블에 메타데이터 저장
3. 업로드 검증 후 로컬 백업 유지

---

## 프론트엔드 통합 계획

### 1. 업로드 컴포넌트

- 파일: `components/admin/tours/SettlementReceiptUploader.tsx`
- 기능:
  - 드래그 앤 드롭 / 버튼 업로드
  - 다중 파일 업로드
  - 카테고리 지정
  - 업로드 진행률 표시
  - 업로드 후 목록에 즉시 반영
  - 업로드 전에 `/api/storage/ensure-settlement-bucket` 호출로 버킷 자동 생성 확인

### 2. 뷰어 컴포넌트

- 파일: `components/admin/tours/SettlementReceiptViewer.tsx`
- 기능:
  - 카테고리/날짜 필터
  - 썸네일 + 라이트박스
  - PDF/이미지 미리보기
  - 다운로드/삭제
  - OCR/AI 태그 확인 (향후)

### 3. 정산 페이지 통합

`TourSettlementManager.tsx`에 새 탭 추가:

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    ...
    <TabsTrigger value="receipts">영수증</TabsTrigger>
  </TabsList>
  ...
  <TabsContent value="receipts">
    <SettlementReceiptUploader ... />
    <SettlementReceiptViewer ... />
  </TabsContent>
</Tabs>
```

---

## 향후 기능 (OCR/자동 경비 입력)

1. **OCR 처리 (Phase 4)**
   - Edge Function 또는 API Route에서 OCR 수행
   - 인식 결과를 `ocr_data`에 저장
   - 정산 폼에 자동 입력 제안

2. **AI 메타 태깅**
   - 갤러리에서 사용 중인 AI 태그 생성 로직 재사용
   - `ai_tags`에 저장 → 검색/필터용

---

## 개발 단계별 작업

| 단계 | 작업 | 상태 |
| --- | --- | --- |
| Phase 1 | `tour-settlement-docs` 버킷 생성 | ✅ |
| Phase 1 | RLS 정책 설정 | ✅ |
| Phase 1 | `tour_settlement_documents` 테이블 생성 | ✅ |
| Phase 2 | 업로드/뷰어 컴포넌트 구현 | ✅ |
| Phase 2 | Storage 중복 파일 정리 (2025-04-14-suncheon) | ✅ |
| Phase 3 | 데이터 마이그레이션 스크립트 | ✅ (2025-11-20 1차 실행) |
| Phase 4 | OCR/AI 태깅 | 🔜 |

---

## 파일 구조 (예정)

```
components/admin/tours/
  ├── TourSettlementManager.tsx
  ├── SettlementReceiptUploader.tsx
  └── SettlementReceiptViewer.tsx

utils/
  ├── imageUpload.ts
  └── settlementDocsUpload.ts

scripts/
  └── migrate-settlement-docs.ts

supabase/migrations/
  ├── 202511XX_create_tour_settlement_docs_bucket.sql
  └── 202511XX_create_tour_settlement_documents_table.sql
```

---

## 다음 단계

1. `/docs/2025-tour-settlement-docs/` 폴더명을 영어로 변환 (✅ 완료, 파일명만 추가 정리 예정)
2. 업로드/뷰어 컴포넌트 구현 (✅)
3. `scripts/migrate-settlement-docs.ts`로 Supabase 업로드 자동화
   - 기본: `pnpm settlement-docs:migrate` (dry-run)
   - 실업로드: `pnpm settlement-docs:migrate --apply`
   - 옵션: `--debug`로 상세 로그
4. OCR/AI 기능 준비

---

## 마이그레이션 스크립트 세부 내용

- 파일: `scripts/migrate-settlement-docs.ts`
- 동작 요약:
  - `docs/2025-tour-settlement-docs` 하위 폴더명 `YYYY-MM-DD-slug`를 기반으로 Supabase에서 투어 ID 탐색
  - 서브 폴더명(예: `영수증`, `경비지출`)을 `golf-course / expenses / guide / bus / other`로 자동 매핑
  - Dry-run 모드(기본)로 업로드 경로·매칭 결과를 미리 확인
  - `--apply` 지정 시 Storage 업로드 + `tour_settlement_documents` 레코드 생성
- 에러 처리:
  - 날짜/슬러그로 투어를 단일하게 찾지 못하면 해당 폴더를 건너뛰고 이유 기록
  - 업로드/DB 저장 중 오류가 발생하면 파일 단위로 스킵하고 다음 파일을 계속 진행
- 확장 계획:
  - 향후 `mapping.json` 등을 추가해 날짜가 중복되는 투어를 수동 매핑
  - 업로드가 완료된 폴더는 자동으로 아카이브 디렉터리로 이동 (추가 예정)

### 2025-11-20 1차 마이그레이션 결과

| 로컬 폴더 | 투어 ID | 업로드(건) | 비고 |
| --- | --- | --- | --- |
| 2025-04-14-suncheon | 48da6f0b-80b3-4256-83c2-66b19ff2feaa | 6 | 골프장/경비/식사 영수증 |
| 2025-04-21-yeongdeok | 42ec1758-08da-4372-a55c-efc57e9dd351 | 3 |  |
| 2025-05-19-suncheon | 6ee634ba-9adb-49c5-915c-cb2e246dc51f | 5 |  |
| 2025-06-16-suncheon | eefd49f9-6431-4ad1-a235-3f4f1f176ef0 | 3 |  |
| 2025-08-11-yeongdeok-ahn-gyeongheon | 2c1684a7-4d9d-45bd-9b9f-3e2d8cc060c5 | 1 |  |
| 2025-09-08-suncheon | e75fdea1-eb22-4134-9334-523028b04e1e | 1 |  |
| 2025-09-12-suncheon-jeong-haecheol | e5878cd2-bce7-495d-a428-c2b4e506fcc7 | 3 |  |
| 2025-10-13-yeongdeok | 951e9f8d-a2a9-4504-a33d-86321b09b359 | 4 |  |
| 2025-11-03-yeongdeok | 1c9494a7-c95c-4104-8849-34ea20cb943a | 3 |  |

총 29건이 `tour-settlement-docs` Storage와 `tour_settlement_documents` 테이블에 반영되었습니다.

*마지막 업데이트: 2025-11-XX (계획 수립 단계)*

