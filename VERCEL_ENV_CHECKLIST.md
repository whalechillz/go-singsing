# Vercel 환경 변수 체크리스트

## 필수 환경 변수:

### Supabase 관련:
1. NEXT_PUBLIC_SUPABASE_URL
2. NEXT_PUBLIC_SUPABASE_ANON_KEY

### Solapi 관련 (메시지 발송):
3. SOLAPI_API_KEY
4. SOLAPI_API_SECRET
5. SOLAPI_SENDER
6. SOLAPI_PFID

## 확인 방법:
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 위 변수들이 모두 있는지 확인

## 값:

### Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://weciawnqjutghprtpztg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY2lhd25xanV0Z2hwcnRwenRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODgzMjIsImV4cCI6MjA2MjQ2NDMyMn0.FSImMugc14M31IlNoRUJTIBTBxg4mgG_A7yllI4sWlM
```

### Solapi:
```
SOLAPI_API_KEY=NCS7CDD0UNDDSBZI
SOLAPI_API_SECRET=3MM1ZK0GGEPLZTFQL4HPXT2K8ECGLC59
SOLAPI_SENDER=031-215-3990
SOLAPI_PFID=KA01PF250616100116116JGCMFKunkh
```

## 추가 후:
- Redeploy 버튼 클릭
- 배포 완료 후 다시 테스트

## 주의사항:
- 환경 변수 이름은 정확히 일치해야 함
- 값에 따옴표나 공백이 들어가지 않도록 주의
- SOLAPI_SENDER는 Solapi에 등록된 발신번호여야 함
