# Vercel 환경 변수 체크리스트

## 필수 환경 변수:
1. NEXT_PUBLIC_SUPABASE_URL
2. NEXT_PUBLIC_SUPABASE_ANON_KEY

## 확인 방법:
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 위 두 변수가 있는지 확인

## 값:
```
NEXT_PUBLIC_SUPABASE_URL=https://weciawnqjutghprtpztg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY2lhd25xanV0Z2hwcnRwenRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODgzMjIsImV4cCI6MjA2MjQ2NDMyMn0.FSImMugc14M31IlNoRUJTIBTBxg4mgG_A7yllI4sWlM
```

## 추가 후:
- Redeploy 버튼 클릭
- 배포 완료 후 다시 테스트
