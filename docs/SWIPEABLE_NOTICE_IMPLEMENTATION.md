# 긴급공지사항 스와이프 기능 구현

## 개요
싱싱골프 투어 포털 페이지에 여러 개의 긴급공지사항을 스와이프로 넘겨볼 수 있는 기능을 구현했습니다.

## 주요 기능

### 1. 데이터베이스 구조
- `singsing_tours` 테이블에 `special_notices` JSONB 컬럼 추가
- 각 공지사항은 다음과 같은 구조를 가집니다:
```json
{
  "id": "고유ID",
  "content": "공지사항 내용",
  "priority": 1, // 우선순위 (낮을수록 먼저 표시)
  "type": "general", // general, weather, checkin, important
  "created_at": "2025-06-19T10:00:00Z",
  "showConditions": { // 선택사항
    "hoursBeforeCheckin": 24 // 체크인 N시간 전부터 표시
  }
}
```

### 2. 스와이프 기능
- **터치 스와이프**: 모바일에서 좌우로 스와이프하여 공지사항 전환
- **버튼 네비게이션**: 좌우 화살표 버튼으로 이동
- **자동 재생**: 5초마다 자동으로 다음 공지사항으로 전환
- **인디케이터**: 하단에 현재 위치를 표시하는 점 표시

### 3. 공지사항 타입별 아이콘
- `general` (일반): ℹ️ 정보 아이콘 (빨간색)
- `weather` (날씨): ☁️ 구름 아이콘 (파란색)
- `checkin` (체크인): 🕐 시계 아이콘 (초록색)
- `important` (중요): ⚠️ 경고 아이콘 (주황색)

## 사용 방법

### 1. 데이터베이스에 공지사항 추가
```sql
UPDATE singsing_tours 
SET special_notices = '[
  {
    "id": "1",
    "content": "☔ 우천시 환불 규정 안내\\n• 1홀까지: 전액-기본요금",
    "priority": 1,
    "type": "weather"
  },
  {
    "id": "2",
    "content": "🔑 룸키 수령 안내\\n• 프론트에서 성함 말씀해주세요",
    "priority": 2,
    "type": "checkin"
  }
]'::jsonb
WHERE id = '투어ID';
```

### 2. 조건부 표시 설정
체크인 24시간 전부터만 표시되는 공지:
```json
{
  "id": "3",
  "content": "체크인 임박 안내",
  "priority": 1,
  "type": "checkin",
  "showConditions": {
    "hoursBeforeCheckin": 24
  }
}
```

## 파일 구조
- `/components/portal/SwipeableNotice.tsx` - 스와이프 가능한 공지사항 컴포넌트
- `/components/CustomerTourPortal.tsx` - 수정된 포털 메인 컴포넌트
- `/scripts/add-sample-notices.sql` - 샘플 공지사항 추가 SQL

## 특징
- 모바일 친화적인 터치 인터페이스
- 자동 재생 기능 (사용자 상호작용 시 일시정지)
- 우선순위에 따른 자동 정렬
- 조건부 표시 기능
- 기존 `portalSettings.specialNotice`와의 하위 호환성 유지

## 추후 개선사항
- 관리자 패널에서 공지사항 편집 UI 추가
- 날씨 API 연동하여 날씨 조건부 표시
- 공지사항별 유효기간 설정
- 읽음 표시 기능
