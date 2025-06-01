# 성별 표시 기능 가이드

## 개요
골프 투어 참가자 명단에서 팀 구성을 명확히 표시하기 위한 성별 표시 기능입니다.

## 기능 설명

### 1. 팀 타입 자동 분류
- **혼성팀**: 남성과 여성이 모두 포함된 팀
- **남성팀**: 남성만으로 구성된 팀  
- **여성팀**: 여성만으로 구성된 팀

### 2. 표시 규칙
```
파인힐스 CC - 파인 코스 (혼성팀)
1. 김철수
2. 이영희(여)  ← 소수 성별만 표시
3. 박민수
4. 최준호
```

### 3. 구현 위치
- **컴포넌트**: `/components/TeeTimeAssignmentManagerV2.tsx`
- **미리보기 생성**: `generatePreviewHTML()` 함수

## 사용 방법

### 1. 참가자 등록 시 성별 입력
```javascript
// 참가자 등록 예시
const participant = {
  name: "홍길동",
  phone: "010-1234-5678",
  team_name: "A팀",
  gender: "M"  // M: 남성, F: 여성
};
```

### 2. 엑셀 업로드
엑셀 파일 형식:
| 이름 | 연락처 | 팀명 | 성별 |
|------|--------|------|------|
| 홍길동 | 010-1234-5678 | A팀 | 남 |
| 김영희 | 010-2345-6789 | A팀 | 여 |

### 3. 문서 출력
- **고객용**: 팀 타입만 표시 (개인정보 보호)
- **스탭용**: 상세 정보 포함

## 코드 예시

### 팀 성별 분석
```typescript
const analyzeTeamGender = (teamParticipants: Participant[]) => {
  const maleCount = teamParticipants.filter(p => p.gender === 'M').length;
  const femaleCount = teamParticipants.filter(p => p.gender === 'F').length;
  
  if (maleCount > 0 && femaleCount > 0) {
    return { type: '(혼성팀)', showIndividual: false };
  } else if (maleCount > 0) {
    return { type: '(남성팀)', showIndividual: false };
  } else if (femaleCount > 0) {
    return { type: '(여성팀)', showIndividual: false };
  }
  
  return { type: '', showIndividual: false };
};
```

### 개별 성별 표시
```typescript
const getGenderSuffix = (participant: Participant, teamParticipants: Participant[]) => {
  if (!participant.gender) return '';
  
  const maleCount = teamParticipants.filter(p => p.gender === 'M').length;
  const femaleCount = teamParticipants.filter(p => p.gender === 'F').length;
  
  // 혼성팀에서 소수 성별만 표시
  if (maleCount > 0 && femaleCount > 0) {
    if (maleCount < femaleCount && participant.gender === 'M') {
      return '(남)';
    } else if (femaleCount < maleCount && participant.gender === 'F') {
      return '(여)';
    }
  }
  
  return '';
};
```

## 색상 설정

### Tailwind CSS 설정
```javascript
// tailwind.config.js
safelist: [
  // 코스별 색상
  'bg-green-50', 'border-green-300', 'bg-green-100', 'text-green-800',
  'bg-blue-50', 'border-blue-300', 'bg-blue-100', 'text-blue-800',
  // ... 기타 색상
]
```

### 코스별 색상 매핑
- 파인: 초록색
- 레이크: 파란색
- 밸리: 황색
- 오션: 하늘색
- 힐: 보라색
- 크릭: 분홍색

## 주의사항

1. **개인정보 보호**: 고객용 문서에는 최소한의 정보만 표시
2. **데이터 정확성**: 성별 정보는 참가자 등록 시 정확히 입력
3. **유연한 처리**: 성별 정보가 없는 경우도 정상 처리

## 문제 해결

### 색상이 적용되지 않는 경우
1. 브라우저 캐시 삭제
2. `npm run build` 실행
3. Tailwind CSS 빌드 확인

### 성별 표시가 안 되는 경우
1. DB의 gender 필드 확인
2. 참가자 데이터 조회 쿼리 확인
3. 컴포넌트의 성별 표시 로직 확인
