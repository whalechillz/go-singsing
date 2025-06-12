# 카카오톡 공유 기능 설정 가이드

## 1. 카카오 개발자 앱 등록

1. [카카오 개발자 사이트](https://developers.kakao.com) 접속
2. 애플리케이션 추가하기
3. 앱 설정 > 플랫폼 > Web 사이트 도메인 추가
   - `https://go.singsinggolf.kr`
   - `http://localhost:3000` (개발용)

## 2. 환경 변수 설정

`.env.local` 파일에 추가:
```
NEXT_PUBLIC_KAKAO_APP_KEY=your_javascript_key_here
```

## 3. 카카오 SDK 추가

`app/layout.tsx`에 스크립트 추가:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* 카카오 SDK */}
        <script 
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4" 
          crossOrigin="anonymous"
          async
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 4. 공유 기능 최적화

### 모바일 환경별 동작:

#### 삼성폰 (Android)
- 카카오톡 앱이 설치된 경우: 카카오톡 앱으로 직접 공유
- 미설치: 웹 브라우저에서 카카오톡 공유 API 사용
- SMS 공유: `sms:` 프로토콜 지원

#### 아이폰 (iOS)
- 카카오톡 앱이 설치된 경우: 카카오톡 앱으로 직접 공유
- 미설치: 웹 브라우저에서 카카오톡 공유 API 사용
- SMS 공유: `sms:&body=` 형식 사용 (iOS는 `?` 대신 `&` 사용)

## 5. 공유 버튼 사용 예시

```tsx
// 카카오톡 공유
const shareViaKakao = (link: DocumentLink) => {
  const success = shareKakao({
    title: tour.title,
    description: '싱싱골프투어 문서를 확인하세요',
    link: getDocumentUrl(link)
  });
  
  if (!success) {
    // 폴백: 링크 복사
    navigator.clipboard.writeText(getDocumentUrl(link));
    alert('링크가 복사되었습니다.');
  }
};

// 네이티브 공유 (모바일)
const shareNative = async (link: DocumentLink) => {
  if (navigator.share) {
    await navigator.share({
      title: tour.title,
      text: '싱싱골프투어 문서',
      url: getDocumentUrl(link)
    });
  }
};
```

## 6. 공유 이미지 최적화

`public/share-image.png` 파일 추가 (권장 사이즈: 800x400px)
- 카카오톡 공유 시 표시될 이미지
- 싱싱골프투어 로고와 브랜드 컬러 사용

## 7. 테스트 방법

1. 개발 환경에서 테스트
   ```bash
   npm run dev
   ```

2. 모바일 디바이스에서 테스트
   - ngrok 사용하여 로컬 환경을 https로 노출
   ```bash
   ngrok http 3000
   ```

3. 실제 환경에서 테스트
   - 배포 후 실제 도메인에서 테스트

## 문제 해결

### 카카오톡 공유가 안 될 때
1. 카카오 앱 키가 올바른지 확인
2. 도메인이 카카오 앱에 등록되어 있는지 확인
3. SDK가 제대로 로드되었는지 확인 (`window.Kakao` 존재 여부)

### SMS 공유가 안 될 때
- iOS: `sms:&body=메시지내용`
- Android: `sms:?body=메시지내용`
- 일부 Android 기기: `sms://;?body=메시지내용`
