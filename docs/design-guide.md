# 싱싱골프투어 디자인 가이드

## 🎨 디자인 시스템 개요

싱싱골프투어는 60대 이상 여성을 주요 타겟으로 하는 프리미엄 골프 투어 서비스입니다.
편안하고 신뢰감 있는 디자인으로 사용자 경험을 최적화했습니다.

## 📂 디자인 파일 구조

```
go2.singsinggolf.kr/
├── styles/                    # 디자인 시스템 파일
│   ├── colors.tsx            # 색상 팔레트 정의
│   └── fonts.tsx             # 폰트 시스템 정의
├── tailwind.config.js        # Tailwind 설정 (색상 통합)
└── app/globals.css           # 전역 CSS (HSL 변수)
```

## 🎨 색상 시스템

### 브랜드 색상
- **메인 네이비** (`#34699C` / `singsing-brand`): 신뢰와 고급스러움
- **골드 포인트** (`#FFC107` / `singsing-accent`): VIP 느낌, 주목도
- **서브 블루** (`#66B3E3` / `singsing-secondary`): 편안함과 모던함
- **자연 그린** (`#7BC4A2` / `singsing-nature`): 힐링과 자연

### 사용 예시
```jsx
// Tailwind 클래스로 사용
<div className="bg-singsing-brand text-white">메인 네비게이션</div>
<button className="bg-singsing-accent hover:bg-yellow-500">예약하기</button>

// JavaScript에서 사용
import { colors } from '@/styles/colors';
const brandColor = colors.brand; // #34699C
```

## 🔤 폰트 시스템

### 메인 폰트
- **한글**: Noto Sans KR (부드럽고 가독성 높음)
- **영문**: Noto Sans (심플하고 깔끔함)

### 폰트 크기 (60대 이상 가독성 고려)
```jsx
import { fontSize } from '@/styles/fonts';

// 제목
<h1 className={fontSize.h1}>큰 제목 (32px/40px)</h1>
<h2 className={fontSize.h2}>중간 제목 (24px/32px)</h2>

// 본문
<p className={fontSize.body}>일반 본문 (16px/18px)</p>
<small className={fontSize.small}>작은 텍스트 (14px/16px)</small>
```

## 🎯 컴포넌트별 색상 가이드

### 1. 네비게이션/사이드바
- 배경: `bg-blue-800` (Dashboard 기준)
- 텍스트: `text-white`
- 호버: `hover:bg-blue-700`
- 활성: `bg-blue-900`

### 2. 버튼
```jsx
// 주요 액션 버튼
<button className="bg-singsing-brand text-white hover:bg-blue-700">
  저장하기
</button>

// 보조 버튼
<button className="bg-gray-100 text-gray-700 hover:bg-gray-200">
  취소
</button>

// 강조 버튼 (예약, 결제 등)
<button className="bg-singsing-accent text-gray-900 hover:bg-yellow-500">
  예약하기
</button>
```

### 3. 카드/패널
- 배경: `bg-white`
- 테두리: `border border-gray-200`
- 그림자: `shadow-sm` 또는 `shadow`
- 호버: `hover:shadow-md`

### 4. 상태 표시
- 성공/완료: `bg-green-100 text-green-800`
- 경고/주의: `bg-yellow-100 text-yellow-800`
- 에러/마감: `bg-red-100 text-red-800`
- 정보: `bg-blue-100 text-blue-800`

## 📱 반응형 디자인

### 브레이크포인트
- 모바일: < 768px
- 태블릿: 768px - 1024px
- 데스크톱: > 1024px

### 폰트 크기 반응형
```jsx
// 모바일에서는 작게, 데스크톱에서는 크게
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  반응형 제목
</h1>

<p className="text-base md:text-lg">
  반응형 본문
</p>
```

## 🔄 기존 시스템과의 호환성

### shadcn/ui 컴포넌트 사용 시
- 기존 HSL 변수 시스템 유지
- 싱싱골프 색상은 추가 클래스로 오버라이드

```jsx
// shadcn/ui Button에 싱싱골프 색상 적용
<Button className="bg-singsing-brand hover:bg-blue-700">
  커스텀 버튼
</Button>
```

### CSS 변수 커스터마이징 (선택사항)
```css
/* globals.css에 추가 가능 */
:root {
  --singsing-brand: 216 51% 41%; /* #34699C의 HSL 값 */
  --singsing-accent: 45 100% 53%; /* #FFC107의 HSL 값 */
}
```

## 🎯 접근성 고려사항

### 1. 색상 대비
- 배경과 텍스트 간 충분한 대비 유지
- WCAG AA 기준 준수 (4.5:1 이상)

### 2. 폰트 크기
- 최소 14px 이상 사용
- 중요 정보는 16px 이상 권장

### 3. 클릭 영역
- 버튼/링크 최소 44x44px 터치 영역 확보
- 모바일에서 충분한 여백 제공

## 📋 체크리스트

신규 컴포넌트 개발 시:
- [ ] 싱싱골프 색상 팔레트 사용
- [ ] Noto Sans KR 폰트 적용
- [ ] 60대 이상 가독성 고려 (폰트 크기, 대비)
- [ ] 반응형 디자인 적용
- [ ] 접근성 기준 준수
