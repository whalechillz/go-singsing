# 마케팅 표시 인원 관리 기능

## 개요
실제 참가자 수와 다르게 마케팅 목적으로 표시할 인원 수를 관리할 수 있는 기능입니다.

## 구현 내용

### 1. 데이터베이스 변경
- `singsing_tours` 테이블에 `marketing_participant_count` 필드 추가
- 마이그레이션 파일: `/supabase/pending_migrations/add_marketing_participant_count.sql`

### 2. 투어 수정 페이지 개선
- 위치: 투어 관리 → 각 투어의 '수정' 버튼
- '참가자 수 관리' 섹션 추가
  - 실제 참가자: 현재 등록된 참가자 수 표시
  - 마케팅 표시 인원: 고객에게 보여질 인원 수 설정

### 3. 고객용 페이지 변경
- 마케팅 표시 인원이 설정되어 있으면 해당 값 표시
- 설정되지 않은 경우 실제 참가자 수 표시

## 사용 방법

### 1. 데이터베이스 마이그레이션
```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS marketing_participant_count INTEGER;

UPDATE singsing_tours 
SET marketing_participant_count = current_participants 
WHERE marketing_participant_count IS NULL;

COMMENT ON COLUMN singsing_tours.marketing_participant_count IS '마케팅 페이지에 표시할 참가자 수 (실제 참가자 수와 다르게 설정 가능)';
```

### 2. 마케팅 표시 인원 설정
1. 관리자 페이지 로그인
2. 투어 관리 메뉴 클릭
3. 원하는 투어의 '수정' 버튼 클릭
4. '참가자 수 관리' 섹션에서 '마케팅 표시 인원' 입력
5. 저장

### 3. 활용 예시
- **인기 있어 보이게**: 실제 16명 → 마케팅 표시 20명
- **최소 인원 충족 보이게**: 실제 2명 → 마케팅 표시 8명
- **마감 임박 효과**: 실제 20명 → 마케팅 표시 23명 (24명 정원)

## 주의사항
- 실제 참가자 수는 변경되지 않습니다
- 관리자 페이지에서는 항상 실제 참가자 수가 표시됩니다
- 고객용 페이지에서만 마케팅 표시 인원이 보입니다
