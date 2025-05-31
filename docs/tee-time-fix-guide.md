# 티오프시간 시스템 수정 가이드

## 문제점 요약

1. **데이터베이스 컬럼 이름 불일치**
   - 에러: "null value in column 'date' of relation 'singsing_tee_times'"
   - 원인: 테이블에는 `play_date` 컬럼이 있지만 코드에서 `date`를 참조함

2. **참가자 테이블 컬럼 누락**
   - 에러: "Could not find the 'tee_time_id' column of 'singsing_participants'"
   - 원인: `singsing_participants` 테이블에 `tee_time_id` 컬럼이 없음

3. **골프 코스 하드코딩**
   - 코스 목록이 코드에 하드코딩되어 있어 동적 관리 불가

## 해결 방법

### 1. 데이터베이스 마이그레이션 실행

```bash
# Supabase SQL Editor에서 다음 스크립트 실행
/scripts/migration/fix_tee_time_schema.sql
```

이 스크립트는 다음 작업을 수행합니다:
- `date` 컬럼을 `play_date`로 변경
- `singsing_participants` 테이블에 `tee_time_id` 컬럼 추가
- `golf_courses` 테이블 생성 및 기본 데이터 삽입

### 2. 코드 수정 사항

#### a) 골프 코스 관리 (/constants/golf-courses.ts)
- 하드코딩된 코스 목록을 별도 파일로 분리
- 추후 DB에서 동적으로 가져올 수 있도록 구조화

#### b) TeeTimeSlotManager.tsx 수정
- 에러 로깅 추가로 디버깅 용이성 향상
- 데이터베이스에서 골프 코스 목록 동적 로드
- 로드 실패 시 하드코딩된 목록 사용 (폴백)

### 3. 스키마 캐시 새로고침

Supabase 대시보드에서:
1. Settings → API → Reload schema cache 클릭
2. 또는 새로운 마이그레이션 실행 후 자동 새로고침 대기

### 4. 테스트 방법

1. 티오프시간 추가 테스트
   ```javascript
   // 브라우저 콘솔에서 확인
   console.log('Inserting tee times:', newTeeTimes);
   ```

2. 골프 코스 목록 확인
   ```sql
   SELECT * FROM golf_courses ORDER BY display_order;
   ```

3. 참가자 티타임 연결 확인
   ```sql
   SELECT p.name, t.play_date, t.tee_time, t.golf_course
   FROM singsing_participants p
   JOIN singsing_tee_times t ON p.tee_time_id = t.id
   WHERE p.tour_id = '[TOUR_ID]';
   ```

## 추가 개선 사항

1. **골프 코스 관리 페이지 추가**
   - 관리자가 UI에서 코스 추가/수정/삭제 가능

2. **에러 처리 개선**
   - 사용자 친화적인 에러 메시지
   - 자동 재시도 로직

3. **성능 최적화**
   - 코스 목록 캐싱
   - 배치 업데이트 최적화

## 문제 지속 시 확인사항

1. Supabase RLS(Row Level Security) 정책 확인
2. 사용자 권한 확인
3. 네트워크 연결 상태
4. 브라우저 콘솔 에러 로그 확인