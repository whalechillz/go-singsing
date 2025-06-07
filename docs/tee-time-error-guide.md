// TourSchedulePreview 에러 해결 가이드

## 문제 해결 방법

### 1. 브라우저 콘솔 확인
- F12를 눌러서 개발자 도구를 열고 Console 탭 확인
- 빨간색 에러 메시지 확인

### 2. 일반적인 에러 해결

#### A. "Cannot read property of undefined" 에러인 경우:
```typescript
// getDocumentHTML 함수에서 null 체크 추가
case 'customer_timetable':
  return teeTimeCustomerHTML || '<div class="no-data">티타임표를 생성 중입니다...</div>';
case 'staff_timetable':
  return teeTimeStaffHTML || '<div class="no-data">티타임표를 생성 중입니다...</div>';
```

#### B. "fetchTeeTimes is not a function" 에러인 경우:
- useEffect 훅이 제대로 실행되는지 확인
- tourData가 로드된 후에 fetchTeeTimes가 호출되는지 확인

#### C. Supabase 관련 에러인 경우:
- singsing_tee_times 테이블이 존재하는지 확인
- singsing_participant_tee_times 테이블이 존재하는지 확인
- 권한 문제가 없는지 확인

### 3. 임시 해결책

브라우저에서 다음을 시도해보세요:
1. 페이지 새로고침 (F5)
2. 캐시 삭제 후 새로고침 (Ctrl+Shift+F5)
3. 다른 투어 선택 후 다시 돌아오기

### 4. 로그 추가하여 디버깅

```typescript
// fetchTeeTimes 함수 시작 부분에 추가
console.log('fetchTeeTimes 시작');

// 티타임 데이터 로드 후
console.log('티타임 데이터:', teeTimes);

// HTML 생성 후
console.log('고객용 HTML 길이:', customerHTML.length);
console.log('내부용 HTML 길이:', staffHTML.length);
```

### 5. 데이터베이스 확인

Supabase 대시보드에서:
1. singsing_tee_times 테이블에 데이터가 있는지 확인
2. tour_id가 올바른지 확인
3. play_date, tee_time 필드가 있는지 확인

### 6. 네트워크 탭 확인

개발자 도구 > Network 탭에서:
1. Supabase API 호출이 성공하는지 확인
2. 401, 403, 404 등의 에러가 없는지 확인

## 정확한 에러 메시지를 알려주시면 더 구체적인 해결책을 제시할 수 있습니다!
