# 🔔 싱싱골프 카카오 알림톡 템플릿 가이드

> 솔라피(Solapi)를 통한 카카오 알림톡 템플릿 등록 및 관리 방법

---

## 📌 빠른 참조

### 시스템 정보
- **플랫폼:** 솔라피(Solapi)
- **카카오 채널:** 싱싱골프
- **PFID:** `KA01PF250616100116116JGCMFKunkh`
- **템플릿 심사:** 1-2일

### 현재 템플릿 상태
| 템플릿명 | ID | 상태 | 등록일 |
|---------|----|----|-------|
| 투어 문서 안내 | KA01TP250620031346737xziXAto9wWT | ✅ 승인 | 2025-06-20 |
| 투어 통합 안내 | PJ61d18ECq | ⏳ 심사중 | 2025-06-20 |

---

## 📋 템플릿 등록 체크리스트

### 준비사항
- [ ] 솔라피 계정 로그인
- [ ] 카카오 채널 연동 확인
- [ ] 템플릿 용도 결정

### 이미지 제작
- [ ] Figma 800×400px 프레임
- [ ] 배경색 #4B5BFF
- [ ] 아이콘 선택 (Iconify)
- [ ] 텍스트 추가
- [ ] PNG Export

### 템플릿 등록
- [ ] 템플릿명 입력
- [ ] 버튼형 선택
- [ ] 템플릿 내용 입력
- [ ] 버튼 설정
- [ ] 변수 등록
- [ ] 이미지 업로드
- [ ] 심사 신청

### 코드 연동
- [ ] 템플릿 ID 기록
- [ ] 코드에 ID 입력
- [ ] 배포 및 테스트

---

## 📝 템플릿 내용

```
[싱싱골프] #{투어명} 문서 안내

안녕하세요 #{이름}님,
#{투어명} 관련 문서를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990
```

### 변수 설명
- `#{이름}` - 참가자 이름
- `#{투어명}` - 투어 제목  
- `#{url}` - 문서 단축코드

---

## 🎨 이미지 제작 가이드

### 규격
- **크기:** 800×400px (2:1 비율)
- **형식:** PNG, JPG
- **용량:** 최대 500KB
- **배경색:** #4B5BFF
- **텍스트색:** #FFFFFF

### Figma 작업 순서
1. 800×400px 프레임 생성
2. 배경색 #4B5BFF 설정
3. Iconify 플러그인 사용
   - 문서: "document" 검색
   - 포털: "layout" 검색
4. 아이콘 흰색으로 변경
5. 텍스트 추가 (Pretendard)
6. PNG로 Export

---

## 🔘 버튼 설정

### 투어 문서 안내
- **버튼명:** 📄 문서 확인하기
- **링크:** `https://go.singsinggolf.kr/s/#{url}`

### 투어 통합 안내  
- **버튼명:** 📊 통합 문서 보기
- **링크:** `https://go.singsinggolf.kr/portal/#{url}`

### 공통 설정
- **버튼 종류:** 웹링크(WL)
- **외부 브라우저:** ✅ 체크

---

## 💻 코드 연동

### 환경 변수 (Vercel)
```
SOLAPI_API_KEY=your_api_key
SOLAPI_API_SECRET=your_api_secret
SOLAPI_PFID=KA01PF250616100116116JGCMFKunkh
```

### 백엔드 코드
```typescript
// /app/api/messages/send-document/route.ts

const TEMPLATE_ID = "템플릿_ID_입력";

if (sendMethod === "kakao" && SOLAPI_PFID && TEMPLATE_ID) {
    message.type = "ATA";
    message.kakaoOptions = {
        pfId: SOLAPI_PFID,
        templateId: TEMPLATE_ID,
        disableSms: false
    };
}
```

---

## ❓ 자주 묻는 질문

### Q: 템플릿 심사가 거부되었어요
- 변수명 확인
- 이미지 규격 확인
- 전화번호 형식 확인
- 광고성 문구 제거

### Q: 카카오 알림톡이 안 가요
- 템플릿 ID 확인
- 환경 변수 확인
- 템플릿 승인 상태 확인
- 콘솔 에러 확인

### Q: SMS로만 발송돼요
- sendMethod "kakao" 확인
- TEMPLATE_ID 값 확인
- 수신자 카톡 동의 확인

---

## 📞 문의
- **개발팀:** dev@singsinggolf.kr
- **고객센터:** 031-215-3990

*최종 업데이트: 2025년 6월 20일*