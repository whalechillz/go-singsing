#!/bin/bash

# Git 스크립트 설정

echo "Git 도우미 스크립트 설정 중..."

# 실행 권한 부여
chmod +x git-commit.sh
chmod +x git-quick-commit.sh
chmod +x git-status.sh
chmod +x git-log.sh

echo "✅ 실행 권한 설정 완료!"
echo ""
echo "사용 가능한 명령어:"
echo "  ./git-commit.sh      - 대화형 커밋 도우미"
echo "  ./git-quick-commit.sh \"메시지\" - 빠른 커밋"
echo "  ./git-status.sh      - 저장소 상태 확인"
echo "  ./git-log.sh         - 커밋 히스토리 보기"
echo ""
echo "팁: 자주 사용하는 명령어는 alias로 등록하세요:"
echo "  alias gc='./git-commit.sh'"
echo "  alias gq='./git-quick-commit.sh'"
echo "  alias gs='./git-status.sh'"
echo "  alias gl='./git-log.sh'"
