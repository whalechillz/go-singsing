# 긴급공지사항 및 메시지 발송 기능 구현 가이드

## 🚀 구현 완료 내용

### 1. 긴급공지사항 스와이프 기능
- **특별공지사항 관리 UI**: 투어 편집 페이지에 긴급공지 탭 추가
- **템플릿 시스템**: 자주 사용하는 공지사항 템플릿 제공
- **조건부 표시**: 체크인 시간 기준 표시 제어
- **우선순위 관리**: 드래그&드롭으로 순서 변경

### 2. 메시지 발송 연동
- **SMS/카카오톡 발송 API**: `/api/tours/[tourId]/messages`
- **발송 이력 관리**: 모든 발송 내역 데이터베이스 저장
- **배치 발송**: 투어 참가자 전체 일괄 발송
- **실패 처리**: 카카오톡 실패시 SMS 대체 발송

### 3. 데이터베이스 구조
- `special_notices`: 투어별 긴급공지사항 JSONB 배열
- `message_history`: 메시지 발송 이력
- `message_templates`: 공지사항 템플릿
- `scheduled_messages`: 예약 발송 (향후 기능)

## 📋 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
# Supabase Service Key (Admin 권한)
SUPABASE_SERVICE_KEY=your_supabase_service_key

# 알리고 SMS API
ALIGO_USER_ID=your_aligo_user_id
ALIGO_API_KEY=your_aligo_api_key
ALIGO_SENDER=031-215-3990

# 카카오톡 알림톡 API (선택사항)
KAKAO_API_URL=https://api.kakaowork.com/v1/messages.send
KAKAO_SENDER_KEY=your_kakao_sender_key
KAKAO_TEMPLATE_CODE=your_template_code
```

## 🛠️ 설치 및 실행

### 1. 데이터베이스 마이그레이션
```bash
# 메시지 이력 테이블 생성
psql -h your_host -U your_user -d your_db < supabase/migrations/20250619_create_message_history.sql
```

### 2. 기존 투어 데이터 업데이트
```sql
-- 기존 투어에 빈 special_notices 배열 추가
UPDATE singsing_tours 
SET special_notices = '[]'::jsonb
WHERE special_notices IS NULL;
```

## 📱 사용 방법

### 관리자 UI에서 공지사항 관리

1. **투어 편집 페이지 접속**
   - 투어 목록 → 투어 선택 → 편집 버튼

2. **긴급공지 탭 클릭**
   - 공지 추가 버튼으로 새 공지 생성
   - 템플릿 버튼으로 미리 만들어진 템플릿 사용

3. **공지사항 편집**
   - 타입 선택: 일반, 날씨, 체크인, 중요
   - 내용 입력
   - 조건부 표시 설정 (선택사항)

4. **메시지 발송**
   - 각 공지사항의 "메시지 발송" 버튼 클릭
   - 전체 참가자에게 SMS 발송

### 고객 포털에서 표시

- 스와이프로 여러 공지사항 확인
- 5초마다 자동 전환
- 우선순위에 따른 표시 순서

## 🔧 커스터마이징

### 새로운 템플릿 추가
```javascript
// SpecialNoticesManager.tsx
const noticeTemplates: Template[] = [
  // ... 기존 템플릿
  {
    id: '7',
    name: '새로운 템플릿',
    category: '카테고리',
    type: 'general',
    content: '템플릿 내용',
    variables: ['변수1', '변수2']
  }
];
```

### 메시지 발송 타입 변경
```javascript
// 기본 SMS를 카카오톡으로 변경
messageType: 'kakao' // 또는 'both'
```

## 🚨 주의사항

1. **SMS 발송 비용**: 건당 과금이므로 발송 전 확인 필수
2. **개인정보 보호**: 메시지 내용에 개인정보 포함 주의
3. **발송 한도**: SMS API 일일 발송 한도 확인
4. **카카오톡 템플릿**: 사전 승인된 템플릿만 사용 가능

## 📊 발송 이력 확인

```sql
-- 투어별 발송 이력
SELECT * FROM message_history 
WHERE tour_id = 'your_tour_id'
ORDER BY sent_at DESC;

-- 실패한 메시지만 조회
SELECT * FROM message_history 
WHERE status = 'failed'
ORDER BY sent_at DESC;
```

## 🔄 향후 개선사항

1. **예약 발송**: 특정 시간에 자동 발송
2. **개인별 발송**: 특정 참가자만 선택 발송
3. **발송 통계**: 대시보드에서 발송 현황 확인
4. **웹푸시 알림**: 앱 설치 없이 브라우저 알림
