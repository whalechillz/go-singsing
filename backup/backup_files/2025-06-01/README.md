# 백업 파일 정리 로그

## 2025-06-01 수정 사항

### 문제
티오프시간 관리 페이지의 코스 드롭다운에 골프 코스 이름 대신 사람 이름이 표시됨

### 원인
`/constants/golf-courses.ts` 파일에 골프 코스 목록 대신 사람 이름이 하드코딩되어 있었음

### 해결
1. 불필요한 `golf-courses.ts` 파일 삭제 (`/backup_files/2025-06-01/golf-courses.ts.removed`)
2. `TeeTimeSlotManager.tsx`에서 하드코딩된 import 제거
3. DB(`tour_products`)에서만 골프장 정보를 가져오도록 수정
4. 코스 로테이션 생성 시 코스가 없는 경우 에러 메시지 추가

### 영향받는 컴포넌트
- `TeeTimeSlotManager.tsx` - GOLF_COURSES import 제거, DB에서만 데이터 가져오도록 수정

### 현재 동작 방식
- `fetchGolfCourses()` 함수가 `tour_products` 테이블에서 골프장 정보를 조회
- 하드코딩된 목록 없이 DB에서만 데이터를 가져옴
- 코스 정보가 없으면 사용자에게 명확한 안내 메시지 표시

---

## 이전 백업 파일들

### 2025-01-06-cleanup
초기 프로젝트 정리 시 백업된 파일들

### 20250527, 20250528, 20250530  
개발 중 백업된 파일들

### misc_docs
기타 문서 백업

### TeeTimeAssignmentManager_backup.txt
티타임 배정 관리자 컴포넌트의 이전 버전
