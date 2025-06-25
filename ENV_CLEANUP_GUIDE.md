# Vercel 환경 변수 정리 가이드

## ✅ 필수 환경 변수 (유지)

### Supabase 관련
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

### Solapi 관련
- `SOLAPI_API_KEY` ✅
- `SOLAPI_API_SECRET` ✅
- `SOLAPI_SENDER` ❌ (추가 필요)
- `SOLAPI_PFID` ✅ (카카오톡 사용시)

### GitHub 관련
- `GITHUB_TOKEN` ✅

### 기타
- `NEXT_PUBLIC_KAKAO_APP_KEY` ✅ (카카오 지도 등)

## ❌ 삭제 가능한 환경 변수

1. `NEXT_PUBLIC_SOLAPI_SENDER` → `SOLAPI_SENDER`로 변경
2. `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` → 중복 (APP_KEY와 동일)
3. `REPO_OWNER` → 사용하지 않음
4. `REPO_NAME` → 사용하지 않음

## 🛠️ 수정 작업

### 1. Vercel에서 환경 변수 추가
- Name: `SOLAPI_SENDER`
- Value: `0312153990`
- Environment: Production ✅

### 2. 불필요한 환경 변수 삭제
- `NEXT_PUBLIC_SOLAPI_SENDER` 삭제
- `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` 삭제
- `REPO_OWNER` 삭제 
- `REPO_NAME` 삭제

### 3. .env.local 파일 정리
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://weciawnqjutghprtpztg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Solapi 설정
SOLAPI_API_KEY=NCS7CDD0UNDDSBZI
SOLAPI_API_SECRET=3MM1ZK0GGEPLZTFQL4HPXT2K8ECGLC59
SOLAPI_SENDER=0312153990
SOLAPI_PFID=KA01PF25061610011G1JGCMFKunkh

# 카카오 설정
NEXT_PUBLIC_KAKAO_APP_KEY=6afa608507c489ac6e6244d4da59cce3

# GitHub 설정 (필요시)
GITHUB_TOKEN=github_pat_...
```
