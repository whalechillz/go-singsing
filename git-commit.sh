#!/bin/bash

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Git 상태 확인
echo "📋 변경사항:"
git status --short
echo ""

# 변경사항 추가
git add .

# 커밋
git commit -m "feat: 참가자 관리 UX 개선 및 결제 관리 기능 추가

✨ 새로운 기능:

1. 결제 관리 페이지 추가
   - /admin/payments 경로로 접속
   - 참가자별 결제 내역 관리
   - 일괄결제/개별결제 구분
   - 영수증 요청 관리
   - 결제 통계 표시

🐛 버그 수정:

2. 상태 변경 시 페이지 리로드 방지
   - 로컬 상태만 업데이트하여 스크롤 위치 유지
   - 서버 업데이트 실패 시 원래 상태로 복구

💡 UX 개선:

3. 일괄결제 동반자 정보 개선
   - 일괄결제 선택 시 안내 메시지 표시
   - 💳 아이콘과 함께 결제 안내 제공
   - 총 인원수와 청구 정보 명시

🔗 연동:

4. 데이터베이스 연동
   - singsing_payments 테이블과 연동
   - 그룹 결제 시 각 멤버별 결제 레코드 생성
   - 참가자 정보와 결제 정보 연결"

# 푸시
echo ""
echo "🚀 Push 중..."
git push

echo "✅ 완료!"
