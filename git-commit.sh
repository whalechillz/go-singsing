#!/bin/bash

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Git 상태 확인
echo "Git 상태 확인..."
git status

# 변경사항 추가
echo "변경사항 추가..."
git add .

# 커밋
echo "커밋 실행..."
git commit -m "feat: 결제 관리 기능 기반 구축 및 DB 스키마 업데이트

- singsing_payments 테이블 활용 및 타입 정의 추가
- 참가자 관리에 그룹 결제 기능 복원 (DB 컴럼 확인)
- 전화번호 선택 입력으로 변경 (대표자 일괄 결제 지원)
- 탑승지 데이터 DB 직접 로드 방식으로 개선
- 관리자 메뉴에 결제 관리 항목 추가
- 결제 관리 페이지 기본 틀 생성
- 문서 업데이트 (/docs/payment-management.md 추가)"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"