# SMS 시스템 배포 노트

## 변경 사항
- 모든 SMS 발송 API가 통합 서비스 사용
- URL 변환 로직 제거 (/portal/은 포털, /s/는 개별 문서 그대로 유지)
- 견적서 발송 Basic Auth → HMAC-SHA256 변경
- 고객 관리 SMS API 추가

## Vercel 환경 변수 필수
```
SOLAPI_API_KEY
SOLAPI_API_SECRET
SOLAPI_PFID
SOLAPI_SENDER
```

## API 엔드포인트
- `/api/messages/send-document` - 문서 발송
- `/api/messages/send-quote` - 견적서 발송
- `/api/messages/send-payment` - 결제 안내
- `/api/messages/send-customer` - 고객 관리

## 문제 발생 시
1. Vercel Function 로그 확인
2. 환경 변수 설정 확인
3. 전화번호 형식 확인 (010-xxxx-xxxx)