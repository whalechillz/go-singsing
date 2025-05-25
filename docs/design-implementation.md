# 싱싱골프투어 디자인 시스템 적용 가이드

## 🎯 즉시 적용 가능한 개선사항

### 1. 버튼 색상 통일
현재 대부분 버튼이 `bg-blue-600`을 사용 중입니다. 싱싱골프 브랜드 색상으로 변경:

```jsx
// 변경 전
<button className="bg-blue-600 text-white hover:bg-blue-700">

// 변경 후 (브랜드 색상 적용)
<button className="bg-singsing-brand text-white hover:bg-blue-700">

// 강조 버튼 (예약, 결제 등)
<button className="bg-singsing-accent text-gray-900 hover:bg-yellow-500">
```

### 2. 상태 색상 개선
```jsx
// 성공/완료 (자연 그린 활용)
<span className="bg-green-100 text-green-800">
→ <span className="bg-green-50 text-singsing-nature font-medium">

// 경고/주의 (골드 활용)  
<span className="bg-yellow-100 text-yellow-800">
→ <span className="bg-yellow-50 text-yellow-700 font-medium">
```

### 3. 헤더/제목 폰트 크기
60대 이상 가독성을 위해 제목 크기 증가:

```jsx
// 페이지 제목
<h1 className="text-2xl font-bold">
→ <h1 className="text-3xl md:text-4xl font-bold text-singsing-text">

// 섹션 제목
<h2 className="font-bold text-gray-900">
→ <h2 className="text-xl md:text-2xl font-bold text-singsing-text">
```

### 4. 카드/패널 그림자 강화
시각적 구분을 명확하게:

```jsx
// 변경 전
<div className="bg-white rounded-lg shadow">

// 변경 후
<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
```

## 📋 컴포넌트별 적용 체크리스트

### ParticipantsManager.tsx
- [ ] 추가 버튼을 `bg-singsing-brand`로 변경
- [ ] 엑셀 업로드 버튼 유지 (이미 파란색)
- [ ] 테이블 헤더 폰트 크기 증가
- [ ] 참가자 이름 폰트 크기 증가

### RoomAssignmentManager.tsx  
- [ ] 객실 카드에 `hover:shadow-md` 추가
- [ ] 미배정 참가자 카드 배경색 개선
- [ ] 정원 초과 시 `text-red-600 font-bold` 강조

### TeeTimeManager.tsx
- [ ] 조 편성 카드에 그림자 추가
- [ ] 자동 배정 버튼 `bg-singsing-accent` 적용
- [ ] 코스명 폰트 크기 증가

### BoardingScheduleManager.tsx
- [ ] 탑승지 카드 hover 효과 추가
- [ ] 시간 입력 필드 크기 증가
- [ ] 안내문 폰트 크기 증가

### TourSchedulePreview.tsx
- [ ] 프린트 시 가독성을 위한 폰트 크기 조정
- [ ] 섹션 구분선 명확하게
- [ ] 중요 정보 강조 색상 적용

## 🚀 빌드 및 배포 스크립트

```bash
# 1. 캐시 삭제
rm -rf .next

# 2. 빌드 테스트
npm run build

# 3. 성공 시 커밋
git add -A
git commit -m "feat: 싱싱골프 디자인 시스템 전면 적용
- 브랜드 색상 팔레트 추가 (네이비/골드/그린)
- 60대 이상 가독성 최적화 (폰트 크기, 대비)
- 버튼, 카드, 상태 색상 통일
- 호버 효과 및 그림자 강화"

# 4. 푸시
git push origin main
```

## 📊 우선순위

### 즉시 적용 (Phase 1)
1. 대시보드 통계 카드 색상
2. 주요 액션 버튼 (저장, 추가, 생성)
3. 페이지 제목 폰트 크기

### 점진적 적용 (Phase 2)
1. 전체 컴포넌트 hover 효과
2. 폼 입력 필드 크기 최적화
3. 모바일 반응형 개선

### 장기 계획 (Phase 3)
1. 다크모드 지원 (선택사항)
2. 애니메이션 효과 추가
3. 접근성 (a11y) 완벽 지원

## 🔍 테스트 포인트

- [ ] 모바일에서 터치 영역 충분한지 확인
- [ ] 색상 대비 WCAG AA 기준 충족 확인
- [ ] 60대 사용자 테스트 그룹 피드백 반영
- [ ] 프린트 시 가독성 확인

## 💡 참고사항

- 기존 shadcn/ui 컴포넌트는 최대한 유지
- 싱싱골프 색상은 오버라이드 방식으로 적용
- 점진적 개선으로 안정성 확보
- 사용자 피드백 기반 지속적 개선
