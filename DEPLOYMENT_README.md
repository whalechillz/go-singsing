# 🚀 참가자-결제 연동 기능 배포 방법

## 📋 준비사항

1. **ParticipantsManagerV2.tsx 파일 수정**
   - artifacts에서 생성된 코드를 참고하여 수정
   - 또는 수동으로 결제 상태 표시 기능 추가

2. **스크립트 실행 권한 설정**
   ```bash
   ./setup-git-scripts.sh
   ```

## 🔧 배포 방법

### 방법 1: 대화형 스크립트 (권장)
```bash
./git-commit.sh
```
- 단계별로 안내를 따라 진행
- 커밋 메시지 커스터마이즈 가능
- Push 전 확인 단계 포함

### 방법 2: 빠른 배포 스크립트
```bash
./quick-payment-integration-commit.sh
```
- 한 번에 커밋 & Push & 배포
- 사전 설정된 커밋 메시지 사용

### 방법 3: 수동 배포
```bash
# 1. 변경사항 확인
git status

# 2. 파일 추가
git add components/ParticipantsManagerV2.tsx

# 3. 커밋
git commit -m "feat: 참가자 목록에 결제 상태 표시 기능 추가"

# 4. Push
git push origin main
```

## ✅ 배포 확인

1. **Vercel 대시보드**
   - https://vercel.com/dashboard
   - 배포 진행 상태 확인

2. **실제 사이트**
   - https://go2.singsinggolf.kr/admin/participants
   - 참가자 목록에서 결제 상태 확인

## 🎯 새로운 기능

- **결제 상태 표시**: ✅ 결제완료, ⏳ 결제대기, 미결제
- **일괄결제 표시**: 💳 아이콘으로 구분
- **결제 금액 표시**: 각 참가자별 결제 금액
- **통계 추가**: 결제완료/미결제 인원 및 결제율
- **필터링**: 결제완료/미결제 탭으로 필터링

## ⚠️ 주의사항

- Supabase 데이터베이스 수정은 불필요
- 프론트엔드 코드만 수정하면 작동
- 배포 후 캐시 때문에 바로 반영 안 될 수 있음 (Ctrl+F5로 새로고침)
