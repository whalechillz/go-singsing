# 참가자 티타임 배정 중복 해결 가이드

## 문제 설명
티타임 배정 시 참가자가 중복으로 생성되는 문제가 있었습니다. 
- 예: 3일 배정하면 같은 참가자가 4번 표시됨

## 해결 방법

### 1. 코드 수정 (완료)
`TeeTimeAssignmentManagerV2.tsx` 파일에 중복 방지 로직을 추가했습니다:
- 일괄 배정 시 이미 배정된 날짜는 건너뛰기
- 기존 배정 정보 확인 후 중복 방지
- 자동 배정 시 임시 카운트로 중복 방지

### 2. 데이터베이스 제약 조건 추가
`supabase/migrations/add_unique_constraint_participant_tee_times.sql` 실행:
```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE singsing_participant_tee_times
ADD CONSTRAINT unique_participant_tee_time 
UNIQUE (participant_id, tee_time_id);
```

### 3. 기존 중복 데이터 정리

#### 방법 1: UI에서 정리 (권장)
1. `ParticipantDuplicateCleaner` 컴포넌트 사용
   - 이미 관리자 페이지에 포함되어 있음
   - 날짜가 포함된 이름(예: "조민자 (4/14)")을 하나로 병합

2. `TeeTimeParticipantCleaner` 컴포넌트 사용
   ```tsx
   // 티타임 관리 페이지에 추가
   import { TeeTimeParticipantCleaner } from '@/components/TeeTimeParticipantCleaner';
   
   // 컴포넌트 내부에 추가
   <TeeTimeParticipantCleaner 
     tourId={tourId} 
     onComplete={() => fetchData()} 
   />
   ```

#### 방법 2: SQL로 직접 정리
`supabase/migrations/cleanup_participant_duplicates.sql` 파일 참조:

1. 먼저 중복 확인:
```sql
-- 중복된 배정 확인
SELECT 
  participant_id,
  tee_time_id,
  COUNT(*) as duplicate_count
FROM singsing_participant_tee_times
GROUP BY participant_id, tee_time_id
HAVING COUNT(*) > 1;
```

2. 중복 제거:
```sql
-- 중복 제거 (가장 최근 것만 남김)
WITH duplicates AS (
  SELECT 
    participant_id,
    tee_time_id,
    MAX(created_at) as latest_created_at
  FROM singsing_participant_tee_times
  GROUP BY participant_id, tee_time_id
  HAVING COUNT(*) > 1
)
DELETE FROM singsing_participant_tee_times
WHERE (participant_id, tee_time_id, created_at) IN (
  SELECT 
    pt.participant_id,
    pt.tee_time_id,
    pt.created_at
  FROM singsing_participant_tee_times pt
  INNER JOIN duplicates d 
    ON pt.participant_id = d.participant_id 
    AND pt.tee_time_id = d.tee_time_id
  WHERE pt.created_at < d.latest_created_at
);
```

## 예방 조치

### 1. 참가자 추가 시
- 동일한 이름의 참가자가 있는지 확인
- 날짜를 이름에 포함시키지 않기

### 2. 티타임 배정 시
- 이미 배정된 날짜는 자동으로 스킵
- 일괄 배정 시 중복 체크

### 3. 정기적인 데이터 정리
- 주기적으로 중복 데이터 확인
- `ParticipantDuplicateCleaner` 컴포넌트 활용

## 문제가 계속 발생하면

1. 브라우저 캐시 삭제
2. 페이지 새로고침 (Ctrl+F5)
3. Supabase 대시보드에서 직접 데이터 확인
4. 개발자 도구 콘솔에서 오류 메시지 확인

## 연락처
문제가 지속되면 개발팀에 문의해주세요.
