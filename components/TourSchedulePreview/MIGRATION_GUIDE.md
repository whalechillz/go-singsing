# TourSchedulePreview 컴포넌트 리팩토링 가이드

## 개요
`TourSchedulePreview` 컴포넌트가 너무 커서(115KB) 유지보수가 어려워 모듈화된 구조로 리팩토링했습니다.

## 새로운 폴더 구조
```
components/
├── TourSchedulePreview/
│   ├── index.tsx                 // 메인 컴포넌트
│   ├── types.ts                  // TypeScript 타입 정의
│   ├── hooks/
│   │   ├── useTourData.ts       // 데이터 페칭 로직
│   │   └── useDocumentHTML.ts   // HTML 생성 로직
│   ├── documents/
│   │   ├── CustomerSchedule.tsx  // 고객 일정표
│   │   ├── BoardingGuide.tsx    // 탑승 안내
│   │   ├── RoomAssignment.tsx   // 객실 배정
│   │   ├── TeeTime.tsx          // 티타임표
│   │   └── SimplifiedSchedule.tsx // 간편 일정
│   ├── styles/
│   │   ├── common.module.css    // 공통 스타일
│   │   └── [문서별 스타일].module.css
│   └── utils/
│       └── formatters.ts        // 포맷팅 유틸리티
```

## 주요 변경사항

### 1. 파일 분리
- **데이터 로직**: `useTourData` 훅으로 분리
- **HTML 생성**: `useDocumentHTML` 훅으로 분리
- **각 문서 타입**: 개별 파일로 분리
- **스타일**: CSS 모듈로 분리
- **유틸리티**: 공통 함수들을 별도 파일로 분리

### 2. 장점
- **코드 가독성 향상**: 각 파일이 단일 책임 원칙을 따름
- **유지보수 용이**: 특정 문서만 수정하기 쉬움
- **재사용성**: 공통 로직과 스타일을 재사용 가능
- **파일 크기 감소**: 각 파일이 작아져 에디터 성능 향상
- **타입 안정성**: 명확한 타입 정의로 오류 감소

### 3. 마이그레이션 방법

#### Step 1: 남은 문서 컴포넌트 구현
다음 파일들을 생성해야 합니다:
- `documents/CustomerSchedule.tsx`
- `documents/BoardingGuide.tsx`
- `documents/RoomAssignment.tsx`
- `documents/TeeTime.tsx`

각 파일은 다음과 같은 구조를 가집니다:
```typescript
export function generate[DocumentType]HTML(
  tourData: TourData,
  additionalData?: any
): string {
  // HTML 생성 로직
  return `<!DOCTYPE html>...`;
}
```

#### Step 2: 스타일 모듈화
현재 인라인 스타일을 CSS 모듈로 변환:
```css
/* styles/schedule.module.css */
.daySchedule {
  margin-bottom: 25px;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
}
```

#### Step 3: Import 경로 업데이트
기존:
```typescript
import TourSchedulePreview from '@/components/TourSchedulePreview';
```

변경 후:
```typescript
import TourSchedulePreview from '@/components/TourSchedulePreview';
```
(경로는 동일하지만 이제 index.tsx를 가리킴)

## 다음 단계

1. **나머지 문서 컴포넌트 구현**
   - paste.txt의 내용을 참고하여 각 문서별 HTML 생성 함수 구현
   
2. **스타일 최적화**
   - 중복 스타일 제거
   - CSS 변수 활용
   - 반응형 개선

3. **성능 최적화**
   - React.memo 활용
   - 불필요한 리렌더링 방지
   - 큰 HTML 문자열 최적화

4. **테스트**
   - 각 문서 타입별 렌더링 확인
   - 인쇄 기능 테스트
   - 다운로드 기능 테스트

## 백업
기존 파일은 다음 위치에 백업되어 있습니다:
`/backup/TourSchedulePreview.tsx.backup`
