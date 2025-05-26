# 배포 가이드

## 자동 배포 (권장)
```bash
./git-commit.sh
```

## 수동 배포
```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```

## 배포 프로세스
1. **로컬 테스트**: `npm run build`
2. **커밋**: 변경사항 커밋
3. **푸시**: main 브랜치 푸시
4. **자동 배포**: Vercel이 자동으로 배포

## 환경별 URL
- **개발**: http://localhost:3000
- **프로덕션**: https://go2.singsinggolf.kr

## 롤백
```bash
# Git 롤백
git revert HEAD
git push origin main

# 또는 Vercel 대시보드에서 이전 배포 선택
```

## 모니터링
- Vercel Dashboard: 배포 상태 확인
- Analytics: 성능 모니터링
- Error Tracking: 에러 로그 확인

## 체크리스트
- [ ] 로컬 빌드 성공
- [ ] TypeScript 에러 없음
- [ ] 환경 변수 설정
- [ ] 주요 기능 테스트
