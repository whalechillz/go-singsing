#!/bin/bash

# Git 커밋 스크립트
echo "=== 참가자 수 불일치 문제 해결 도구 추가 ==="

# 변경사항 확인
echo -e "\n변경된 파일:"
git status --porcelain

# 스테이징
echo -e "\n파일 추가 중..."
git add scripts/debug/check-participant-count.ts
git add scripts/debug/fix-duplicate-participants.ts
git add package.json
git add FIX_PARTICIPANT_COUNT.md
git add README.md

# 커밋
echo -e "\n커밋 생성 중..."
git commit -m "fix: 참가자 수 불일치 문제 해결 도구 추가

- 참가자 수 불일치 확인 스크립트 추가 (check-participant-count.ts)
- 중복 참가자 정리 스크립트 추가 (fix-duplicate-participants.ts)
- 문제 해결 가이드 문서 작성 (FIX_PARTICIPANT_COUNT.md)
- package.json에 디버그 스크립트 명령어 추가
- README.md 업데이트

이슈: 리스트에서 29/28명으로 표시되지만 실제 상세 페이지에서는 16명만 표시되는 문제 해결"

echo -e "\n✅ 커밋이 완료되었습니다!"
echo "다음 명령어로 푸시할 수 있습니다: git push"
