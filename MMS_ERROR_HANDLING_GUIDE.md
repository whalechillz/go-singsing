# MMS 메시지 발송 오류 처리 가이드

## 🔍 현재 상황

1. **이미지는 정상 업로드됨** - Supabase Storage의 `mms-images` 버킷에 저장
2. **메시지 발송은 실패** - 솔라피 API 404 에러로 인한 실패
3. **로그는 저장됨** - `message_logs` 테이블에 실패 기록 저장

## 📊 오류 확인 방법

### 1. 웹 인터페이스에서 확인
- **메시지 발송** → **발송 이력** 탭
- 상태가 "발송실패"인 항목 확인

### 2. SQL로 직접 확인
```sql
-- Supabase SQL Editor에서 실행
-- scripts/check-message-logs.sql 파일 내용 참조

-- 실패한 메시지 조회
SELECT * FROM message_logs 
WHERE status IN ('failed', 'pending')
ORDER BY created_at DESC;
```

## 🧹 정리 방법

### 1. 사용하지 않는 이미지 정리

```bash
# dotenv 패키지 설치 (처음 한 번만)
npm install

# 정리 대상 확인 (삭제하지 않고 목록만 표시)
npm run cleanup-mms-images

# 실제로 삭제
npm run cleanup-mms-images -- --confirm
```

### 2. 실패한 메시지 재발송

```bash
# 재발송 대상 확인
npm run retry-messages

# 실제로 재발송 (비용 발생 주의!)
npm run retry-messages -- --confirm
```

## ⚠️ 주의사항

1. **이미지 정리 시**
   - 삭제 전 반드시 목록을 확인하세요
   - 실제 사용 중인 이미지는 삭제되지 않습니다

2. **메시지 재발송 시**
   - 추가 비용이 발생합니다
   - MMS의 경우 이미지를 다시 첨부해야 할 수 있습니다

3. **로그 보관**
   - 실패 로그는 분석을 위해 일정 기간 보관하는 것을 권장합니다
   - 필요시 오래된 로그만 선택적으로 삭제하세요

## 🔧 문제 해결됨

솔라피 API 엔드포인트가 수정되어 이제 정상적으로 작동합니다:
- ❌ 이전: `/messages/v4/send-many` (404 에러)
- ✅ 현재: `/messages/v4/send` (정상 작동)

## 📝 추가 팁

1. **정기적인 정리**
   - 월 1회 정도 사용하지 않는 이미지 정리 권장
   - 3개월 이상 된 실패 로그는 삭제 고려

2. **모니터링**
   - 발송 이력을 주기적으로 확인
   - 실패율이 높으면 API 키나 설정 확인

3. **백업**
   - 중요한 로그는 삭제 전 백업
   - Supabase 대시보드에서 데이터 내보내기 기능 활용
