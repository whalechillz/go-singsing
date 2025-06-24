# 📱 카카오 알림톡 설정 가이드

## 📊 현재 상태
- **플랫폼:** 솔라피(Solapi)
- **카카오 채널:** 싱싱골프
- **PFID:** KA01PF250616100116116JGCMFKunkh
- **템플릿:** 10개 문서별 템플릿 준비 중

## 🎯 카카오 알림톡 장점
- **비용 절감**: SMS(20원) → 카카오 알림톡(9원)
- **높은 도달률**: 카카오톡 알림으로 확인률 증가
- **브랜드 이미지**: 공식 채널로 신뢰도 향상
- **버튼 링크**: 원터치로 문서 접근 가능

## 📋 템플릿 목록 (10개)

### 고객용 템플릿 (6개)
1. **종합 여정 안내** - 모든 문서 통합 포털
2. **일정표 안내** - 고객용 일정표
3. **탑승 안내** - 버스 탑승 정보
4. **객실 배정** - 숙소 안내
5. **티타임표 안내** - 골프 티타임
6. **간편일정 안내** - 요약 일정

### 스탭용 템플릿 (4개)
1. **스탭용 일정표** - 업무 일정
2. **스탭용 탑승안내** - 스탭 탑승 정보
3. **스탭용 객실배정** - 스탭 숙소
4. **스탭용 티타임표** - 운영 시간

## 🚀 활성화 방법

### 1단계: 솔라피 템플릿 등록
1. [솔라피 콘솔](https://console.solapi.com) 접속
2. 카카오 채널 → 템플릿 관리 → 알림톡 템플릿 생성
3. 템플릿 정보 입력:
   ```
   템플릿명: [문서명] 안내
   템플릿 내용:
   [싱싱골프] #{투어명} [문서명] 안내

   안녕하세요 #{이름}님,
   #{투어명} [문서명]을/를 안내드립니다.

   궁금하신 점은 언제든 문의주세요.
   ☎ 031-215-3990
   ```
4. 버튼 추가 (웹링크):
   - 버튼명: 📄 문서 확인하기
   - 링크: https://go.singsinggolf.kr/s/#{url}
5. 이미지 업로드 (800×400px)

### 2단계: 코드 수정
```typescript
// /app/api/messages/send-document/route.ts

// 템플릿 ID 매핑
const TEMPLATE_IDS = {
  'portal': 'KA01TP...', // 종합 여정 안내
  'schedule': 'KA01TP...', // 일정표 안내
  'boarding': 'KA01TP...', // 탑승 안내
  // ... 기타 템플릿
};

// 카카오 알림톡 활성화
if (sendMethod === "kakao" && SOLAPI_PFID && templateId) {
  message.type = "ATA";
  message.kakaoOptions = {
    pfId: SOLAPI_PFID,
    templateId: templateId,
    disableSms: false // 실패 시 SMS 대체
  };
}
```

### 3단계: 환경 변수 확인
```env
SOLAPI_API_KEY=your_api_key
SOLAPI_API_SECRET=your_api_secret
SOLAPI_PFID=KA01PF250616100116116JGCMFKunkh
```

## 🎨 이미지 제작 가이드
- **크기:** 800×400px
- **배경:** #F9F9F9
- **아이콘:** 180×180px, #4B5BFF
- **텍스트:** 54pt Bold, #333333
- **도구:** Figma + Iconify 플러그인

## ⚠️ 주의사항
- 템플릿 심사 기간: 1-2일
- 변수명 정확히 입력 (#{이름}, #{투어명}, #{url})
- 이미지 용량 500KB 이하
- 광고성 문구 금지
- 템플릿 외 내용 발송 불가

## 📈 예상 효과
- **비용 절감:** 월 10,000건 기준 약 11만원 절감
- **도달률 향상:** SMS 90% → 카카오톡 98%
- **응답률 증가:** 버튼 클릭으로 즉시 접근

## 🔗 관련 문서
- [상세 가이드](/public/kakao-alimtalk-guide/index.html)
- [템플릿 목록](/public/kakao-alimtalk-guide/template-list.md)
- [이미지 제작 가이드](/public/kakao-alimtalk-guide/image-guide.md)

## 📞 문의
- 개발팀: dev@singsinggolf.kr
- 고객센터: 031-215-3990