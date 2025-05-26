# Git 도우미 스크립트 모음

싱싱골프투어 프로젝트를 위한 Git 작업 자동화 스크립트입니다.

## 🚀 빠른 시작

먼저 설정 스크립트를 실행하여 실행 권한을 부여합니다:

```bash
bash setup-git-scripts.sh
```

## 📝 스크립트 설명

### 1. git-commit.sh
대화형 커밋 도우미입니다. 커밋 타입, 메시지, 상세 설명을 단계별로 입력할 수 있습니다.

```bash
./git-commit.sh
```

**특징:**
- 커밋 타입 선택 (feat, fix, docs 등)
- 파일 선택적 스테이징
- 커밋 메시지 미리보기
- 자동 push 옵션

### 2. git-quick-commit.sh
빠른 커밋을 위한 스크립트입니다.

```bash
./git-quick-commit.sh "참가자 관리 기능 개선"
```

**특징:**
- 모든 변경사항 자동 스테이징
- feat 타입으로 자동 커밋
- 자동 push

### 3. git-status.sh
저장소 상태를 한눈에 확인할 수 있습니다.

```bash
./git-status.sh
```

**표시 정보:**
- 현재 브랜치
- 원격 저장소 동기화 상태
- 최근 커밋 5개
- 변경된 파일 요약
- Stash 목록

### 4. git-log.sh
커밋 히스토리를 다양한 방식으로 확인할 수 있습니다.

```bash
./git-log.sh
```

**옵션:**
1. 간단히 보기
2. 그래프로 보기
3. 상세히 보기
4. 특정 파일 히스토리
5. 특정 작성자 커밋
6. 날짜 범위 검색
7. 메시지로 검색

## 💡 유용한 팁

### Alias 설정
자주 사용하는 명령어를 짧게 만들 수 있습니다.

```bash
# ~/.bashrc 또는 ~/.zshrc에 추가
alias gc='cd /Users/prowhale/MASLABS/go2.singsinggolf.kr && ./git-commit.sh'
alias gq='cd /Users/prowhale/MASLABS/go2.singsinggolf.kr && ./git-quick-commit.sh'
alias gs='cd /Users/prowhale/MASLABS/go2.singsinggolf.kr && ./git-status.sh'
alias gl='cd /Users/prowhale/MASLABS/go2.singsinggolf.kr && ./git-log.sh'
```

### 커밋 메시지 규칙

**타입:**
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 수정
- `design`: CSS 등 사용자 UI 디자인 변경

**예시:**
```
feat: 참가자 일괄 업로드 기능 추가
fix: 상태 변경 시 페이지 스크롤 문제 해결
design: 관리자 페이지 UI 전면 개선
```

## 🔧 문제 해결

### 권한 오류
```bash
chmod +x *.sh
```

### 경로 오류
스크립트 내의 경로를 프로젝트 위치에 맞게 수정하세요:
```bash
cd /your/project/path
```

## 📌 주의사항

- 커밋 전 항상 변경사항을 확인하세요
- 중요한 작업 전에는 브랜치를 만들어 작업하세요
- push 전에 pull을 먼저 실행하여 충돌을 방지하세요
