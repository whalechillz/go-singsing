# 싱싱골프투어 브랜드 디자인 시스템

## 개요
싱싱골프투어의 일관된 브랜드 경험을 위한 디자인 시스템 가이드라인입니다.

## 색상 체계

### 기본 원칙
- **문서 타입별 구분**: 계약 문서는 진한 색상, 실행 문서는 밝은 색상
- **사용자별 최적화**: 60대 고객을 위한 명확한 대비와 가독성
- **플랫폼별 조정**: 인쇄, 웹, 모바일 각각에 최적화된 색상값

### 브랜드 색상

#### Primary Colors
| 색상명 | HEX | RGB | 용도 |
|--------|-----|-----|------|
| Dark Blue | #2c5282 | 44, 82, 130 | 계약 문서, 권위감 |
| Main Blue | #4a6fa5 | 74, 111, 165 | 실행 문서, 친근감 |
| Light Blue | #4299e1 | 66, 153, 225 | 강조 요소, 링크 |
| Lighter Blue | #e7f3ff | 231, 243, 255 | 배경색 |

#### 문서별 색상 매핑

**A그룹 (계약 단계)**
- 고객용 일정표
- 색상: #2c5282 (Dark Blue)
- 느낌: 권위있고 신뢰감 있는

**B그룹 (실행 단계)**
- 탑승안내서, 객실배정표, 티타임표
- 색상: #4a6fa5 (Main Blue)
- 느낌: 친근하고 실용적인

## 타이포그래피

### 폰트
- **주 폰트**: Noto Sans KR
- **대체 폰트**: Apple SD Gothic Neo, Malgun Gothic

### 크기 체계
```
3xl: 28px - 브랜드명 (A그룹)
2xl: 24px - 브랜드명 (B그룹)
xl:  20px - 문서 제목
lg:  18px - 섹션 제목
base: 16px - 본문 (60대 고객용)
sm:  14px - 보조 텍스트
xs:  12px - 캡션
```

## 사용 가이드

### 1. TypeScript에서 사용
```typescript
import { BRAND_COLORS, DOCUMENT_COLOR_SCHEME } from '@/design-system/brand-colors';

// 계약 문서 헤더
const contractHeader = {
  backgroundColor: DOCUMENT_COLOR_SCHEME.contractual.header,
  color: DOCUMENT_COLOR_SCHEME.contractual.text,
};
```

### 2. CSS에서 사용
```css
@import '/design-system/brand-colors.css';

.header-contract {
  background-color: var(--singsing-primary-dark);
  color: white;
}
```

### 3. Tailwind CSS 설정
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'singsing': {
          'dark': '#2c5282',
          'main': '#4a6fa5',
          'light': '#4299e1',
          'lighter': '#e7f3ff',
        }
      }
    }
  }
}
```

## 컴포넌트별 적용

### 헤더 컴포넌트
```tsx
// A그룹 (계약 문서)
<header className="bg-singsing-dark text-white p-5 text-center">
  <h1 className="text-3xl font-bold">싱싱골프투어</h1>
</header>

// B그룹 (실행 문서)
<header className="bg-singsing-main text-white p-5 text-center rounded-t-lg">
  <h1 className="text-2xl font-bold">싱싱골프투어</h1>
</header>
```

## 접근성 고려사항

### 60대 고객을 위한 설계
1. **색상 대비**: WCAG AA 기준 충족 (4.5:1 이상)
2. **글자 크기**: 본문 16px 이상
3. **여백**: 충분한 터치 영역 확보
4. **단순성**: 과도한 색상 사용 자제

### 체크리스트
- [ ] 흰 배경에 #2c5282 텍스트: 대비율 7.2:1 ✓
- [ ] 본문 폰트 16px 이상 ✓
- [ ] 버튼 최소 높이 44px ✓
- [ ] 중요 정보만 색상 강조 ✓

## 파일 구조
```
/design-system
  ├── brand-colors.ts      # TypeScript 색상 정의
  ├── brand-colors.css     # CSS 변수 정의
  ├── README.md           # 이 문서
  └── examples/           # 사용 예시
      ├── header-samples.tsx
      └── document-templates.html
```

## 버전 관리
- **현재 버전**: 1.0.0
- **최종 수정**: 2025-01-09
- **작성자**: MASLABS

## 문의
디자인 시스템 관련 문의는 다음으로 연락주세요:
- 이메일: design@singsinggolf.kr
- 전화: 031-215-3990
