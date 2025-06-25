# 솔라피 API v4 문제 해결 로그

## 📝 발생한 문제들과 해결 과정

### 1. **404 Not Found 에러**
- **원인**: API 엔드포인트가 잘못됨
- **해결**: `/messages/v4/send-many` → `/messages/v4/send`

### 2. **"발송잔액이 부족합니다" 에러**
- **원인**: 솔라피 계정에 잔액이 없음
- **해결**: 솔라피 대시보드에서 충전 필요

### 3. **"to/from 사용할 수 없습니다" 에러**
- **원인**: 
  - 발신번호 미등록
  - 전화번호 형식 문제
- **해결**: 
  - 발신번호 등록 (031-215-3990)
  - 전화번호에서 하이픈, 공백 제거

### 4. **"message 필수입니다" 에러**
- **원인**: API 요청 형식이 잘못됨
- **해결**: 
  ```javascript
  // 잘못된 형식
  body: JSON.stringify(msg)
  
  // 올바른 형식
  body: JSON.stringify({
    message: msg
  })
  ```

### 5. **시간대 문제**
- **원인**: 서버가 UTC 시간 사용
- **해결**: 표시할 때 한국 시간으로 변환
  ```javascript
  new Date(log.created_at).toLocaleString('ko-KR', { 
    timeZone: 'Asia/Seoul'
  })
  ```

## 📌 최종 체크리스트

### 솔라피 설정
- [ ] 잔액 충전 완료
- [ ] 발신번호 등록 완료 (031-215-3990)
- [ ] API 키 권한 확인

### 코드 수정
- [x] API 엔드포인트 수정
- [x] 전화번호 형식 정리
- [x] API 요청 형식 수정
- [x] 시간대 표시 수정

### 환경변수 (Vercel)
- [x] SOLAPI_API_KEY
- [x] SOLAPI_API_SECRET
- [x] SOLAPI_SENDER
- [x] SOLAPI_PFID

## 🎯 결과
모든 기술적 문제는 해결되었으며, 솔라피 계정 설정만 완료하면 정상 작동합니다.
