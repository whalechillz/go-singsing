# 개발자 가이드

## 🚀 배포 프로세스

### 중요: 항상 git-commit.sh 스크립트 사용하기

이 프로젝트는 자동 배포 스크립트가 포함되어 있습니다. 
**모든 코드 변경 후에는 반드시 `git-commit.sh`를 사용하세요.**

```bash
# 권장 방법
bash git-commit.sh
```

### 스크립트가 하는 일
1. 변경된 파일 표시
2. 모든 변경사항 자동 스테이징 (git add .)
3. 커밋 메시지 입력 요청
4. 자동 커밋 및 푸시
5. Vercel 자동 배포 트리거
6. 배포 URL 안내

### 주의사항
- 절대 수동으로 git add/commit/push 하지 마세요
- 스크립트를 사용하면 배포 실수를 방지할 수 있습니다
- 실행 권한 문제시 `bash git-commit.sh` 사용

### 배포 확인
- 배포 후 항상 https://go2.singsinggolf.kr 에서 확인
- Vercel 대시보드에서 배포 상태 모니터링

## 📌 Claude AI 사용시 참고사항

Claude에게 다음과 같이 요청하세요:
- "코드 수정 후 git-commit.sh로 배포해줘"
- "변경사항을 커밋하고 배포해줘" (자동으로 스크립트 사용)
- "배포 스크립트 실행해줘"

## 🔧 문제 해결

### 배포가 안 될 때
1. `git status`로 변경사항 확인
2. `bash git-commit.sh` 실행
3. 그래도 안 되면 `vercel --prod` 직접 실행
