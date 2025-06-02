#!/bin/bash

# Git 변경사항 추가
git add .

# 커밋 메시지
git commit -m "fix: 티타임 관리 및 미리보기 오류 긴급 수정

- 티타임 관리: 코스별 색상 구분이 표시되도록 인라인 스타일 적용
- 남녀 표시: 성별 정보가 없을 때 기본값 설정 및 색상 구분 추가
- 미리보기 화면: document_footers 테이블 접근 오류 처리
- 코스별 색상: 파인(녹색), 레이크(파랑), 힐스(주황) 등 시각적 구분"

# Push to main branch
git push origin main

echo "✅ 긴급 수정 완료 및 배포!"