# 스크립트 실행 권한 설정

## 실행 권한 부여가 필요한 파일들

```bash
# 데이터베이스 스키마 덤프 스크립트
chmod +x dump-schema.sh

# Git 커밋 스크립트 (이미 실행 권한이 있을 수 있음)
chmod +x git-commit.sh
```

## 사용 예시

### 1. 데이터베이스 스키마 백업
```bash
./dump-schema.sh
```

### 2. Git 커밋
```bash
./git-commit.sh "feat: 새로운 기능 추가"
```
