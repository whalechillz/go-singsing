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
- **개발(거의 사용 안함)**: http://localhost:3000
- **프로덕션**: https://go2.singsinggolf.kr 


