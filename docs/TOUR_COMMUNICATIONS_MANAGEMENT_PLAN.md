# 투어별 커뮤니케이션(카톡/부킹 등) 자료 관리 계획서

## 📋 목차

1. [목표](#목표)
2. [Supabase Storage 설계](#supabase-storage-설계)
3. [폴더/파일 구조](#폴더파일-구조)
4. [메타데이터 및 AI 태그](#메타데이터-및-ai-태그)
5. [프론트엔드 통합 계획](#프론트엔드-통합-계획)
6. [갤러리 기능 재사용 전략](#갤러리-기능-재사용-전략)
7. [개발 단계별 작업](#개발-단계별-작업)
8. [향후 고도화](#향후-고도화)

---

## 목표

- 투어 진행 중 발생하는 커뮤니케이션(카톡 캡처, 부킹 확인서, 기사/가이드 공지 등)을 중앙에서 관리
- 투어 스케줄 관리 화면에서 담당자가 바로 확인 가능하도록 뷰어 제공
- 기존 갤러리 시스템(tourist-attractions)과 동일한 메타 태깅/AI 요약 파이프라인을 재사용

---

## Supabase Storage 설계

| 버킷 | 용도 | 공개 여부 | 용량 제한 | 상태 |
| --- | --- | --- | --- | --- |
| `tour-communications` | 커뮤니케이션 자료 (카톡, NateOn, 부킹 등) | Private | 20MB | ✅ 생성 완료 |

### RLS 정책 (정산 자료와 동일)
```sql
CREATE POLICY "Authenticated users can upload tour communications"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tour-communications');

CREATE POLICY "Authenticated users can read tour communications"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'tour-communications');

CREATE POLICY "Authenticated users can delete tour communications"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tour-communications');

CREATE POLICY "Authenticated users can update tour communications"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'tour-communications');
```

---

## 폴더/파일 구조

```
tour-communications/
  └── {year}/
      └── {tourId}/
          └── communications/
              ├── kakao/
              ├── nateon/
              ├── booking/
              ├── driver/
              ├── guide/
              └── other/
```

- **tourId**: `singsing_tours.id` (UUID)
- **type**: `kakao`, `nateon`, `booking`, `driver`, `guide`, `other`
- **파일명 규칙**: `{type}-{context}-{YYYYMMDD-HHmm}-{seq}.{ext}`
  - 예: `kakao-yeongdeok-booking-20251103-01.png`

---

## 메타데이터 및 AI 태그

**테이블 제안**: `tour_communication_documents`

```sql
CREATE TABLE tour_communication_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  channel TEXT,        -- kakao, nateon, booking, driver, guide, other
  topic TEXT,
  participants TEXT[],
  action_item TEXT,
  sentiment TEXT,
  ocr_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  ai_summary JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

- **Meta Tag 필드**: `topic`, `participants`, `action_item`, `sentiment`, `ocr_text`
- AI 태그/요약은 tourist-attractions 버킷에서 사용 중인 AI 파이프라인 재사용 (참고 commit [`e4ef8a0`](https://github.com/whalechillz/mas-win/commit/e4ef8a073a2e0669ecb6d07c6c173100d4f9de7c))
- 이미지 OCR 결과는 `ocr_text`에 저장하여 검색 가능하도록 함

---

## 프론트엔드 통합 계획

### 위치
- `투어 스케줄 관리` 페이지 상단에 “커뮤니케이션 뷰어” 토글 패널 추가

### 기능
1. **토글 패널**
   - 기본은 접힌 상태, 클릭 시 전체 뷰어 오픈
2. **필터링**
   - 채널(type), 날짜, 참여자(tag), 검색어(ocr_text)
3. **그리드 뷰**
   - 썸네일 그리드 + 원본 비율 유지
   - 파일 타입별 뱃지 (이미지, PDF, 영상 등)
4. **라이트박스**
   - 확대 보기, 좌우 이동, 다운로드
   - PDF/문서일 경우 iframe viewer 혹은 새 탭 오픈
5. **메타 정보 표시**
   - topic/participants/action_item/sentiment/ocr_text
   - AI 요약 (있을 경우)
6. **업로드 버튼**
   - Drag & Drop + 채널 지정

---

## 갤러리 기능 재사용 전략

1. **공통 모듈화**
   - 기존 MAS 갤러리 관리자(폴더 구조, 메타 태그, AI 생성)를 `SharedGalleryManager`(가칭)로 분리
   - props로 `bucketName`, `metaFields`, `folderStrategy` 전달
2. **AI/메타 파이프라인**
   - 이미지 업로드 → 백엔드에서 chunk 처리(부분 성공 대응, commit `e4ef8a0` 로직 활용)
   - AI 메타태그 생성기 그대로 재사용 (topic, participants, action_item, sentiment)
3. **스토리지 연동**
   - tourist-attractions & tour-communications 두 버킷 모두 공통 코드 사용

---

## 개발 단계별 작업

| 단계 | 작업 | 상태 |
| --- | --- | --- |
| Phase 1 | `tour-communications` 버킷 생성 & RLS 적용 | ✅ |
| Phase 1 | `tour_communication_documents` 테이블 생성 | ✅ |
| Phase 2 | 공통 갤러리 모듈 분리 | ⏳ |
| Phase 2 | 커뮤니케이션 업로드/뷰어 컴포넌트 구현 (`/admin/tours/[id]/communications`) | ✅ |
| Phase 3 | AI 메타태그/요약 파이프라인 연결 | ⏳ |
| Phase 3 | 투어 스케줄 관리 UI 통합 (상단 탭에 커뮤니케이션 뷰어) | ✅ |

---

## 향후 고도화

1. **OCR 기반 검색/하이라이트**
   - 카톡 텍스트 추출 → 키워드 검색
2. **참여자 자동 식별**
   - LLM으로 메시지 내 이름/역할 추출 → `participants` 필드 자동 채움
3. **Action Item 추적**
   - `action_item` 필드 기반 To-Do 생성과 연동
4. **보안/접근 제어**
   - 투어 담당자별 접근 권한 세분화 (예: 골프장 담당자 vs 내부 직원)

---

*마지막 업데이트: 2025-11-XX*

