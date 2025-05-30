#!/bin/bash

# 현재 수정사항 배포
git add .
git commit -m "fix: 일괄결제 표시 개선 및 중복 제거

- 일괄결제 버튼은 실제 결제자에게만 표시
- 결제상태에 결제자 정보 추가 (본인이 아닌 경우)
- 사용하지 않는 파일들 정리"
git push origin main

echo "✅ 배포 완료!"
echo "🔗 https://go2.singsinggolf.kr/admin/participants"
