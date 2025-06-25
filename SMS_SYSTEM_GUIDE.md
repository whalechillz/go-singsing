# 통합 SMS 시스템 가이드

## 🎯 개요
모든 SMS 발송이 통합된 서비스를 통해 동일한 방식으로 작동합니다.

## 📁 파일 구조
```
lib/services/
├── smsService.ts        # 핵심 SMS 발송 서비스
└── messageTemplates.ts   # 메시지 템플릿 관리

app/api/messages/
├── send-document/        # 문서 발송 (포털, 개별 문서)
├── send-quote/          # 견적서 발송
├── send-payment/        # 결제 안내 발송
└── send-customer/       # 고객 관리 발송
```

## 🔧 주요 기능

### 1. SMS 서비스 (smsService.ts)
- HMAC-SHA256 서명 방식 사용
- 자동 메시지 타입 결정 (SMS/LMS/카카오알림톡)
- 전화번호 정규화
- 템플릿 변수 치환
- 비용 계산
- 로그 저장

### 2. 메시지 템플릿 (messageTemplates.ts)
- 문서 타입별 기본 템플릿 제공
- SMS/카카오알림톡 별도 템플릿
- 변수 치환 지원: #{이름}, #{url} 등

## 📝 URL 체계
- `/portal/[url]` - 고객 포털 (통합 문서)
- `/s/[url]` - 개별 문서
- `/q/[url]` - 견적서 (개별 문서의 특별한 형태)

## 🚀 사용 예제

### 1. 포털 문서 발송
```javascript
// POST /api/messages/send-document
{
  "tourId": "tour-123",
  "participantIds": ["p1", "p2"],
  "sendMethod": "sms",
  "documentUrl": "https://go.singsinggolf.kr/portal/abc123"
}
```

### 2. 견적서 발송
```javascript
// POST /api/messages/send-quote
{
  "quoteId": "quote-456",
  "customerPhone": "010-1234-5678",
  "customerName": "홍길동",
  "sendMethod": "kakao"
}
```

### 3. 결제 안내 발송
```javascript
// POST /api/messages/send-payment
{
  "tourId": "tour-123",
  "participantIds": ["p1", "p2"],
  "messageType": "deposit_request",
  "sendMethod": "sms"
}
```

### 4. 고객 안내 발송
```javascript
// POST /api/messages/send-customer
{
  "customerIds": ["c1", "c2"],
  "sendType": "BIRTHDAY",
  "sendMethod": "kakao",
  "templateData": {
    "birthdayBenefit": "20% 할인쿠폰"
  }
}
```

## ⚙️ 환경 변수
```env
SOLAPI_API_KEY=your_api_key
SOLAPI_API_SECRET=your_api_secret
SOLAPI_PFID=your_pfid
SOLAPI_SENDER=0312153990
```

## ✅ 체크리스트
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 연결 확인
- [ ] 전화번호 형식 확인 (010-xxxx-xxxx)
- [ ] 템플릿 변수 확인
- [ ] URL 형식 확인 (/portal/ vs /s/)

## 🐛 문제 해결
1. **환경 변수 오류**: .env.local 파일 확인
2. **발송 실패**: 전화번호 형식, API 키 확인
3. **템플릿 오류**: 변수명 오타 확인 (#{이름} 등)
4. **URL 오류**: 포털은 /portal/, 개별 문서는 /s/

## 📞 지원
문의: 031-215-3990