# Vercel 환경 변수 설정 가이드

## 1. Vercel Dashboard에서 환경 변수 추가

1. [Vercel Dashboard](https://vercel.com) 로그인
2. 싱싱골프 프로젝트 선택
3. Settings 탭 클릭
4. 왼쪽 메뉴에서 "Environment Variables" 선택

## 2. 필수 환경 변수 추가

다음 환경 변수들을 추가하세요:

### Supabase 설정
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://weciawnqjutghprtpztg.supabase.co`
- **Environment**: Production, Preview, Development 모두 체크

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGc...` (실제 Anon Key)
- **Environment**: Production, Preview, Development 모두 체크

### Solapi 설정
- **Name**: `SOLAPI_API_KEY`
- **Value**: 실제 Solapi API Key (예: NCSXXXXXXXX)
- **Environment**: Production, Preview, Development 모두 체크

- **Name**: `SOLAPI_API_SECRET`
- **Value**: 실제 Solapi API Secret
- **Environment**: Production, Preview, Development 모두 체크

- **Name**: `SOLAPI_SENDER`
- **Value**: `0312153990` (하이픈 없이)
- **Environment**: Production, Preview, Development 모두 체크

- **Name**: `SOLAPI_PFID` (카카오톡 사용시)
- **Value**: 카카오 채널 ID
- **Environment**: Production, Preview, Development 모두 체크

## 3. 환경 변수 저장 및 재배포

1. 모든 환경 변수 추가 후 "Save" 클릭
2. Deployments 탭으로 이동
3. 가장 최근 배포의 ... 메뉴 클릭
4. "Redeploy" 선택
5. "Use existing Build Cache" 체크 해제
6. "Redeploy" 버튼 클릭

## 4. 확인 사항

- 환경 변수명이 정확한지 확인 (대소문자 구분)
- 값에 따옴표나 공백이 포함되지 않았는지 확인
- API Key와 Secret이 실제 값인지 확인 (your_xxx 형태가 아님)

## 5. 문제 해결

배포 후에도 오류가 발생하면:
1. Vercel Functions 로그 확인
2. 환경 변수가 제대로 적용되었는지 확인
3. API Key가 유효한지 Solapi 대시보드에서 확인
