# 🚀 Git Commit 사용법

## 1. 정리하기 (처음 한 번만)
```bash
chmod +x cleanup-files.sh
./cleanup-files.sh
rm cleanup-files.sh
```

## 2. 실행 권한 부여 (처음 한 번만)
```bash
chmod +x git-commit.sh
```

## 3. 사용 방법

### 방법 1: bash 사용
```bash
bash git-commit.sh
```

### 방법 2: 직접 실행 (권장)
```bash
./git-commit.sh
```

## 4. 더 편하게 사용하기 (선택사항)

### alias 설정
```bash
# ~/.zshrc 또는 ~/.bash_profile에 추가
alias gc='./git-commit.sh'

# 설정 적용
source ~/.zshrc
```

### 이후 사용
```bash
gc
```

## 📝 기능
- 자동으로 모든 변경사항을 git add
- 커밋 메시지 입력 (엔터만 치면 자동 생성)
- 자동 push
- 컬러풀한 상태 표시

## ❓ FAQ

**Q: bash를 항상 써야 하나요?**
A: 아니요! 실행 권한만 있으면 `./git-commit.sh`로 실행 가능합니다.

**Q: 왜 ./를 붙여야 하나요?**
A: 현재 디렉토리의 스크립트를 실행한다는 의미입니다. PATH에 등록되지 않은 스크립트는 경로를 명시해야 합니다.
