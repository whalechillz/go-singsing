# 싱싱골프 알림톡 → SMS 마이그레이션 현황

## 📅 2025년 6월 20일 작업 내역

### 🔄 전환 배경
- **기존:** 알리고(Aligo) 사용
- **현재:** 솔라피(Solapi)로 전환
- **이유:** 시스템 통합 및 관리 효율성

### 📊 현재 상태

#### ✅ 완료된 작업
1. **SMS 발송 기능**
   - 솔라피를 통한 SMS 발송 정상 작동
   - 문서 발송 시 SMS로 발송 가능

2. **카카오 채널 연동**
   - 싱싱골프 카카오 채널 연동 완료
   - PFID: KA01PF250616100116116JGCMFKunkh

3. **템플릿 등록**
   - 투어 문서 안내 템플릿 등록 완료
   - 투어 통합 안내 템플릿 심사 중

#### 🚧 진행 중인 작업
1. **템플릿 심사**
   - 투어 통합 안내 템플릿 심사 대기 중
   - 예상 완료: 1-2일 내

2. **코드 통합**
   - 템플릿 ID 연동 대기
   - 문서 타입별 템플릿 분기 처리 예정

### 💻 코드 수정 사항

#### 환경 변수 (Vercel)
```env
SOLAPI_API_KEY=설정완료
SOLAPI_API_SECRET=설정완료  
SOLAPI_PFID=KA01PF250616100116116JGCMFKunkh
```

#### 백엔드 코드
```typescript
// /app/api/messages/send-document/route.ts

// 카카오 알림톡 사용 시
const TEMPLATE_ID = ""; // 템플릿 승인 후 입력 예정

if (sendMethod === "kakao" && SOLAPI_PFID && TEMPLATE_ID) {
    // 카카오 알림톡 발송
    message.type = "ATA";
    message.kakaoOptions = {
        pfId: SOLAPI_PFID,
        templateId: TEMPLATE_ID,
        disableSms: false
    };
} else {
    // SMS 발송
    message.type = messageText.length > 90 ? "LMS" : "SMS";
}
```

### 📋 체크리스트

- [x] 솔라피 계정 설정
- [x] API 키 발급 및 환경 변수 설정
- [x] 카카오 채널 연동
- [x] SMS 발송 테스트
- [x] 템플릿 디자인 (800×400px)
- [x] 템플릿 등록 (투어 문서 안내)
- [ ] 템플릿 등록 (투어 통합 안내) - 심사 중
- [ ] 템플릿 ID 코드 적용
- [ ] 카카오 알림톡 발송 테스트
- [ ] 전체 시스템 통합 테스트

### 🔍 주요 변경사항

1. **발송 방식**
   - 기본값: SMS (안정성 우선)
   - 옵션: 카카오 알림톡 (템플릿 승인 후)

2. **URL 형식**
   - 개별 문서: `https://go.singsinggolf.kr/s/{단축코드}`
   - 통합 포털: `https://go.singsinggolf.kr/portal/{단축코드}`

3. **메시지 형식**
   ```
   [싱싱골프] {투어명} 문서 안내
   
   안녕하세요 {이름}님,
   {투어명} 관련 문서를 안내드립니다.
   
   궁금하신 점은 언제든 문의주세요.
   ☎ 031-215-3990
   
   [버튼: 문서 확인하기 / 통합 문서 보기]
   ```

### 📞 문의사항
- 개발팀: dev@singsinggolf.kr
- 카카오 채널 관리: marketing@singsinggolf.kr