#!/bin/bash

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Git 상태 확인
echo "📋 변경사항:"
git status --short
echo ""

# 변경사항 추가
git add .

# 커밋
git commit -m "design: 관리자 페이지 UI/UX 전면 개선

🎨 주요 개선사항:

1. 색상 체계 통일
   - 파란색, 흰색, 회색 계열로 통일
   - Primary Action은 파란색, Secondary는 흰색+테두리
   - 과도한 색상 사용 제거

2. 버튼 디자인 일관성
   - 템플릿/다운로드/업로드: 흰색 배경 + 회색 테두리
   - 참가자 추가: 파란색 (Primary Action)
   - 일괄 작업: 텍스트 버튼으로 간소화

3. 탭 디자인 개선
   - 깔끔한 하단 테두리 스타일
   - 활성 탭에 파란색 밑줄
   - 숫자를 작게 표시하여 가독성 향상

4. 상태 변경 UX 개선
   - 드롭다운으로 즉시 상태 변경
   - 페이지 스크롤 위치 유지
   - 단순한 색상 전환 애니메이션

5. 테이블 디자인 정리
   - 과도한 색상 배지 제거
   - 아이콘 크기 축소 (w-4 h-4)
   - 넓은 화면 지원 개선

6. 통계 카드 개선
   - 카드 형식의 깔끔한 레이아웃
   - 큰 숫자로 시각적 강조"

# 푸시
echo ""
echo "🚀 Push 중..."
git push

echo "✅ 완료!"
