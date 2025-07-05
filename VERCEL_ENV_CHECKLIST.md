## Vercel 환경 변수 체크리스트

### 필수 환경 변수 체크리스트

#### Supabase 관련
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key (선택)

#### SMS/카카오 관련
- [ ] `SOLAPI_API_KEY` - Solapi API Key (예: NCS...)
- [ ] `SOLAPI_API_SECRET` - Solapi API Secret
- [ ] `SOLAPI_SENDER` - 발신번호 (0312153990)
- [ ] `SOLAPI_PFID` - 카카오 채널 ID (선택)

#### AI 관광지 등록 관련 (NEW)
- [ ] `SERPAPI_KEY` - Google 검색 API 키
- [ ] `ANTHROPIC_API_KEY` - Claude API 키
- [ ] `FAL_API_KEY` - FAL.ai 이미지 생성 API 키
- [ ] `OPENAI_API_KEY` - OpenAI API 키 (선택)

### 확인 방법

1. Vercel Dashboard → Settings → Environment Variables
2. 각 변수가 있는지 확인
3. 값이 'your_xxx' 형태가 아닌 실제 값인지 확인
4. Production 환경에 체크되어 있는지 확인

### 일반적인 실수

1. **환경 변수명 오타**
   - ❌ `SOLAPI_API_KEY` → `SOLAPIAPI_KEY`
   - ❌ `SOLAPI_SENDER` → `SOLAPI_SENDER_PHONE`

2. **값에 따옴표 포함**
   - ❌ `"0312153990"`
   - ✅ `0312153990`

3. **잘못된 환경 선택**
   - Production에 체크 안 함
   - Development만 체크

### 재배포 방법

1. 환경 변수 수정 후 저장
2. Deployments 탭 이동
3. 최근 배포 → ... → Redeploy
4. "Use existing Build Cache" 체크 해제
5. Redeploy 클릭
