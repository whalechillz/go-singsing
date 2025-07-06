# 네이버 API 설정 가이드

## 1. 네이버 개발자 센터 접속
1. https://developers.naver.com 접속
2. 네이버 아이디로 로그인

## 2. 애플리케이션 등록
1. 상단 메뉴에서 "Application" → "애플리케이션 등록" 클릭
2. 애플리케이션 이름 입력 (예: "싱싱골프 관광지 검색")
3. 사용 API 선택:
   - 검색 (Search) 체크
   - 지역 (Local) 체크
   - 블로그 (Blog) 체크
   - 이미지 (Image) 체크

## 3. 환경 설정
1. 웹 서비스 URL 추가:
   - http://localhost:3000 (개발용)
   - https://go2.singsinggolf.kr (운영용)

## 4. API 키 확인
1. 애플리케이션 등록 완료 후 "내 애플리케이션" 페이지로 이동
2. Client ID와 Client Secret 확인

## 5. 환경 변수 설정
`.env.local` 파일에 다음 내용 추가:
```
NAVER_CLIENT_ID=발급받은_Client_ID
NAVER_CLIENT_SECRET=발급받은_Client_Secret
```

## 6. 서버 재시작
```bash
npm run dev
```

## 주의사항
- Client Secret은 절대 외부에 노출되면 안 됩니다
- Vercel 배포 시 환경 변수를 별도로 설정해야 합니다
- 일일 호출 제한: 25,000회 (무료)

## 문제 해결
1. "네이버 API 인증 정보가 없습니다" 에러
   - `.env.local` 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET이 제대로 설정되었는지 확인
   - 서버를 재시작했는지 확인

2. 401 Unauthorized 에러
   - Client ID와 Secret이 올바른지 확인
   - 애플리케이션에서 필요한 API 권한이 체크되어 있는지 확인

3. 검색 결과가 없음
   - 네이버에서 해당 검색어에 대한 결과가 실제로 있는지 확인
   - API 호출 제한에 걸렸는지 확인
